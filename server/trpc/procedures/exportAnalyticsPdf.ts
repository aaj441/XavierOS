import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";
import PDFDocument from "pdfkit";

export const exportAnalyticsPdf = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      days: z.number().default(30),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);

    // Fetch user's branding settings
    let branding = {
      logoUrl: null as string | null,
      primaryColor: "#6366F1",
      secondaryColor: "#8B5CF6",
      accentColor: "#EC4899",
    };

    const license = await db.license.findFirst({
      where: {
        customerId: user.id,
        status: "active",
        type: "white_label",
        brandingEnabled: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (license) {
      branding = {
        logoUrl: license.logoUrl,
        primaryColor: license.primaryColor || "#6366F1",
        secondaryColor: license.secondaryColor || "#8B5CF6",
        accentColor: license.accentColor || "#EC4899",
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);
    
    // Get all projects for the user
    const projects = await db.project.findMany({
      where: { ownerId: user.id },
      include: {
        urls: {
          include: {
            scans: {
              where: {
                startedAt: {
                  gte: startDate,
                },
              },
              include: {
                reports: true,
              },
            },
          },
        },
      },
    });
    
    // Calculate statistics (same logic as getAnalytics)
    let totalScans = 0;
    let completedScans = 0;
    let runningScans = 0;
    let errorScans = 0;
    let totalIssues = 0;
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;
    
    const scansByDate: Record<string, number> = {};
    const issuesByDate: Record<string, number> = {};
    const recentActivity: Array<{
      id: number;
      type: "scan_complete" | "scan_error" | "scan_started";
      projectName: string;
      url: string;
      timestamp: Date;
      riskScore?: number;
      totalIssues?: number;
    }> = [];
    
    projects.forEach((project) => {
      project.urls.forEach((url) => {
        url.scans.forEach((scan) => {
          totalScans++;
          
          const dateKey = scan.startedAt.toISOString().split("T")[0];
          scansByDate[dateKey] = (scansByDate[dateKey] || 0) + 1;
          
          if (scan.status === "completed") {
            completedScans++;
            
            if (scan.reports.length > 0) {
              const report = scan.reports[0];
              totalIssues += report.totalIssues;
              criticalIssues += report.criticalIssues;
              seriousIssues += report.seriousIssues;
              moderateIssues += report.moderateIssues;
              minorIssues += report.minorIssues;
              
              issuesByDate[dateKey] = (issuesByDate[dateKey] || 0) + report.totalIssues;
              
              recentActivity.push({
                id: scan.id,
                type: "scan_complete",
                projectName: project.name,
                url: url.url,
                timestamp: scan.finishedAt || scan.startedAt,
                riskScore: report.riskScore,
                totalIssues: report.totalIssues,
              });
            }
          } else if (scan.status === "running") {
            runningScans++;
            recentActivity.push({
              id: scan.id,
              type: "scan_started",
              projectName: project.name,
              url: url.url,
              timestamp: scan.startedAt,
            });
          } else if (scan.status === "error") {
            errorScans++;
            recentActivity.push({
              id: scan.id,
              type: "scan_error",
              projectName: project.name,
              url: url.url,
              timestamp: scan.finishedAt || scan.startedAt,
            });
          }
        });
      });
    });
    
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const averageIssuesPerScan = completedScans > 0 ? Math.round(totalIssues / completedScans) : 0;

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    
    // Collect PDF data in a buffer
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    // Header with branding
    if (branding.logoUrl) {
      try {
        // Fetch logo from Minio
        const logoResponse = await fetch(branding.logoUrl);
        if (logoResponse.ok) {
          const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
          doc.image(logoBuffer, 50, 40, { height: 40, align: "left" });
          doc.moveDown(3);
        }
      } catch (error) {
        console.error("Failed to load logo:", error);
        // Continue without logo
      }
    }

    doc.fontSize(24).fillColor(branding.primaryColor).text("Analytics Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#6B7280").text(`Period: Last ${input.days} days`, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);
    
    // Add a line separator
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Summary Statistics
    doc.fontSize(16).fillColor("#1F2937").text("Summary Statistics", { underline: true });
    doc.moveDown(0.5);
    
    const statsY = doc.y;
    const colWidth = 120;
    const rowHeight = 60;
    
    const stats = [
      { label: "Total Scans", value: totalScans.toString(), color: branding.primaryColor },
      { label: "Completed", value: completedScans.toString(), color: "#10B981" },
      { label: "Running", value: runningScans.toString(), color: branding.accentColor },
      { label: "Errors", value: errorScans.toString(), color: "#EF4444" },
      { label: "Total Issues", value: totalIssues.toString(), color: "#6B7280" },
      { label: "Avg Issues/Scan", value: averageIssuesPerScan.toString(), color: branding.secondaryColor },
    ];
    
    stats.forEach((stat, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = 50 + col * colWidth;
      const y = statsY + row * rowHeight;
      
      doc.rect(x, y, colWidth - 10, rowHeight - 10).fillAndStroke("#F9FAFB", "#E5E7EB");
      doc.fontSize(24).fillColor(stat.color).text(stat.value, x, y + 10, { width: colWidth - 10, align: "center" });
      doc.fontSize(9).fillColor("#6B7280").text(stat.label, x, y + 40, { width: colWidth - 10, align: "center" });
    });
    
    doc.y = statsY + Math.ceil(stats.length / 4) * rowHeight + 10;
    doc.moveDown(1.5);

    // Issue Distribution
    doc.fontSize(16).fillColor("#1F2937").text("Issue Distribution", { underline: true });
    doc.moveDown(0.5);
    
    if (totalIssues > 0) {
      const issueStats = [
        { label: "Critical", value: criticalIssues, color: "#DC2626" },
        { label: "Serious", value: seriousIssues, color: "#EA580C" },
        { label: "Moderate", value: moderateIssues, color: "#CA8A04" },
        { label: "Minor", value: minorIssues, color: "#2563EB" },
      ];
      
      issueStats.forEach((stat) => {
        const percentage = ((stat.value / totalIssues) * 100).toFixed(1);
        const barWidth = (stat.value / totalIssues) * 400;
        
        doc.fontSize(11).fillColor("#374151").text(`${stat.label}: ${stat.value} (${percentage}%)`, 60, doc.y);
        doc.moveDown(0.3);
        
        // Background bar
        doc.rect(60, doc.y, 400, 12).fillAndStroke("#E5E7EB", "#E5E7EB");
        // Colored bar
        if (barWidth > 0) {
          doc.rect(60, doc.y, barWidth, 12).fillAndStroke(stat.color, stat.color);
        }
        
        doc.moveDown(1);
      });
    } else {
      doc.fontSize(11).fillColor("#6B7280").text("No issues found in this period", 60, doc.y);
      doc.moveDown(1);
    }
    
    doc.moveDown(1);

    // Recent Activity
    if (doc.y > 600) {
      doc.addPage();
    }
    
    doc.fontSize(16).fillColor("#1F2937").text("Recent Activity", { underline: true });
    doc.moveDown(0.5);
    
    if (recentActivity.length > 0) {
      recentActivity.slice(0, 15).forEach((activity) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        let statusColor = "#6B7280";
        let statusText = "Started";
        
        if (activity.type === "scan_complete") {
          statusColor = "#10B981";
          statusText = "Completed";
        } else if (activity.type === "scan_error") {
          statusColor = "#EF4444";
          statusText = "Error";
        }
        
        doc.fontSize(10).fillColor(statusColor).text(`● ${statusText}`, 60, doc.y, { continued: true });
        doc.fillColor("#1F2937").text(` - ${activity.projectName}`, { continued: false });
        doc.fontSize(9).fillColor("#6B7280").text(activity.url, 70, doc.y);
        
        if (activity.type === "scan_complete" && activity.totalIssues !== undefined) {
          doc.text(`Found ${activity.totalIssues} issue${activity.totalIssues !== 1 ? 's' : ''} • Risk Score: ${activity.riskScore}`, 70, doc.y);
        }
        
        doc.fontSize(8).fillColor("#9CA3AF").text(activity.timestamp.toLocaleString(), 70, doc.y);
        doc.moveDown(0.8);
      });
    } else {
      doc.fontSize(11).fillColor("#6B7280").text("No recent activity", 60, doc.y);
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#9CA3AF").text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;
    
    // Upload to Minio
    const filename = `analytics-${user.id}-${Date.now()}.pdf`;
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      pdfBuffer,
      pdfBuffer.length,
      {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="analytics-report.pdf"`,
      }
    );
    
    return {
      filename,
      success: true,
    };
  });

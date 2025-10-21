import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { generateObject } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { env } from "~/server/env";

async function discoverSites(category: string, demographics: string | undefined, limit: number = 20): Promise<Array<{ url: string; title: string }>> {
  if (!env.SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY is not configured");
  }
  
  // Build search query
  let searchQuery = category;
  if (demographics) {
    searchQuery += ` ${demographics}`;
  }
  
  // Use Serper API for Google search
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: searchQuery,
      num: limit,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const results: Array<{ url: string; title: string }> = [];
  
  // Extract organic search results
  if (data.organic) {
    for (const result of data.organic) {
      if (result.link && result.title) {
        // Filter out major platforms and aggregators
        const url = result.link.toLowerCase();
        if (!url.includes('apple.com') && 
            !url.includes('wikipedia.org') && 
            !url.includes('youtube.com') &&
            !url.includes('facebook.com') &&
            !url.includes('twitter.com') &&
            !url.includes('linkedin.com')) {
          results.push({
            url: result.link,
            title: result.title,
          });
        }
      }
    }
  }
  
  return results.slice(0, limit);
}

function extractCompanyName(url: string, title: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Try to get a clean company name from the domain
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      const companyPart = domainParts[0];
      // Capitalize first letter
      return companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
    }
    
    // Fallback to title
    return title.split('|')[0].split('-')[0].trim();
  } catch {
    return title.split('|')[0].split('-')[0].trim();
  }
}

async function extractDecisionMakers(websiteUrl: string, companyName: string): Promise<Array<{ name: string; title: string; linkedinUrl?: string }>> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Try common pages where leadership info is found
    const pagesToTry = [
      websiteUrl,
      `${websiteUrl}/about`,
      `${websiteUrl}/about-us`,
      `${websiteUrl}/team`,
      `${websiteUrl}/leadership`,
      `${websiteUrl}/contact`,
    ];
    
    let pageContent = '';
    for (const pageUrl of pagesToTry) {
      try {
        await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15000 });
        const content = await page.content();
        pageContent += content + '\n';
        
        // If we found substantial content, break
        if (content.length > 5000) break;
      } catch {
        // Continue to next page if this one fails
        continue;
      }
    }
    
    await browser.close();
    browser = null;
    
    if (!pageContent) {
      return [];
    }
    
    // Use AI to extract decision-makers from the page content
    const model = openrouter("anthropic/claude-3.5-sonnet");
    
    const { object } = await generateObject({
      model,
      schema: z.object({
        leaders: z.array(z.object({
          name: z.string(),
          title: z.string(),
          linkedinUrl: z.string().optional(),
        })),
      }),
      prompt: `Analyze this website content for ${companyName} and extract information about key decision-makers (CEO, President, Owner, Director, Manager, etc.). Look for names, titles, and LinkedIn profile URLs. Focus on finding 3 key people in leadership positions. If LinkedIn URLs are not explicitly mentioned, leave them empty.

Website content:
${pageContent.slice(0, 15000)}

Return only the top 3 most senior decision-makers you can identify.`,
    });
    
    return object.leaders.slice(0, 3);
  } catch (error) {
    console.error(`Error extracting decision-makers for ${companyName}:`, error);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return [];
  }
}

async function integrateWithHubSpot(company: {
  name: string;
  website: string;
  riskScore: number;
  totalIssues: number;
}, leads: Array<{ name: string; title: string; linkedinUrl?: string }>): Promise<string> {
  if (!env.HUBSPOT_API_KEY) {
    throw new Error("HUBSPOT_API_KEY is not configured");
  }
  
  // Create company in HubSpot
  const companyResponse = await fetch("https://api.hubapi.com/crm/v3/objects/companies", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        name: company.name,
        domain: new URL(company.website).hostname.replace('www.', ''),
        website: company.website,
        accessibility_risk_score: company.riskScore,
        accessibility_issues_count: company.totalIssues,
        lead_source: "WCAG Shuffle Scan",
      },
    }),
  });
  
  if (!companyResponse.ok) {
    const error = await companyResponse.text();
    throw new Error(`HubSpot company creation error: ${error}`);
  }
  
  const companyData = await companyResponse.json();
  const hubspotCompanyId = companyData.id;
  
  // Create contacts for each decision-maker
  for (const lead of leads) {
    try {
      const contactResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            firstname: lead.name.split(' ')[0],
            lastname: lead.name.split(' ').slice(1).join(' ') || lead.name,
            jobtitle: lead.title,
            linkedin_url: lead.linkedinUrl || '',
            company: company.name,
          },
        }),
      });
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        
        // Associate contact with company
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactData.id}/associations/companies/${hubspotCompanyId}/280`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${env.HUBSPOT_API_KEY}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error(`Error creating HubSpot contact for ${lead.name}:`, error);
      // Continue with other contacts even if one fails
    }
  }
  
  return hubspotCompanyId;
}

export const startShuffle = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      category: z.string().min(1, "Category is required"),
      demographics: z.string().optional(),
      sitesToDiscover: z.number().min(1).max(50).default(20),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the project
    const project = await db.project.findUnique({
      where: { id: input.projectId },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to shuffle for this project",
      });
    }
    
    // Check if required APIs are configured
    if (!env.SERPER_API_KEY) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Shuffle feature requires SERPER_API_KEY to be configured",
      });
    }
    
    // Create shuffle session
    const session = await db.shuffleSession.create({
      data: {
        projectId: input.projectId,
        category: input.category,
        demographics: input.demographics,
        status: "running",
      },
    });
    
    // Run shuffle workflow asynchronously
    (async () => {
      try {
        // Step 1: Discover sites
        console.log(`[Shuffle ${session.id}] Discovering sites for category: ${input.category}`);
        const discoveredSites = await discoverSites(input.category, input.demographics, input.sitesToDiscover);
        
        await db.shuffleSession.update({
          where: { id: session.id },
          data: { totalSites: discoveredSites.length },
        });
        
        console.log(`[Shuffle ${session.id}] Found ${discoveredSites.length} sites`);
        
        // Step 2: Process each site
        for (const site of discoveredSites) {
          try {
            const companyName = extractCompanyName(site.url, site.title);
            
            // Create discovered company record
            const company = await db.discoveredCompany.create({
              data: {
                shuffleSessionId: session.id,
                companyName,
                websiteUrl: site.url,
                scanStatus: "pending",
              },
            });
            
            console.log(`[Shuffle ${session.id}] Processing ${companyName} (${site.url})`);
            
            // Add URL to project
            const urlRecord = await db.uRL.create({
              data: {
                projectId: input.projectId,
                url: site.url,
                status: "scanning",
              },
            });
            
            // Link company to URL
            await db.discoveredCompany.update({
              where: { id: company.id },
              data: { urlId: urlRecord.id, scanStatus: "scanning" },
            });
            
            // Step 3: Perform WCAG scan
            let browser;
            try {
              browser = await chromium.launch({ headless: true });
              const context = await browser.newContext();
              const page = await context.newPage();
              
              await page.goto(site.url, { waitUntil: "networkidle", timeout: 30000 });
              
              // Run axe-core scan
              const axeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag2aaa"]).analyze();
              
              await browser.close();
              browser = null;
              
              // Calculate compliance
              const violations = axeResults.violations.flatMap((v) =>
                v.nodes.map((node) => ({
                  code: v.id,
                  description: v.description,
                  severity: v.impact || "moderate",
                  risk: v.impact === "critical" || v.impact === "serious" ? "high" : v.impact === "moderate" ? "medium" : "low",
                  wcagLevel: v.tags.some(t => t.includes("wcag2aaa")) ? "AAA" : v.tags.some(t => t.includes("wcag2aa")) ? "AA" : "A",
                  element: node.html,
                  suggestion: `${v.help}. More info: ${v.helpUrl}`,
                }))
              );
              
              const criticalCount = violations.filter(v => v.severity === "critical").length;
              const seriousCount = violations.filter(v => v.severity === "serious").length;
              const moderateCount = violations.filter(v => v.severity === "moderate").length;
              const minorCount = violations.filter(v => v.severity === "minor").length;
              const totalIssues = violations.length;
              const riskScore = totalIssues > 0 
                ? Math.round((criticalCount * 10 + seriousCount * 7 + moderateCount * 4 + minorCount * 1) / totalIssues * 10)
                : 0;
              
              // Create scan record
              const scan = await db.scan.create({
                data: {
                  urlId: urlRecord.id,
                  status: "completed",
                  finishedAt: new Date(),
                  resultsJson: JSON.stringify({ totalViolations: violations.length }),
                },
              });
              
              // Create violations
              await Promise.all(
                violations.map((v) =>
                  db.violation.create({ data: { scanId: scan.id, ...v } })
                )
              );
              
              // Create report
              await db.report.create({
                data: {
                  scanId: scan.id,
                  summary: `Found ${totalIssues} accessibility issues`,
                  riskScore,
                  totalIssues,
                  criticalIssues: criticalCount,
                  seriousIssues: seriousCount,
                  moderateIssues: moderateCount,
                  minorIssues: minorCount,
                },
              });
              
              // Update URL status
              await db.uRL.update({
                where: { id: urlRecord.id },
                data: { status: "completed", lastScan: new Date() },
              });
              
              // Determine compliance (>70% risk = non-compliant)
              const isCompliant = riskScore < 70;
              
              await db.discoveredCompany.update({
                where: { id: company.id },
                data: {
                  scanStatus: "completed",
                  isCompliant,
                  riskScore,
                  totalIssues,
                  scannedAt: new Date(),
                },
              });
              
              // Update session stats
              const currentSession = await db.shuffleSession.findUnique({
                where: { id: session.id },
              });
              
              await db.shuffleSession.update({
                where: { id: session.id },
                data: {
                  scannedSites: (currentSession?.scannedSites || 0) + 1,
                  compliantSites: isCompliant ? (currentSession?.compliantSites || 0) + 1 : currentSession?.compliantSites,
                  nonCompliantSites: !isCompliant ? (currentSession?.nonCompliantSites || 0) + 1 : currentSession?.nonCompliantSites,
                },
              });
              
              console.log(`[Shuffle ${session.id}] ${companyName} scan complete. Risk: ${riskScore}, Compliant: ${isCompliant}`);
              
              // Step 4: If non-compliant, extract leads and integrate with HubSpot
              if (!isCompliant && riskScore >= 70) {
                console.log(`[Shuffle ${session.id}] ${companyName} is non-compliant. Extracting leads...`);
                
                // Extract decision-makers
                const leads = await extractDecisionMakers(site.url, companyName);
                
                if (leads.length > 0) {
                  // Save leads to database
                  await Promise.all(
                    leads.map((lead) =>
                      db.companyLead.create({
                        data: {
                          companyId: company.id,
                          name: lead.name,
                          title: lead.title,
                          linkedinUrl: lead.linkedinUrl,
                        },
                      })
                    )
                  );
                  
                  // Update session lead count
                  const updatedSession = await db.shuffleSession.findUnique({
                    where: { id: session.id },
                  });
                  
                  await db.shuffleSession.update({
                    where: { id: session.id },
                    data: {
                      leadsGenerated: (updatedSession?.leadsGenerated || 0) + leads.length,
                    },
                  });
                  
                  console.log(`[Shuffle ${session.id}] Extracted ${leads.length} leads for ${companyName}`);
                  
                  // Integrate with HubSpot if API key is configured
                  if (env.HUBSPOT_API_KEY) {
                    try {
                      const hubspotCompanyId = await integrateWithHubSpot(
                        {
                          name: companyName,
                          website: site.url,
                          riskScore,
                          totalIssues,
                        },
                        leads
                      );
                      
                      await db.hubSpotIntegration.create({
                        data: {
                          companyId: company.id,
                          hubspotCompanyId,
                          syncStatus: "synced",
                        },
                      });
                      
                      console.log(`[Shuffle ${session.id}] ${companyName} integrated with HubSpot (ID: ${hubspotCompanyId})`);
                    } catch (error) {
                      console.error(`[Shuffle ${session.id}] HubSpot integration failed for ${companyName}:`, error);
                      // Continue even if HubSpot fails
                    }
                  }
                }
              }
            } catch (scanError) {
              if (browser) {
                await browser.close().catch(() => {});
              }
              
              console.error(`[Shuffle ${session.id}] Scan error for ${companyName}:`, scanError);
              
              await db.discoveredCompany.update({
                where: { id: company.id },
                data: { scanStatus: "error" },
              });
              
              await db.uRL.update({
                where: { id: urlRecord.id },
                data: { status: "error" },
              });
            }
          } catch (siteError) {
            console.error(`[Shuffle ${session.id}] Error processing site ${site.url}:`, siteError);
            // Continue with next site
          }
        }
        
        // Mark session as completed
        await db.shuffleSession.update({
          where: { id: session.id },
          data: {
            status: "completed",
            finishedAt: new Date(),
          },
        });
        
        console.log(`[Shuffle ${session.id}] Completed successfully`);
      } catch (error) {
        console.error(`[Shuffle ${session.id}] Fatal error:`, error);
        
        await db.shuffleSession.update({
          where: { id: session.id },
          data: {
            status: "error",
            finishedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
          },
        });
      }
    })();
    
    return {
      sessionId: session.id,
      status: "running",
    };
  });

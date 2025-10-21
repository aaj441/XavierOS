import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const calculateLawsuitRisk = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch project with related data
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      include: {
        urls: {
          include: {
            scans: {
              where: { status: "completed" },
              orderBy: { startedAt: "desc" },
              take: 1,
              include: {
                violations: true,
                reports: true,
              },
            },
          },
        },
      },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this project",
      });
    }
    
    // Calculate violation-based risk score (0-100)
    let violationRiskScore = 0;
    let totalViolations = 0;
    let criticalCount = 0;
    let seriousCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    
    project.urls.forEach(url => {
      url.scans.forEach(scan => {
        scan.violations.forEach(violation => {
          totalViolations++;
          if (violation.severity === "critical") criticalCount++;
          else if (violation.severity === "serious") seriousCount++;
          else if (violation.severity === "moderate") moderateCount++;
          else if (violation.severity === "minor") minorCount++;
        });
      });
    });
    
    // Weighted violation score (critical issues are 10x worse than minor)
    const violationWeight = (criticalCount * 10) + (seriousCount * 7) + (moderateCount * 4) + (minorCount * 1);
    violationRiskScore = Math.min(100, Math.round((violationWeight / 50) * 100)); // Normalize to 0-100
    
    // Get industry risk data
    let industryRiskScore = 50; // Default medium risk
    let industryData = null;
    if (project.industry) {
      industryData = await db.industryLawsuitData.findUnique({
        where: { industry: project.industry },
      });
      
      if (industryData) {
        // Calculate risk based on lawsuit volume and growth
        const lawsuitGrowth = industryData.totalLawsuits2024 > 0
          ? ((industryData.totalLawsuits2025 - industryData.totalLawsuits2024) / industryData.totalLawsuits2024) * 100
          : 0;
        
        // Risk score based on volume and growth
        const volumeScore = Math.min(50, (industryData.totalLawsuits2025 / 100) * 50);
        const growthScore = Math.min(50, Math.max(0, lawsuitGrowth));
        industryRiskScore = Math.round(volumeScore + growthScore);
      }
    }
    
    // Get state risk data
    let stateRiskScore = 50; // Default medium risk
    let stateData = null;
    if (project.state) {
      stateData = await db.stateLitigationData.findUnique({
        where: { state: project.state },
      });
      
      if (stateData) {
        // Calculate risk based on lawsuits per capita and growth rate
        const volumeScore = Math.min(60, stateData.lawsuitsPerThousand * 10);
        const growthScore = Math.min(40, Math.max(0, stateData.growthRate));
        stateRiskScore = Math.round(volumeScore + growthScore);
      }
    }
    
    // Get company size risk data
    let companySizeRiskScore = 50; // Default medium risk
    let companySizeData = null;
    if (project.companySize) {
      companySizeData = await db.companySizeRiskData.findUnique({
        where: { sizeCategory: project.companySize },
      });
      
      if (companySizeData) {
        // Larger companies are targeted more frequently
        companySizeRiskScore = Math.round(companySizeData.targetingRate * 100);
      }
    }
    
    // Calculate overall risk score (weighted average)
    // Violations are most important (40%), then industry (25%), state (20%), company size (15%)
    const overallRiskScore = Math.round(
      (violationRiskScore * 0.40) +
      (industryRiskScore * 0.25) +
      (stateRiskScore * 0.20) +
      (companySizeRiskScore * 0.15)
    );
    
    // Calculate demand letter probability based on risk factors
    let demandLetterProbability = 0.05; // Base 5% probability
    
    if (industryData) {
      demandLetterProbability += industryData.demandLetterRate;
    }
    
    if (stateData && stateData.lawsuitsPerThousand > 0) {
      demandLetterProbability += (stateData.lawsuitsPerThousand / 100);
    }
    
    if (companySizeData) {
      demandLetterProbability += companySizeData.lawsuitProbability;
    }
    
    // Violations significantly increase probability
    if (criticalCount > 0) {
      demandLetterProbability += 0.15;
    }
    if (seriousCount > 5) {
      demandLetterProbability += 0.10;
    }
    
    demandLetterProbability = Math.min(0.95, demandLetterProbability); // Cap at 95%
    
    // Calculate lawsuit probability (lower than demand letter)
    const lawsuitProbability = demandLetterProbability * 0.3; // About 30% of demand letters become lawsuits
    
    // Calculate cost estimates
    const baseSettlement = 12500; // Average settlement
    const baseLegalFees = 20000; // Average legal fees
    const baseRemediation = 5000; // Base remediation cost
    
    // Adjust costs based on violations
    const violationMultiplier = 1 + (criticalCount * 0.2) + (seriousCount * 0.1);
    
    const estimatedSettlementCost = Math.round(
      (industryData?.averageSettlement || baseSettlement) * violationMultiplier
    );
    
    const estimatedLegalFees = Math.round(
      (industryData?.averageLegalFees || baseLegalFees) * violationMultiplier
    );
    
    const estimatedRemediationCost = Math.round(
      baseRemediation + (totalViolations * 100)
    );
    
    const totalExposure = estimatedSettlementCost + estimatedLegalFees + estimatedRemediationCost;
    
    // Save the risk assessment
    const assessment = await db.legalRiskAssessment.create({
      data: {
        projectId: project.id,
        overallRiskScore,
        industryRiskScore,
        stateRiskScore,
        companySizeRiskScore,
        violationRiskScore,
        demandLetterProbability,
        lawsuitProbability,
        estimatedSettlementCost,
        estimatedLegalFees,
        estimatedRemediationCost,
        totalExposure,
      },
    });
    
    // Get risk level label
    const getRiskLevel = (score: number): string => {
      if (score >= 80) return "Critical";
      if (score >= 60) return "High";
      if (score >= 40) return "Medium";
      return "Low";
    };
    
    return {
      assessment: {
        id: assessment.id,
        overallRiskScore,
        riskLevel: getRiskLevel(overallRiskScore),
        calculatedAt: assessment.calculatedAt,
      },
      riskComponents: {
        violations: {
          score: violationRiskScore,
          total: totalViolations,
          critical: criticalCount,
          serious: seriousCount,
          moderate: moderateCount,
          minor: minorCount,
        },
        industry: {
          score: industryRiskScore,
          name: project.industry || "Not specified",
          data: industryData,
        },
        state: {
          score: stateRiskScore,
          code: project.state || "Not specified",
          data: stateData,
        },
        companySize: {
          score: companySizeRiskScore,
          category: project.companySize || "Not specified",
          data: companySizeData,
        },
      },
      probabilities: {
        demandLetter: demandLetterProbability,
        lawsuit: lawsuitProbability,
      },
      costEstimates: {
        settlement: estimatedSettlementCost,
        legalFees: estimatedLegalFees,
        remediation: estimatedRemediationCost,
        totalExposure,
      },
      comparison: {
        lucyAnnualCost: 2388, // Professional tier at $199/mo
        potentialSavings: totalExposure - 2388,
        roi: Math.round(((totalExposure - 2388) / 2388) * 100),
      },
    };
  });

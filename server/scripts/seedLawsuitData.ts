import { db } from "~/server/db";

export async function seedLawsuitData() {
  console.log("Seeding lawsuit data...");
  
  // Seed industry data based on research
  const industries = [
    {
      industry: "retail",
      totalLawsuits2024: 2200,
      totalLawsuits2025: 2350,
      averageSettlement: 13500,
      averageLegalFees: 21000,
      demandLetterRate: 0.31,
      riskLevel: "high",
      commonViolations: JSON.stringify([
        "color-contrast",
        "image-alt",
        "form-label",
        "link-name",
        "button-name"
      ]),
    },
    {
      industry: "healthcare",
      totalLawsuits2024: 1800,
      totalLawsuits2025: 1950,
      averageSettlement: 15000,
      averageLegalFees: 23000,
      demandLetterRate: 0.28,
      riskLevel: "high",
      commonViolations: JSON.stringify([
        "form-label",
        "color-contrast",
        "aria-required-attr",
        "image-alt",
        "heading-order"
      ]),
    },
    {
      industry: "hospitality",
      totalLawsuits2024: 1500,
      totalLawsuits2025: 1620,
      averageSettlement: 12000,
      averageLegalFees: 19000,
      demandLetterRate: 0.25,
      riskLevel: "high",
      commonViolations: JSON.stringify([
        "image-alt",
        "link-name",
        "color-contrast",
        "form-label",
        "button-name"
      ]),
    },
    {
      industry: "finance",
      totalLawsuits2024: 1200,
      totalLawsuits2025: 1450,
      averageSettlement: 16000,
      averageLegalFees: 24000,
      demandLetterRate: 0.22,
      riskLevel: "high",
      commonViolations: JSON.stringify([
        "color-contrast",
        "form-label",
        "aria-required-attr",
        "link-name",
        "button-name"
      ]),
    },
    {
      industry: "ecommerce",
      totalLawsuits2024: 2500,
      totalLawsuits2025: 2675,
      averageSettlement: 14000,
      averageLegalFees: 22000,
      demandLetterRate: 0.35,
      riskLevel: "critical",
      commonViolations: JSON.stringify([
        "image-alt",
        "button-name",
        "link-name",
        "color-contrast",
        "form-label"
      ]),
    },
    {
      industry: "education",
      totalLawsuits2024: 800,
      totalLawsuits2025: 860,
      averageSettlement: 11000,
      averageLegalFees: 18000,
      demandLetterRate: 0.18,
      riskLevel: "medium",
      commonViolations: JSON.stringify([
        "heading-order",
        "color-contrast",
        "image-alt",
        "link-name",
        "form-label"
      ]),
    },
    {
      industry: "technology",
      totalLawsuits2024: 600,
      totalLawsuits2025: 680,
      averageSettlement: 10500,
      averageLegalFees: 17000,
      demandLetterRate: 0.15,
      riskLevel: "medium",
      commonViolations: JSON.stringify([
        "color-contrast",
        "aria-required-attr",
        "button-name",
        "link-name",
        "form-label"
      ]),
    },
    {
      industry: "other",
      totalLawsuits2024: 1200,
      totalLawsuits2025: 1280,
      averageSettlement: 12500,
      averageLegalFees: 20000,
      demandLetterRate: 0.20,
      riskLevel: "medium",
      commonViolations: JSON.stringify([
        "color-contrast",
        "image-alt",
        "link-name",
        "form-label",
        "button-name"
      ]),
    },
  ];
  
  for (const industryData of industries) {
    await db.industryLawsuitData.upsert({
      where: { industry: industryData.industry },
      update: industryData,
      create: industryData,
    });
  }
  
  console.log(`Seeded ${industries.length} industries`);
  
  // Seed state litigation data based on research
  const states = [
    {
      state: "CA",
      stateName: "California",
      totalLawsuits2024: 2372,
      totalLawsuits2025: 3252,
      growthRate: 37.0,
      lawsuitsPerThousand: 0.082,
      averageSettlement: 14000,
      averageLegalFees: 22000,
      riskLevel: "critical",
      topLawFirms: JSON.stringify([
        "Potter Handy LLP",
        "Carlson Lynch",
        "Center for Disability Access"
      ]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "NY",
      stateName: "New York",
      totalLawsuits2024: 1950,
      totalLawsuits2025: 2220,
      growthRate: 13.8,
      lawsuitsPerThousand: 0.068,
      averageSettlement: 13500,
      averageLegalFees: 21000,
      riskLevel: "critical",
      topLawFirms: JSON.stringify([
        "Gottlieb & Associates",
        "Mars & Associates",
        "Mizrahi Kroub LLP"
      ]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "FL",
      stateName: "Florida",
      totalLawsuits2024: 420,
      totalLawsuits2025: 487,
      growthRate: 16.0,
      lawsuitsPerThousand: 0.023,
      averageSettlement: 12000,
      averageLegalFees: 19000,
      riskLevel: "high",
      topLawFirms: JSON.stringify([
        "Advocacy Law Group",
        "Scott Law Team"
      ]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "IL",
      stateName: "Illinois",
      totalLawsuits2024: 85,
      totalLawsuits2025: 718,
      growthRate: 745.0,
      lawsuitsPerThousand: 0.057,
      averageSettlement: 13000,
      averageLegalFees: 20000,
      riskLevel: "critical",
      topLawFirms: JSON.stringify([
        "Stein Saks PLLC"
      ]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "PA",
      stateName: "Pennsylvania",
      totalLawsuits2024: 350,
      totalLawsuits2025: 410,
      growthRate: 17.1,
      lawsuitsPerThousand: 0.032,
      averageSettlement: 12500,
      averageLegalFees: 20000,
      riskLevel: "high",
      topLawFirms: JSON.stringify([]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "TX",
      stateName: "Texas",
      totalLawsuits2024: 280,
      totalLawsuits2025: 320,
      growthRate: 14.3,
      lawsuitsPerThousand: 0.011,
      averageSettlement: 11500,
      averageLegalFees: 18000,
      riskLevel: "medium",
      topLawFirms: JSON.stringify([]),
      recentActivity: JSON.stringify([]),
    },
    {
      state: "NJ",
      stateName: "New Jersey",
      totalLawsuits2024: 310,
      totalLawsuits2025: 365,
      growthRate: 17.7,
      lawsuitsPerThousand: 0.041,
      averageSettlement: 13000,
      averageLegalFees: 20500,
      riskLevel: "high",
      topLawFirms: JSON.stringify([]),
      recentActivity: JSON.stringify([]),
    },
  ];
  
  for (const stateData of states) {
    await db.stateLitigationData.upsert({
      where: { state: stateData.state },
      update: stateData,
      create: stateData,
    });
  }
  
  console.log(`Seeded ${states.length} states`);
  
  // Seed company size risk data
  const companySizes = [
    {
      sizeCategory: "small",
      targetingRate: 0.35,
      averageSettlement: 10000,
      averageLegalFees: 16000,
      revenueThreshold: "under_1m",
      lawsuitProbability: 0.08,
    },
    {
      sizeCategory: "medium",
      targetingRate: 0.48,
      averageSettlement: 12500,
      averageLegalFees: 20000,
      revenueThreshold: "1m_25m",
      lawsuitProbability: 0.15,
    },
    {
      sizeCategory: "large",
      targetingRate: 0.62,
      averageSettlement: 15000,
      averageLegalFees: 23000,
      revenueThreshold: "25m_plus",
      lawsuitProbability: 0.22,
    },
    {
      sizeCategory: "enterprise",
      targetingRate: 0.75,
      averageSettlement: 18000,
      averageLegalFees: 27000,
      revenueThreshold: "25m_plus",
      lawsuitProbability: 0.28,
    },
  ];
  
  for (const sizeData of companySizes) {
    await db.companySizeRiskData.upsert({
      where: { sizeCategory: sizeData.sizeCategory },
      update: sizeData,
      create: sizeData,
    });
  }
  
  console.log(`Seeded ${companySizes.length} company size categories`);
  console.log("Lawsuit data seeding complete!");
}

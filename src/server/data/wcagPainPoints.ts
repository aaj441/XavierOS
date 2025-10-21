/**
 * WCAG Compliance Pain Points Data
 * Used for Lucy's email generation, sales materials, and reporting
 */

export interface PainPoint {
  id: number;
  title: string;
  shortTitle: string;
  category: 'legal' | 'financial' | 'reputation' | 'technical' | 'competitive';
  severity: 'critical' | 'high' | 'medium';
  avgCost: {
    min: number;
    max: number;
    currency: string;
  };
  affectedIndustries: string[];
  statistics: Array<{
    stat: string;
    source: string;
    year: number;
  }>;
  realCases: Array<{
    company: string;
    year: number;
    outcome: string;
    cost: number;
  }>;
  urgencyScore: number; // 1-10
  description: string;
  businessImpact: string;
  lucySolution: string;
}

export const PAIN_POINTS: PainPoint[] = [
  {
    id: 1,
    title: 'Devastating Legal Liability',
    shortTitle: 'Legal Risk',
    category: 'legal',
    severity: 'critical',
    avgCost: {
      min: 50000,
      max: 6000000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: '23,000+ ADA website lawsuits filed in 2023',
        source: 'UsableNet',
        year: 2023
      },
      {
        stat: '300% increase in lawsuits since 2020',
        source: 'ADA Title III',
        year: 2023
      },
      {
        stat: 'Average settlement: $75,000-$150,000',
        source: 'Seyfarth Shaw',
        year: 2023
      }
    ],
    realCases: [
      {
        company: "Domino's Pizza",
        year: 2019,
        outcome: 'Supreme Court declined to hear - precedent set',
        cost: 4700000
      },
      {
        company: 'Winn-Dixie',
        year: 2017,
        outcome: '$100K damages + $250K legal fees',
        cost: 350000
      },
      {
        company: 'Target Corporation',
        year: 2008,
        outcome: 'Class action settlement',
        cost: 6000000
      }
    ],
    urgencyScore: 10,
    description: 'ADA Title III lawsuits are exploding, with courts consistently ruling that websites must be accessible. Average settlements exceed $75K, not including legal defense costs of $50K-$300K.',
    businessImpact: 'One lawsuit can cost $125K-$450K in settlements and legal fees. Multiple lawsuits or class actions can exceed $1M-$6M. Insurance often won\'t cover accessibility-related claims.',
    lucySolution: 'Proactively identify issues before lawsuits, generate legal documentation showing good faith effort, create defensible compliance roadmaps.'
  },
  {
    id: 2,
    title: 'Losing 26% of Potential Customers',
    shortTitle: 'Revenue Loss',
    category: 'financial',
    severity: 'critical',
    avgCost: {
      min: 2000000,
      max: 8000000,
      currency: 'USD'
    },
    affectedIndustries: ['retail', 'e-commerce', 'hospitality', 'entertainment', 'technology'],
    statistics: [
      {
        stat: '1.3 billion people worldwide have disabilities (16% of population)',
        source: 'WHO',
        year: 2023
      },
      {
        stat: '71% of disabled users leave inaccessible sites immediately',
        source: 'Click-Away Pound Survey',
        year: 2019
      },
      {
        stat: '$13 trillion global spending power (including families)',
        source: 'Return on Disability',
        year: 2023
      }
    ],
    realCases: [
      {
        company: 'Legal & General',
        year: 2018,
        outcome: '20% sales increase after accessibility improvements',
        cost: -2000000 // negative = revenue gain
      }
    ],
    urgencyScore: 9,
    description: '26% of US adults have disabilities, representing massive purchasing power. Inaccessible sites lose these customers immediately, plus their families and networks.',
    businessImpact: 'Average e-commerce site loses $2M-8M annually in revenue from accessibility barriers. Accessible competitors capture this market share.',
    lucySolution: 'Quantify lost revenue per barrier type, show conversion funnel leakage, project revenue recovery from accessibility fixes.'
  },
  {
    id: 3,
    title: 'Search Engine Penalties & Lost Organic Traffic',
    shortTitle: 'SEO Impact',
    category: 'technical',
    severity: 'high',
    avgCost: {
      min: 100000,
      max: 1000000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: '96.3% of home pages have WCAG failures',
        source: 'WebAIM Million',
        year: 2024
      },
      {
        stat: 'Average 57.4 errors per page',
        source: 'WebAIM Million',
        year: 2024
      },
      {
        stat: 'Accessible sites rank 2.5x higher on average',
        source: 'Independent Analysis',
        year: 2023
      }
    ],
    realCases: [],
    urgencyScore: 7,
    description: 'Google penalizes inaccessible sites in search rankings. Alt text, semantic HTML, keyboard navigation all affect SEO. Bounce rates from disabled users hurt all rankings.',
    businessImpact: 'Lost organic traffic worth $100K-$1M annually. Competitors with accessible sites appear first in search results.',
    lucySolution: 'SEO impact analysis, accessibility-SEO gap reporting, traffic recovery projections, competitive accessibility benchmarking.'
  },
  {
    id: 4,
    title: 'Enterprise Procurement Exclusion',
    shortTitle: 'B2B Loss',
    category: 'competitive',
    severity: 'critical',
    avgCost: {
      min: 500000,
      max: 50000000,
      currency: 'USD'
    },
    affectedIndustries: ['technology', 'saas', 'consulting', 'services'],
    statistics: [
      {
        stat: '89% of Fortune 500 require vendor accessibility statements',
        source: 'Enterprise Procurement Survey',
        year: 2023
      },
      {
        stat: '73% conduct accessibility audits before contracts',
        source: 'Gartner',
        year: 2023
      },
      {
        stat: '$50B+ federal procurement requires Section 508',
        source: 'US Government',
        year: 2023
      }
    ],
    realCases: [
      {
        company: 'Multiple SaaS vendors',
        year: 2023,
        outcome: 'Disqualified from Microsoft procurement',
        cost: 5000000
      }
    ],
    urgencyScore: 9,
    description: 'Major enterprises and all government agencies mandate accessibility. No VPAT = automatic disqualification. Lost contracts worth millions.',
    businessImpact: 'Single enterprise contract can be worth $50K-$50M. Without accessibility, entire market segments (education, government, healthcare, Fortune 500) become inaccessible.',
    lucySolution: 'VPAT generation, compliance documentation, procurement-ready reports, enterprise audit preparation.'
  },
  {
    id: 5,
    title: 'Brand Reputation & PR Disasters',
    shortTitle: 'PR Risk',
    category: 'reputation',
    severity: 'high',
    avgCost: {
      min: 200000,
      max: 2000000,
      currency: 'USD'
    },
    affectedIndustries: ['consumer', 'retail', 'technology', 'entertainment'],
    statistics: [
      {
        stat: '79% of consumers prefer inclusive brands',
        source: 'Microsoft Study',
        year: 2023
      },
      {
        stat: '54% have boycotted brands for poor accessibility',
        source: 'Accenture',
        year: 2022
      },
      {
        stat: 'Takes 7 years to rebuild trust after accessibility failure',
        source: 'Brand Recovery Study',
        year: 2021
      }
    ],
    realCases: [
      {
        company: 'Peloton',
        year: 2021,
        outcome: 'Boycott, stock dropped 11%, emergency accessibility team',
        cost: 500000
      },
      {
        company: 'United Airlines',
        year: 2019,
        outcome: 'DOT investigation, media coverage',
        cost: 3000000
      }
    ],
    urgencyScore: 8,
    description: 'One accessibility failure can go viral on social media. Disability advocates are vocal. Boycotts hurt sales and stock prices.',
    businessImpact: 'PR disasters cost $200K-2M in recovery efforts. Lost customer trust takes years to rebuild. ESG scores drop, affecting valuations.',
    lucySolution: 'Proactive monitoring, quick-fix prioritization, positive PR opportunities, advocacy group relationship building.'
  },
  {
    id: 6,
    title: 'Healthcare & Insurance Industry Mandates',
    shortTitle: 'Healthcare Risk',
    category: 'legal',
    severity: 'critical',
    avgCost: {
      min: 50000,
      max: 20000000,
      currency: 'USD'
    },
    affectedIndustries: ['healthcare', 'insurance', 'telemedicine', 'pharma'],
    statistics: [
      {
        stat: 'HIPAA + WCAG compliance required for patient portals',
        source: 'OCR',
        year: 2023
      },
      {
        stat: '$100K+ per violation possible',
        source: 'HHS',
        year: 2023
      }
    ],
    realCases: [
      {
        company: 'CVS Pharmacy',
        year: 2023,
        outcome: '$20M settlement, complete rebuild',
        cost: 20000000
      },
      {
        company: 'Anthem',
        year: 2022,
        outcome: 'OCR investigation, $500K penalties',
        cost: 500000
      }
    ],
    urgencyScore: 10,
    description: 'Healthcare has the strictest enforcement. OCR actively investigates. Life-critical information must be accessible. Patient harm = higher damages.',
    businessImpact: 'Healthcare violations can reach $20M. Multiple regulatory bodies watching. Privacy + accessibility = double compliance burden.',
    lucySolution: 'HIPAA + WCAG compliance mapping, healthcare-specific prioritization, regulatory reporting templates, patient safety impact assessment.'
  },
  {
    id: 7,
    title: 'Educational Institution Requirements (OCR Enforcement)',
    shortTitle: 'Education Risk',
    category: 'legal',
    severity: 'high',
    avgCost: {
      min: 100000,
      max: 5000000,
      currency: 'USD'
    },
    affectedIndustries: ['education', 'edtech', 'publishing', 'lms'],
    statistics: [
      {
        stat: 'Single student complaint can trigger OCR investigation',
        source: 'OCR',
        year: 2023
      },
      {
        stat: 'Average university remediation cost: $2-5M',
        source: 'EDUCAUSE',
        year: 2022
      }
    ],
    realCases: [
      {
        company: 'UC Berkeley',
        year: 2017,
        outcome: 'Pulled 20,000+ videos rather than caption',
        cost: 2300000
      },
      {
        company: 'Florida State University',
        year: 2020,
        outcome: 'Document/video remediation',
        cost: 4800000
      }
    ],
    urgencyScore: 8,
    description: 'OCR investigates education aggressively. Must remediate entire digital presence: websites, LMS, videos, PDFs, third-party tools.',
    businessImpact: 'Full campus remediation: $2M-5M. Ongoing maintenance: $200K-500K annually. EdTech vendors lose institutional contracts.',
    lucySolution: 'Campus-wide audits, third-party tool assessment, OCR compliance documentation, student accommodation readiness scoring.'
  },
  {
    id: 8,
    title: 'E-Commerce Conversion Rate Killers',
    shortTitle: 'Cart Abandonment',
    category: 'financial',
    severity: 'high',
    avgCost: {
      min: 500000,
      max: 13000000,
      currency: 'USD'
    },
    affectedIndustries: ['e-commerce', 'retail', 'marketplace'],
    statistics: [
      {
        stat: '98.1% of e-commerce sites have accessibility errors',
        source: 'WebAIM',
        year: 2024
      },
      {
        stat: '67% higher cart abandonment for disabled users',
        source: 'Baymard Institute',
        year: 2023
      },
      {
        stat: 'Average e-commerce site loses $6.9M annually',
        source: 'Click-Away Pound',
        year: 2019
      }
    ],
    realCases: [
      {
        company: 'Anonymous UK Retailer',
        year: 2021,
        outcome: 'Cart abandonment dropped from 67% to 23%, +$13M revenue',
        cost: -13000000
      }
    ],
    urgencyScore: 9,
    description: 'Accessibility barriers cause massive cart abandonment. Inaccessible checkouts lose 47% of customers at the finish line.',
    businessImpact: 'Average e-commerce site loses $500K-$13M annually. Accessible checkout increases conversion by 21% across all users.',
    lucySolution: 'Conversion funnel analysis with accessibility overlay, revenue loss calculator, checkout optimization priorities, A/B testing framework.'
  },
  {
    id: 9,
    title: 'Mobile Accessibility Crisis',
    shortTitle: 'Mobile Issues',
    category: 'technical',
    severity: 'high',
    avgCost: {
      min: 300000,
      max: 2000000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: '60% of web traffic is mobile',
        source: 'StatCounter',
        year: 2024
      },
      {
        stat: '67% of mobile sites disable zoom (WCAG violation)',
        source: 'WebAIM',
        year: 2023
      },
      {
        stat: '89% of mobile apps fail basic screen reader tests',
        source: 'Mobile Accessibility Report',
        year: 2023
      }
    ],
    realCases: [
      {
        company: 'Multiple Banking Apps',
        year: 2022,
        outcome: 'Chase, Wells Fargo, BofA sued for inaccessible apps',
        cost: 500000
      }
    ],
    urgencyScore: 8,
    description: 'Mobile-first indexing means inaccessible mobile sites hurt SEO. Touch targets too small, zoom disabled, screen readers broken.',
    businessImpact: 'Mobile revenue loss: $300K-$2M annually. App store rankings affected. 40% lower conversions for disabled mobile users.',
    lucySolution: 'Mobile-specific WCAG analysis, touch target heat maps, responsive design audit, app accessibility testing (iOS & Android).'
  },
  {
    id: 10,
    title: 'Cognitive Accessibility - The Invisible Crisis',
    shortTitle: 'Cognitive Barriers',
    category: 'technical',
    severity: 'high',
    avgCost: {
      min: 200000,
      max: 800000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: '700M people worldwide have dyslexia',
        source: 'IDA',
        year: 2023
      },
      {
        stat: '366M people have ADHD',
        source: 'WHO',
        year: 2023
      },
      {
        stat: '60% of support calls related to usability',
        source: 'Forrester',
        year: 2022
      }
    ],
    realCases: [
      {
        company: 'UK Government Digital Service',
        year: 2019,
        outcome: 'Simplified language reduced support calls 58%, saved £50M',
        cost: -50000000
      }
    ],
    urgencyScore: 7,
    description: 'Cognitive disabilities affect more people than physical disabilities. Complex language, information overload, confusing navigation, time pressures.',
    businessImpact: 'Support costs: $180K-300K annually. Form abandonment: 38%. Cognitively accessible sites reduce support calls 40%.',
    lucySolution: 'Cognitive accessibility checklist, reading level analysis, interaction complexity scoring, WCAG 2.2 cognitive criteria compliance.'
  },
  {
    id: 11,
    title: 'International Market Exclusion',
    shortTitle: 'Global Barriers',
    category: 'competitive',
    severity: 'high',
    avgCost: {
      min: 1000000,
      max: 10000000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: 'European Accessibility Act: June 2025 deadline',
        source: 'EU',
        year: 2024
      },
      {
        stat: 'Penalties: Up to 4% of global revenue',
        source: 'EAA',
        year: 2025
      },
      {
        stat: '$440B e-commerce spending by disabled users globally',
        source: 'Return on Disability',
        year: 2023
      }
    ],
    realCases: [
      {
        company: 'British Airways',
        year: 2019,
        outcome: '£35,000 settlement, 18-month rebuild',
        cost: 350000
      },
      {
        company: 'Coles Supermarkets (Australia)',
        year: 2014,
        outcome: '$15M AUD estimated fix cost',
        cost: 15000000
      }
    ],
    urgencyScore: 9,
    description: 'EU, UK, Canada, Australia all have accessibility laws. US companies expanding internationally must comply. EAA 2025 deadline approaching.',
    businessImpact: 'EU market closed if not EAA compliant by 2025. Lost expansion opportunities: $1M-10M. 3-5x higher cost to fix after launch.',
    lucySolution: 'Multi-jurisdiction compliance checker, EAA readiness assessment, international market risk analysis.'
  },
  {
    id: 12,
    title: 'Insurance, Compliance, and Audit Nightmares',
    shortTitle: 'Compliance Burden',
    category: 'legal',
    severity: 'high',
    avgCost: {
      min: 50000,
      max: 300000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: 'Cyber insurance now excludes accessibility claims',
        source: 'Insurance Industry',
        year: 2023
      },
      {
        stat: 'Premium increases of 20-40% for non-compliant sites',
        source: 'Marsh',
        year: 2023
      },
      {
        stat: '85% of businesses settle serial plaintiff lawsuits',
        source: 'Legal Analytics',
        year: 2023
      }
    ],
    realCases: [],
    urgencyScore: 7,
    description: 'Insurance won\'t cover accessibility lawsuits. Must maintain VPAT/ACR documentation. Serial plaintiffs target specific industries.',
    businessImpact: 'Audit costs: $5K-50K annually. Insurance premiums up 20-40%. Serial plaintiff settlements: $5K-15K each.',
    lucySolution: 'Auto-generated VPAT/ACR, insurance questionnaire ready, continuous monitoring, serial plaintiff avoidance.'
  },
  {
    id: 13,
    title: 'Competitive Disadvantage & Market Share Loss',
    shortTitle: 'Market Loss',
    category: 'competitive',
    severity: 'critical',
    avgCost: {
      min: 500000,
      max: 5000000,
      currency: 'USD'
    },
    affectedIndustries: ['all'],
    statistics: [
      {
        stat: 'Early accessibility adopters see 15-30% market share gains',
        source: 'Forrester',
        year: 2023
      },
      {
        stat: '76% of job seekers consider company values',
        source: 'LinkedIn',
        year: 2023
      },
      {
        stat: '$35 trillion in ESG-focused investments',
        source: 'Bloomberg',
        year: 2023
      }
    ],
    realCases: [],
    urgencyScore: 9,
    description: 'Competitors with accessible sites win market share. Top talent avoids non-inclusive companies. ESG investors demand accessibility.',
    businessImpact: 'Lost market share to accessible competitors: $500K-5M annually. Talent acquisition costs up. ESG scores reduce valuation 8-12%.',
    lucySolution: 'Competitive accessibility benchmarking, gap analysis vs. industry leaders, market share impact modeling, ESG reporting package.'
  }
];

export const getPainPointsByIndustry = (industry: string): PainPoint[] => {
  return PAIN_POINTS.filter(
    pp => pp.affectedIndustries.includes('all') || pp.affectedIndustries.includes(industry)
  ).sort((a, b) => b.urgencyScore - a.urgencyScore);
};

export const getTopPainPoints = (limit: number = 5): PainPoint[] => {
  return [...PAIN_POINTS]
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, limit);
};

export const getTotalPotentialCost = (painPoints: PainPoint[]): {
  conservative: number;
  moderate: number;
  worstCase: number;
} => {
  const conservative = painPoints.reduce((sum, pp) => sum + pp.avgCost.min, 0);
  const moderate = painPoints.reduce((sum, pp) => sum + (pp.avgCost.min + pp.avgCost.max) / 2, 0);
  const worstCase = painPoints.reduce((sum, pp) => sum + pp.avgCost.max, 0);
  
  return { conservative, moderate, worstCase };
};

export const generatePainPointEmail = (
  companyName: string,
  industry: string,
  wcagIssueCount: number,
  painPointIds: number[]
): string => {
  const selectedPainPoints = PAIN_POINTS.filter(pp => painPointIds.includes(pp.id));
  const costs = getTotalPotentialCost(selectedPainPoints);
  
  return `Subject: ${wcagIssueCount} Critical Accessibility Issues Found - ${companyName}

Hi [First Name],

I recently analyzed ${companyName}'s website and discovered ${wcagIssueCount} WCAG compliance issues that are putting your business at significant risk.

**Why This Matters:**

${selectedPainPoints.slice(0, 3).map((pp, idx) => `
${idx + 1}. **${pp.shortTitle}**: ${pp.businessImpact}
`).join('')}

**Your Estimated Annual Risk:**
- Conservative: $${(costs.conservative / 1000000).toFixed(1)}M
- Moderate: $${(costs.moderate / 1000000).toFixed(1)}M  
- Worst-case: $${(costs.worstCase / 1000000).toFixed(1)}M

I've prepared a detailed visual report showing exactly where these issues appear on your site. The good news? Most can be fixed quickly with the right approach.

**What I Can Do:**
✓ Show you the specific barriers (with screenshots)
✓ Prioritize fixes by business impact
✓ Provide a realistic remediation roadmap
✓ Help you avoid the costly mistakes I've seen others make

Are you available for a 15-minute call this week? I'll walk you through the findings and answer any questions.

Best regards,
[Your Name]
[Your Company]

P.S. With ${selectedPainPoints[0].statistics[0].stat}, the time to act is now. Every day of delay increases your risk exposure.`;
};


# Lucy Integration Architecture
## Gmail/Outlook, HubSpot, and Google Maps Integration Specifications

---

## Overview

The three lynchpin integrations that make Lucy powerful:

1. **Google Maps API** - Find and qualify US-based businesses by vertical/location
2. **HubSpot CRM** - Enrich, manage, and track leads through the sales funnel
3. **Gmail/Outlook** - Send personalized outreach emails with tracking

---

## 🗺️ Integration #1: Google Maps API (Business Discovery)

### Purpose
Find US-based small and medium businesses in specific industries and locations, extracting their website URLs for WCAG analysis.

### API Products Required

**Google Maps Platform APIs:**
- **Places API (New)** - Primary search and business details
- **Places API (Text Search)** - Backup search method
- **Geocoding API** - Convert addresses to coordinates
- **Maps JavaScript API** - Optional UI for location selection

### Pricing Structure

**Google Maps API Pricing (2024):**
```
Places API (New):
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests (Basic)
- Place Details: $24 per 1,000 requests (Contact)

Lucy Usage Estimates:
- Starter (50 leads/month): ~$5/month
- Professional (200 leads/month): ~$18/month
- Enterprise (unlimited): ~$150/month (capped)

Cost per lead discovery: ~$0.08-0.10
```

### Implementation Specifications

#### 1. Business Search Query

```typescript
interface BusinessSearchParams {
  keyword: string; // e.g., "dental clinic", "law firm", "restaurant"
  location: string; // e.g., "New York, NY", "90210", "Manhattan"
  radius?: number; // meters, default 50000 (31 miles)
  type?: string; // Google place type
  minRating?: number; // Filter by rating
  openNow?: boolean;
  maxResults?: number; // Default 50
}

interface GooglePlacesSearchResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  // Initial data, requires Place Details call for website
}
```

**Example API Call:**
```typescript
async function searchBusinesses(params: BusinessSearchParams): Promise<GooglePlacesSearchResult[]> {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.businessStatus,places.rating,places.userRatingCount,places.types,places.location'
    },
    body: JSON.stringify({
      textQuery: `${params.keyword} in ${params.location}`,
      maxResultCount: params.maxResults || 50,
      locationBias: {
        circle: {
          center: await geocodeLocation(params.location),
          radius: params.radius || 50000
        }
      }
    })
  });
  
  const data = await response.json();
  return data.places;
}
```

#### 2. Extract Business Details (Website URL)

```typescript
interface BusinessDetails extends GooglePlacesSearchResult {
  phoneNumber?: string;
  website?: string;
  internationalPhoneNumber?: string;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayDescriptions: string[];
  };
  priceLevel?: 'FREE' | 'INEXPENSIVE' | 'MODERATE' | 'EXPENSIVE' | 'VERY_EXPENSIVE';
}

async function getBusinessDetails(placeId: string): Promise<BusinessDetails> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,businessStatus,rating,userRatingCount,priceLevel'
    }
  });
  
  const place = await response.json();
  
  return {
    placeId: place.id,
    name: place.displayName?.text,
    formattedAddress: place.formattedAddress,
    phoneNumber: place.nationalPhoneNumber,
    internationalPhoneNumber: place.internationalPhoneNumber,
    website: place.websiteUri,
    openingHours: place.regularOpeningHours,
    businessStatus: place.businessStatus,
    rating: place.rating,
    userRatingsTotal: place.userRatingCount,
    priceLevel: place.priceLevel,
    types: place.types,
    geometry: {
      location: {
        lat: place.location.latitude,
        lng: place.location.longitude
      }
    }
  };
}
```

#### 3. Filtering & Qualification

```typescript
interface QualificationCriteria {
  requireWebsite: boolean; // Must have website URL
  minRating?: number; // e.g., 3.0
  minReviews?: number; // e.g., 10
  excludeChains?: boolean; // Filter out franchises
  mustBeOpen?: boolean; // Must be operational
  maxPerLocation?: number; // Limit per city/zip
}

function qualifyBusiness(
  business: BusinessDetails,
  criteria: QualificationCriteria
): { qualified: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Must have website
  if (criteria.requireWebsite && !business.website) {
    reasons.push('No website found');
    return { qualified: false, reasons };
  }
  
  // Check rating
  if (criteria.minRating && (!business.rating || business.rating < criteria.minRating)) {
    reasons.push(`Rating ${business.rating || 'N/A'} below minimum ${criteria.minRating}`);
    return { qualified: false, reasons };
  }
  
  // Check review count
  if (criteria.minReviews && (!business.userRatingsTotal || business.userRatingsTotal < criteria.minReviews)) {
    reasons.push(`Only ${business.userRatingsTotal || 0} reviews, need ${criteria.minReviews}`);
    return { qualified: false, reasons };
  }
  
  // Check operational status
  if (criteria.mustBeOpen && business.businessStatus !== 'OPERATIONAL') {
    reasons.push(`Business status: ${business.businessStatus}`);
    return { qualified: false, reasons };
  }
  
  // Exclude chains (heuristic: multiple locations with same name)
  if (criteria.excludeChains) {
    const chainIndicators = [
      /\b(mcdonalds|starbucks|subway|walmart|target)\b/i,
      /\blocation #\d+/i,
      /\bstore #\d+/i
    ];
    
    if (chainIndicators.some(pattern => pattern.test(business.name))) {
      reasons.push('Appears to be chain/franchise');
      return { qualified: false, reasons };
    }
  }
  
  reasons.push('Qualified');
  return { qualified: true, reasons };
}
```

#### 4. Geographic Targeting

```typescript
interface GeographicTarget {
  type: 'zip' | 'city' | 'state' | 'radius' | 'multiple';
  value: string | string[];
  radius?: number; // For radius type, in meters
}

const US_TARGET_EXAMPLES: GeographicTarget[] = [
  // Major metros
  { type: 'city', value: 'New York, NY' },
  { type: 'city', value: 'Los Angeles, CA' },
  { type: 'city', value: 'Chicago, IL' },
  
  // By zip code (high-value areas)
  { type: 'zip', value: '10001' }, // Manhattan
  { type: 'zip', value: '90210' }, // Beverly Hills
  { type: 'zip', value: '02108' }, // Boston
  
  // State-wide
  { type: 'state', value: 'California' },
  
  // Radius from point
  { type: 'radius', value: '37.7749,-122.4194', radius: 80000 }, // 50 miles from SF
  
  // Multiple locations
  { type: 'multiple', value: ['Dallas, TX', 'Austin, TX', 'Houston, TX'] }
];

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.results.length === 0) {
    throw new Error(`Could not geocode location: ${location}`);
  }
  
  return {
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng
  };
}
```

### Lucy-Specific Implementation

#### Complete Discovery Flow

```typescript
async function lucyDiscoverLeads(
  vertical: string,
  location: GeographicTarget,
  maxLeads: number = 50
): Promise<BusinessDetails[]> {
  // Step 1: Search for businesses
  const searchParams: BusinessSearchParams = {
    keyword: vertical,
    location: typeof location.value === 'string' ? location.value : location.value[0],
    radius: location.radius || 50000,
    maxResults: maxLeads * 2 // Over-fetch for filtering
  };
  
  const searchResults = await searchBusinesses(searchParams);
  
  // Step 2: Get detailed info including websites
  const detailedBusinesses = await Promise.all(
    searchResults.map(result => getBusinessDetails(result.placeId))
  );
  
  // Step 3: Qualify businesses
  const qualificationCriteria: QualificationCriteria = {
    requireWebsite: true,
    minRating: 3.0,
    minReviews: 5,
    excludeChains: true,
    mustBeOpen: true
  };
  
  const qualifiedBusinesses = detailedBusinesses.filter(business => {
    const { qualified } = qualifyBusiness(business, qualificationCriteria);
    return qualified;
  });
  
  // Step 4: Limit to requested count
  return qualifiedBusinesses.slice(0, maxLeads);
}
```

#### Database Schema for Discovered Leads

```prisma
model DiscoveredLead {
  id                  String   @id @default(cuid())
  userId              String
  campaignId          String?
  
  // Google Maps data
  googlePlaceId       String   @unique
  businessName        String
  address             String
  latitude            Float
  longitude           Float
  phoneNumber         String?
  website             String?
  rating              Float?
  reviewCount         Int?
  businessStatus      String
  types               String[]
  
  // Lucy workflow status
  status              LeadStatus @default(DISCOVERED)
  screenshotTaken     Boolean   @default(false)
  screenshotUrl       String?
  wcagAnalysisComplete Boolean  @default(false)
  wcagIssueCount      Int?
  pdfGenerated        Boolean   @default(false)
  pdfUrl              String?
  hubspotSynced       Boolean   @default(false)
  hubspotContactId    String?
  emailDraftGenerated Boolean   @default(false)
  emailSent           Boolean   @default(false)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id])
  campaign            Campaign? @relation(fields: [campaignId], references: [id])
}

enum LeadStatus {
  DISCOVERED
  ANALYZING
  PDF_READY
  HUBSPOT_SYNCED
  DRAFT_READY
  IN_REVIEW
  SENT
  RESPONDED
  CONVERTED
  LOST
}
```

---

## 🔗 Integration #2: HubSpot CRM (Lead Management)

### Purpose
Sync discovered leads to HubSpot CRM, enrich with company data, track email campaigns, and manage the sales pipeline.

### HubSpot API Products

**Required APIs:**
- **Contacts API** - Create/update contacts
- **Companies API** - Create/update companies
- **Deals API** - Track opportunities
- **Engagements API** - Log emails, calls, notes
- **Properties API** - Custom fields for WCAG data

### Authentication

```typescript
interface HubSpotAuth {
  apiKey?: string; // Private apps (simpler)
  accessToken?: string; // OAuth (better for multi-user)
  refreshToken?: string;
  expiresAt?: Date;
}

// OAuth flow for user-specific integration
const HUBSPOT_OAUTH_CONFIG = {
  clientId: process.env.HUBSPOT_CLIENT_ID,
  clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
  scopes: [
    'crm.objects.contacts.write',
    'crm.objects.companies.write',
    'crm.objects.deals.write',
    'crm.schemas.contacts.write', // Custom properties
    'crm.schemas.companies.write',
    'sales-email-read'
  ],
  redirectUri: process.env.APP_URL + '/api/integrations/hubspot/callback'
};
```

### Implementation Specifications

#### 1. Create/Update Contact

```typescript
interface HubSpotContact {
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    website?: string;
    
    // Lucy custom properties
    lucy_wcag_issues?: number;
    lucy_last_analyzed?: string; // ISO date
    lucy_pdf_report_url?: string;
    lucy_accessibility_score?: number; // 0-100
    lucy_lead_source?: 'lucy_discovery';
    lucy_vertical?: string;
    lucy_location?: string;
    lucy_google_place_id?: string;
  };
}

async function createHubSpotContact(
  business: BusinessDetails,
  wcagData: WCAGAnalysisResult
): Promise<string> {
  const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
  
  // Extract contact info from business
  const email = await findBusinessEmail(business.website);
  const [firstName, lastName] = extractNameFromBusiness(business.name);
  
  const contactData: HubSpotContact = {
    properties: {
      email: email || `contact@${new URL(business.website).hostname}`,
      firstname: firstName,
      lastname: lastName,
      phone: business.phoneNumber,
      company: business.name,
      website: business.website,
      
      // Lucy-specific data
      lucy_wcag_issues: wcagData.totalIssues,
      lucy_last_analyzed: new Date().toISOString(),
      lucy_pdf_report_url: wcagData.pdfUrl,
      lucy_accessibility_score: wcagData.overallScore,
      lucy_lead_source: 'lucy_discovery',
      lucy_vertical: wcagData.detectedIndustry,
      lucy_location: business.formattedAddress,
      lucy_google_place_id: business.placeId
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  const data = await response.json();
  return data.id; // HubSpot contact ID
}
```

#### 2. Create Company Record

```typescript
interface HubSpotCompany {
  properties: {
    name: string;
    domain?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    
    // Lucy custom properties
    lucy_wcag_compliance_status?: 'non_compliant' | 'partially_compliant' | 'compliant';
    lucy_critical_issues?: number;
    lucy_high_issues?: number;
    lucy_medium_issues?: number;
    lucy_low_issues?: number;
    lucy_google_rating?: number;
    lucy_google_reviews?: number;
  };
}

async function createHubSpotCompany(
  business: BusinessDetails,
  wcagData: WCAGAnalysisResult
): Promise<string> {
  const url = 'https://api.hubapi.com/crm/v3/objects/companies';
  
  // Parse address
  const addressParts = parseAddress(business.formattedAddress);
  
  const companyData: HubSpotCompany = {
    properties: {
      name: business.name,
      domain: business.website ? new URL(business.website).hostname : undefined,
      phone: business.phoneNumber,
      address: addressParts.street,
      city: addressParts.city,
      state: addressParts.state,
      zip: addressParts.zip,
      
      // Lucy WCAG data
      lucy_wcag_compliance_status: determineComplianceStatus(wcagData),
      lucy_critical_issues: wcagData.issuesBySeverity.critical,
      lucy_high_issues: wcagData.issuesBySeverity.high,
      lucy_medium_issues: wcagData.issuesBySeverity.medium,
      lucy_low_issues: wcagData.issuesBySeverity.low,
      lucy_google_rating: business.rating,
      lucy_google_reviews: business.userRatingsTotal
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(companyData)
  });
  
  const data = await response.json();
  return data.id;
}
```

#### 3. Create Deal (Opportunity)

```typescript
interface HubSpotDeal {
  properties: {
    dealname: string;
    dealstage: string;
    pipeline: string;
    amount?: number;
    closedate?: string;
    
    // Lucy custom properties
    lucy_wcag_issue_count?: number;
    lucy_estimated_fix_cost?: number;
    lucy_lawsuit_risk_score?: number; // 1-10
    lucy_pdf_report_url?: string;
  };
  associations: Array<{
    to: { id: string };
    types: Array<{ associationCategory: string; associationTypeId: number }>;
  }>;
}

async function createHubSpotDeal(
  contactId: string,
  companyId: string,
  business: BusinessDetails,
  wcagData: WCAGAnalysisResult
): Promise<string> {
  const url = 'https://api.hubapi.com/crm/v3/objects/deals';
  
  const estimatedValue = calculateDealValue(wcagData);
  const riskScore = calculateLawsuitRisk(wcagData);
  
  const dealData: HubSpotDeal = {
    properties: {
      dealname: `${business.name} - Accessibility Remediation`,
      dealstage: 'appointmentscheduled', // HubSpot default stage
      pipeline: 'default', // Or custom Lucy pipeline
      amount: estimatedValue,
      closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days out
      
      lucy_wcag_issue_count: wcagData.totalIssues,
      lucy_estimated_fix_cost: estimatedValue,
      lucy_lawsuit_risk_score: riskScore,
      lucy_pdf_report_url: wcagData.pdfUrl
    },
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Deal to Contact
      },
      {
        to: { id: companyId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }] // Deal to Company
      }
    ]
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dealData)
  });
  
  const data = await response.json();
  return data.id;
}
```

#### 4. Log Email Engagement

```typescript
interface HubSpotEngagement {
  properties: {
    hs_timestamp: string;
    hubspot_owner_id?: string;
    hs_email_direction: 'EMAIL';
    hs_email_status: 'SENT' | 'OPENED' | 'CLICKED' | 'BOUNCED';
    hs_email_subject: string;
    hs_email_text: string;
    hs_email_html: string;
  };
  associations: Array<{
    to: { id: string };
    types: Array<{ associationCategory: string; associationTypeId: number }>;
  }>;
}

async function logEmailToHubSpot(
  contactId: string,
  email: {
    subject: string;
    textBody: string;
    htmlBody: string;
    sentAt: Date;
    status: 'sent' | 'opened' | 'clicked' | 'bounced';
  }
): Promise<void> {
  const url = 'https://api.hubapi.com/crm/v3/objects/emails';
  
  const engagementData: HubSpotEngagement = {
    properties: {
      hs_timestamp: email.sentAt.toISOString(),
      hs_email_direction: 'EMAIL',
      hs_email_status: email.status.toUpperCase() as any,
      hs_email_subject: email.subject,
      hs_email_text: email.textBody,
      hs_email_html: email.htmlBody
    },
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 198 }] // Email to Contact
      }
    ]
  };
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(engagementData)
  });
}
```

#### 5. Custom Properties Setup

```typescript
// Run once during setup to create Lucy-specific custom properties
async function setupHubSpotCustomProperties() {
  const contactProperties = [
    {
      name: 'lucy_wcag_issues',
      label: 'WCAG Issues Found',
      type: 'number',
      fieldType: 'number',
      groupName: 'lucy_data'
    },
    {
      name: 'lucy_accessibility_score',
      label: 'Accessibility Score',
      type: 'number',
      fieldType: 'number',
      groupName: 'lucy_data'
    },
    {
      name: 'lucy_pdf_report_url',
      label: 'WCAG Report URL',
      type: 'string',
      fieldType: 'text',
      groupName: 'lucy_data'
    },
    {
      name: 'lucy_last_analyzed',
      label: 'Last Analyzed Date',
      type: 'date',
      fieldType: 'date',
      groupName: 'lucy_data'
    }
  ];
  
  for (const prop of contactProperties) {
    await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prop)
    });
  }
  
  // Repeat for company and deal properties...
}
```

---

## 📧 Integration #3: Gmail/Outlook (Email Sending)

### Purpose
Send personalized outreach emails with tracking, handle replies, and schedule follow-ups.

### Option A: Gmail API (Google Workspace)

#### Authentication

```typescript
// OAuth 2.0 for Gmail
const GMAIL_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ],
  redirectUri: process.env.APP_URL + '/api/integrations/gmail/callback'
};
```

#### Send Email via Gmail

```typescript
interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    data: Buffer;
  }>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

async function sendEmailViaGmail(
  accessToken: string,
  message: EmailMessage
): Promise<string> {
  // Create MIME message
  const messageParts = [
    `From: ${message.from}`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    message.replyTo ? `Reply-To: ${message.replyTo}` : '',
    message.cc ? `Cc: ${message.cc.join(', ')}` : '',
    message.bcc ? `Bcc: ${message.bcc.join(', ')}` : '',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    message.htmlBody || message.textBody
  ];
  
  const mimeMessage = messageParts.filter(Boolean).join('\r\n');
  const encodedMessage = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedMessage
    })
  });
  
  const data = await response.json();
  return data.id; // Gmail message ID for tracking
}
```

### Option B: Microsoft Graph API (Outlook)

#### Authentication

```typescript
// OAuth 2.0 for Outlook
const OUTLOOK_OAUTH_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  scopes: [
    'Mail.Send',
    'Mail.Read',
    'Mail.ReadWrite'
  ],
  redirectUri: process.env.APP_URL + '/api/integrations/outlook/callback',
  authority: 'https://login.microsoftonline.com/common'
};
```

#### Send Email via Outlook

```typescript
async function sendEmailViaOutlook(
  accessToken: string,
  message: EmailMessage
): Promise<string> {
  const url = 'https://graph.microsoft.com/v1.0/me/sendMail';
  
  const emailPayload = {
    message: {
      subject: message.subject,
      body: {
        contentType: message.htmlBody ? 'HTML' : 'Text',
        content: message.htmlBody || message.textBody
      },
      toRecipients: [
        {
          emailAddress: {
            address: message.to
          }
        }
      ],
      from: {
        emailAddress: {
          address: message.from
        }
      },
      replyTo: message.replyTo ? [
        {
          emailAddress: {
            address: message.replyTo
          }
        }
      ] : undefined,
      ccRecipients: message.cc?.map(email => ({
        emailAddress: { address: email }
      })),
      bccRecipients: message.bcc?.map(email => ({
        emailAddress: { address: email }
      })),
      attachments: message.attachments?.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.filename,
        contentType: att.contentType,
        contentBytes: att.data.toString('base64')
      }))
    },
    saveToSentItems: true
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }
  
  // Outlook doesn't return message ID directly on send
  // Need to query sent items to get it
  return 'sent'; // Or implement sent items query
}
```

### Option C: SendGrid (Fallback/Transactional)

```typescript
async function sendEmailViaSendGrid(message: EmailMessage): Promise<string> {
  const url = 'https://api.sendgrid.com/v3/mail/send';
  
  const payload = {
    personalizations: [
      {
        to: [{ email: message.to }],
        subject: message.subject,
        cc: message.cc?.map(email => ({ email })),
        bcc: message.bcc?.map(email => ({ email }))
      }
    ],
    from: {
      email: message.from,
      name: 'Lucy Accessibility'
    },
    reply_to: message.replyTo ? {
      email: message.replyTo
    } : undefined,
    content: [
      {
        type: 'text/plain',
        value: message.textBody
      },
      message.htmlBody ? {
        type: 'text/html',
        value: message.htmlBody
      } : null
    ].filter(Boolean),
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true }
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const messageId = response.headers.get('X-Message-Id');
  return messageId;
}
```

### Email Tracking & Webhooks

```typescript
interface EmailTracking {
  messageId: string;
  leadId: string;
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  bouncedAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced';
}

// Webhook handler for email events
async function handleEmailWebhook(event: any) {
  const tracking = await db.emailTracking.findUnique({
    where: { messageId: event.messageId }
  });
  
  if (!tracking) return;
  
  switch (event.event) {
    case 'open':
      await db.emailTracking.update({
        where: { id: tracking.id },
        data: {
          openedAt: new Date(),
          status: 'opened'
        }
      });
      
      // Log to HubSpot
      await logEmailToHubSpot(tracking.hubspotContactId, {
        subject: event.subject,
        textBody: event.text,
        htmlBody: event.html,
        sentAt: tracking.sentAt,
        status: 'opened'
      });
      break;
      
    case 'click':
      await db.emailTracking.update({
        where: { id: tracking.id },
        data: {
          clickedAt: new Date(),
          status: 'clicked'
        }
      });
      break;
      
    case 'bounce':
      await db.emailTracking.update({
        where: { id: tracking.id },
        data: {
          bouncedAt: new Date(),
          status: 'bounced'
        }
      });
      
      // Mark lead as invalid
      await db.discoveredLead.update({
        where: { id: tracking.leadId },
        data: { status: 'LOST' }
      });
      break;
  }
}
```

---

## 🔄 Complete Integration Flow

### Lucy End-to-End Workflow with Integrations

```typescript
async function lucyCompleteWorkflow(
  userId: string,
  vertical: string,
  location: string,
  maxLeads: number
) {
  // STEP 1: Google Maps - Discover Businesses
  console.log('Step 1: Discovering businesses via Google Maps...');
  const businesses = await lucyDiscoverLeads(vertical, { type: 'city', value: location }, maxLeads);
  console.log(`Found ${businesses.length} qualified businesses`);
  
  // STEP 2: Screenshot & WCAG Analysis
  console.log('Step 2: Analyzing websites for WCAG compliance...');
  const analyzedLeads = await Promise.all(
    businesses.map(async (business) => {
      const screenshot = await captureScreenshot(business.website);
      const wcagAnalysis = await analyzeWCAG(business.website);
      const pdf = await generatePDFReport(business, wcagAnalysis, screenshot);
      
      return {
        business,
        wcagAnalysis,
        screenshot,
        pdf
      };
    })
  );
  
  // STEP 3: HubSpot - Sync Leads
  console.log('Step 3: Syncing to HubSpot CRM...');
  const hubspotSyncedLeads = await Promise.all(
    analyzedLeads.map(async (lead) => {
      const companyId = await createHubSpotCompany(lead.business, lead.wcagAnalysis);
      const contactId = await createHubSpotContact(lead.business, lead.wcagAnalysis);
      const dealId = await createHubSpotDeal(contactId, companyId, lead.business, lead.wcagAnalysis);
      
      // Save to database
      const dbLead = await db.discoveredLead.create({
        data: {
          userId,
          googlePlaceId: lead.business.placeId,
          businessName: lead.business.name,
          address: lead.business.formattedAddress,
          website: lead.business.website,
          phoneNumber: lead.business.phoneNumber,
          wcagIssueCount: lead.wcagAnalysis.totalIssues,
          screenshotUrl: lead.screenshot.url,
          pdfUrl: lead.pdf.url,
          hubspotContactId: contactId,
          hubspotSynced: true,
          status: 'DRAFT_READY'
        }
      });
      
      return {
        ...lead,
        dbLead,
        hubspot: { companyId, contactId, dealId }
      };
    })
  );
  
  // STEP 4: Generate Email Drafts
  console.log('Step 4: Generating personalized email drafts...');
  const emailDrafts = await Promise.all(
    hubspotSyncedLeads.map(async (lead) => {
      const painPoints = getPainPointsByIndustry(vertical);
      const emailDraft = generatePainPointEmail(
        lead.business.name,
        vertical,
        lead.wcagAnalysis.totalIssues,
        painPoints.slice(0, 3).map(pp => pp.id)
      );
      
      await db.discoveredLead.update({
        where: { id: lead.dbLead.id },
        data: {
          emailDraftGenerated: true,
          status: 'IN_REVIEW'
        }
      });
      
      return {
        ...lead,
        emailDraft
      };
    })
  );
  
  // STEP 5: Present to User for Review
  console.log('Step 5: Ready for human review...');
  return emailDrafts;
}

// STEP 6: Send Approved Emails (user-triggered)
async function sendApprovedEmail(
  leadId: string,
  approvedEmailBody: string,
  userEmailProvider: 'gmail' | 'outlook' | 'sendgrid'
) {
  const lead = await db.discoveredLead.findUnique({
    where: { id: leadId },
    include: { user: true }
  });
  
  if (!lead) throw new Error('Lead not found');
  
  const email: EmailMessage = {
    to: lead.contactEmail || `contact@${new URL(lead.website).hostname}`,
    from: lead.user.email,
    subject: `${lead.wcagIssueCount} Accessibility Issues Found - ${lead.businessName}`,
    htmlBody: approvedEmailBody,
    textBody: stripHtml(approvedEmailBody),
    replyTo: lead.user.email,
    attachments: [
      {
        filename: `${lead.businessName}-WCAG-Report.pdf`,
        contentType: 'application/pdf',
        data: await fetchPDFBuffer(lead.pdfUrl)
      }
    ]
  };
  
  let messageId: string;
  
  switch (userEmailProvider) {
    case 'gmail':
      messageId = await sendEmailViaGmail(lead.user.gmailAccessToken, email);
      break;
    case 'outlook':
      messageId = await sendEmailViaOutlook(lead.user.outlookAccessToken, email);
      break;
    case 'sendgrid':
      messageId = await sendEmailViaSendGrid(email);
      break;
  }
  
  // Track email
  await db.emailTracking.create({
    data: {
      messageId,
      leadId: lead.id,
      sentAt: new Date(),
      status: 'sent'
    }
  });
  
  // Update lead status
  await db.discoveredLead.update({
    where: { id: leadId },
    data: {
      emailSent: true,
      status: 'SENT'
    }
  });
  
  // Log to HubSpot
  await logEmailToHubSpot(lead.hubspotContactId, {
    subject: email.subject,
    textBody: email.textBody,
    htmlBody: email.htmlBody,
    sentAt: new Date(),
    status: 'sent'
  });
  
  // Schedule follow-ups (3, 7, 14 days)
  await scheduleFollowUps(leadId, [3, 7, 14]);
  
  return { messageId, lead };
}
```

---

## 💰 Integration Cost Summary

### Monthly Operational Costs

```typescript
interface IntegrationCosts {
  googleMaps: {
    starter: 5,
    professional: 18,
    enterprise: 150
  };
  hubspot: {
    starter: 0, // Free CRM
    professional: 0, // API included in free tier
    enterprise: 0 // API included
  };
  email: {
    gmail: 0, // User's own account
    outlook: 0, // User's own account
    sendgrid: {
      starter: 15, // 40K emails/month
      professional: 60, // 100K emails/month
      enterprise: 200 // 1M emails/month
    }
  };
  total: {
    starter: 20, // $5 + $15
    professional: 78, // $18 + $60
    enterprise: 350 // $150 + $200
  };
}
```

### Integration Setup Checklist

**Phase 1: Google Maps (Week 1)**
- [ ] Create Google Cloud Project
- [ ] Enable Places API (New)
- [ ] Enable Geocoding API
- [ ] Set up billing with spending limits
- [ ] Generate API key with restrictions
- [ ] Implement business search
- [ ] Implement place details
- [ ] Test with sample verticals

**Phase 2: HubSpot (Week 2)**
- [ ] Create HubSpot developer account
- [ ] Set up OAuth app
- [ ] Create custom properties
- [ ] Implement contact sync
- [ ] Implement company sync
- [ ] Implement deal creation
- [ ] Implement engagement logging
- [ ] Test full CRM workflow

**Phase 3: Gmail/Outlook (Week 3)**
- [ ] Set up Google OAuth
- [ ] Set up Microsoft OAuth
- [ ] Implement Gmail sending
- [ ] Implement Outlook sending
- [ ] Set up SendGrid (fallback)
- [ ] Implement email tracking
- [ ] Set up webhook handlers
- [ ] Test email delivery

**Phase 4: Integration Testing (Week 4)**
- [ ] End-to-end workflow test
- [ ] Error handling & retries
- [ ] Rate limiting implementation
- [ ] Monitoring & logging
- [ ] User documentation
- [ ] Admin dashboard
- [ ] Go-live checklist

---

## 🔒 Security & Compliance

### Data Protection

```typescript
// Encrypt sensitive tokens
interface EncryptedTokens {
  gmailAccessToken: string; // Encrypted
  gmailRefreshToken: string; // Encrypted
  outlookAccessToken: string; // Encrypted
  outlookRefreshToken: string; // Encrypted
  hubspotAccessToken: string; // Encrypted
}

// Store in database encrypted at rest
// Decrypt only when needed for API calls
// Never log or expose tokens in responses
```

### Rate Limiting

```typescript
const RATE_LIMITS = {
  googleMaps: {
    requestsPerSecond: 50,
    requestsPerDay: 100000
  },
  hubspot: {
    requestsPerSecond: 10,
    requestsPerDay: 250000
  },
  gmail: {
    requestsPerSecond: 25,
    requestsPerDay: 10000
  },
  outlook: {
    requestsPerSecond: 30,
    requestsPerDay: 10000
  }
};
```

---

## 📊 Success Metrics

### KPIs to Track

**Google Maps Discovery:**
- Businesses discovered per search
- Qualification rate (% with websites)
- Geographic coverage
- Average cost per qualified lead

**HubSpot Sync:**
- Sync success rate
- Data enrichment accuracy
- Deal creation rate
- Time to sync

**Email Sending:**
- Delivery rate
- Open rate
- Click rate
- Reply rate
- Conversion rate

**Overall Lucy Performance:**
- End-to-end cycle time
- Cost per converted customer
- ROI per campaign
- User satisfaction score

---

**These three integrations are the foundation of Lucy's value proposition. With Google Maps finding the leads, HubSpot managing them, and Gmail/Outlook closing them, you have a complete WCAG prospecting machine.**

---

**Next Steps:**
1. Set up API accounts for all three services
2. Implement authentication flows
3. Build integration layer in backend
4. Create user-facing integration setup UI
5. Test end-to-end workflow
6. Launch beta with select users
7. Iterate based on feedback

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Status:** Ready for Implementation


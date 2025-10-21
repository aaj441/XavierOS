# Lucy Integration Quick Start Guide
## Get Lucy Running in 4 Hours

---

## Overview

This guide will get you from zero to a working Lucy prototype with all three lynchpin integrations:
1. Google Maps (business discovery) - 1 hour
2. HubSpot (CRM sync) - 1.5 hours  
3. Gmail/Outlook (email sending) - 1.5 hours

**Total time:** ~4 hours
**Result:** End-to-end Lucy workflow functional

---

## ⏱️ Hour 1: Google Maps Setup

### Step 1: Create Google Cloud Project (10 mins)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Lucy-WCAG-Prospecting"
4. Click "Create"

### Step 2: Enable Required APIs (5 mins)

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable:
   - **Places API (New)**
   - **Geocoding API**
3. Click "Enable" on each

### Step 3: Create API Key (5 mins)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key (starts with `AIza...`)
4. Click "Restrict Key"
5. Under "API restrictions", select:
   - Places API (New)
   - Geocoding API
6. Save

### Step 4: Set Up Billing (10 mins)

1. Go to "Billing" → "Create Billing Account"
2. Add payment method
3. Set budget alert at $20/month
4. Enable billing for your project

**Cost:** $0-5/month for starter tier

### Step 5: Test Integration (30 mins)

```bash
# Add to .env
GOOGLE_MAPS_API_KEY=your_api_key_here

# Test with curl
curl -X POST \
  'https://places.googleapis.com/v1/places:searchText' \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: YOUR_API_KEY' \
  -H 'X-Goog-FieldMask: places.displayName,places.formattedAddress' \
  -d '{
    "textQuery": "dental clinics in New York, NY"
  }'

# Expected: JSON response with 20 dental clinics
```

✅ **Milestone:** You can now discover businesses!

---

## ⏱️ Hour 2-2.5: HubSpot Setup

### Step 1: Create HubSpot Account (10 mins)

1. Go to [HubSpot](https://www.hubspot.com/)
2. Sign up for free CRM
3. Complete initial setup
4. Verify email

### Step 2: Create Developer App (15 mins)

1. Go to [HubSpot Developer](https://developers.hubspot.com/)
2. Click "Create app"
3. Name it "Lucy WCAG Machine"
4. Add these scopes:
   - `crm.objects.contacts.write`
   - `crm.objects.companies.write`
   - `crm.objects.deals.write`
   - `crm.schemas.contacts.write`
   - `crm.schemas.companies.write`
5. Set redirect URI: `http://localhost:3000/api/integrations/hubspot/callback`
6. Copy Client ID and Client Secret

### Step 3: Add Environment Variables (5 mins)

```bash
# Add to .env
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
```

### Step 4: Create Custom Properties (30 mins)

Run this script to create Lucy-specific custom properties:

```typescript
// scripts/setup-hubspot-properties.ts
import { HubSpotService } from '../src/server/services/hubspotService';

const ACCESS_TOKEN = 'YOUR_TEMPORARY_ACCESS_TOKEN'; // Get from HubSpot OAuth Playground
const hubspot = new HubSpotService(ACCESS_TOKEN);

// Contact properties
const contactProps = [
  {
    name: 'lucy_wcag_issues',
    label: 'WCAG Issues Found',
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
  // ... more properties
];

// Create each property
for (const prop of contactProps) {
  await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prop)
  });
}
```

### Step 5: Test Integration (30 mins)

```typescript
// Test HubSpot sync
import { HubSpotService } from './src/server/services/hubspotService';

const hubspot = new HubSpotService(ACCESS_TOKEN);

// Create test contact
const contactId = await hubspot.createContact({
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'Business',
  company: 'Test Dental Clinic',
  website: 'https://test-dental.com',
  lucy_wcag_issues: 23,
  lucy_lead_source: 'lucy_discovery'
});

console.log('Contact created:', contactId);
// Check HubSpot to see if contact appears
```

✅ **Milestone:** Leads now sync to HubSpot CRM!

---

## ⏱️ Hour 2.5-4: Gmail/Outlook Setup

### Option A: Gmail (Recommended for MVP)

#### Step 1: Create Google OAuth App (15 mins)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Same project as Google Maps
3. Go to "APIs & Services" → "OAuth consent screen"
4. Select "External" → Create
5. Fill in:
   - App name: "Lucy Accessibility"
   - User support email: your email
   - Developer contact: your email
6. Click "Save and Continue"
7. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
8. Add test users (your Gmail address)
9. Click "Save and Continue"

#### Step 2: Create OAuth Credentials (10 mins)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "Lucy Gmail Integration"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/integrations/gmail/callback`
6. Click "Create"
7. Copy Client ID and Client Secret

#### Step 3: Enable Gmail API (5 mins)

1. Go to "APIs & Services" → "Library"
2. Search "Gmail API"
3. Click "Enable"

#### Step 4: Add Environment Variables (5 mins)

```bash
# Add to .env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Step 5: Implement OAuth Flow (45 mins)

```typescript
// src/server/routes/integrations/gmail.ts
import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.APP_URL + '/api/integrations/gmail/callback'
);

// Step 1: Redirect user to Google OAuth
router.get('/gmail/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  });
  res.redirect(url);
});

// Step 2: Handle callback
router.get('/gmail/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code as string);
  
  // Save tokens to user record in database
  await db.user.update({
    where: { id: req.user.id },
    data: {
      gmailAccessToken: encrypt(tokens.access_token),
      gmailRefreshToken: encrypt(tokens.refresh_token)
    }
  });
  
  res.redirect('/dashboard?gmail=connected');
});

export default router;
```

#### Step 6: Test Email Sending (20 mins)

```typescript
// Test sending email
import { EmailService, GmailProvider } from './src/server/services/emailService';

const gmailProvider = new GmailProvider(ACCESS_TOKEN);
const emailService = new EmailService('gmail', { accessToken: ACCESS_TOKEN });

const messageId = await emailService.sendLucyOutreach({
  to: 'test@example.com',
  from: 'your-email@gmail.com',
  businessName: 'Test Business',
  wcagIssueCount: 23,
  industry: 'dental',
  emailBody: '<h1>Test Email</h1><p>This is a test.</p>'
});

console.log('Email sent:', messageId);
// Check recipient inbox
```

### Option B: SendGrid (Easier, paid)

#### Step 1: Create SendGrid Account (10 mins)

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up (free tier: 100 emails/day)
3. Verify email
4. Complete sender verification

#### Step 2: Create API Key (5 mins)

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Lucy Outreach"
4. Select "Full Access"
5. Copy API key

#### Step 3: Add Environment Variable (2 mins)

```bash
# Add to .env
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### Step 4: Test Sending (10 mins)

```typescript
// Test SendGrid
import { EmailService } from './src/server/services/emailService';

const emailService = new EmailService('sendgrid', {
  apiKey: process.env.SENDGRID_API_KEY
});

await emailService.sendLucyOutreach({
  to: 'test@example.com',
  from: 'verified-sender@yourdomain.com', // Must be verified in SendGrid
  businessName: 'Test Business',
  wcagIssueCount: 23,
  industry: 'dental',
  emailBody: '<h1>Test Email</h1><p>This is a test.</p>'
});
```

✅ **Milestone:** You can now send emails!

---

## 🎉 Hour 4: Test Complete Workflow

### End-to-End Test

```typescript
// scripts/test-lucy-workflow.ts
import { GoogleMapsService } from './src/server/services/googleMapsService';
import { HubSpotService } from './src/server/services/hubspotService';
import { EmailService } from './src/server/services/emailService';

async function testLucyWorkflow() {
  // 1. Discover businesses with Google Maps
  console.log('1. Discovering businesses...');
  const googleMaps = new GoogleMapsService(process.env.GOOGLE_MAPS_API_KEY!);
  const businesses = await googleMaps.discoverLeads('dental clinics', 'New York, NY', 5);
  console.log(`Found ${businesses.length} businesses`);

  // 2. Sync first business to HubSpot
  console.log('\n2. Syncing to HubSpot...');
  const hubspot = new HubSpotService(process.env.HUBSPOT_ACCESS_TOKEN!);
  const business = businesses[0];
  
  const { contactId, companyId, dealId } = await hubspot.syncLucyLead({
    businessName: business.name,
    email: `contact@${new URL(business.website!).hostname}`,
    phone: business.phoneNumber,
    website: business.website!,
    address: business.formattedAddress,
    wcagIssueCount: 23, // Mock data
    accessibilityScore: 65,
    pdfReportUrl: 'https://example.com/report.pdf',
    vertical: 'dental',
    estimatedValue: 15000
  });
  
  console.log('HubSpot sync complete:', { contactId, companyId, dealId });

  // 3. Send email
  console.log('\n3. Sending email...');
  const emailService = new EmailService('sendgrid', {
    apiKey: process.env.SENDGRID_API_KEY!
  });
  
  const messageId = await emailService.sendLucyOutreach({
    to: process.env.TEST_EMAIL!, // Your test email
    from: process.env.FROM_EMAIL!,
    businessName: business.name,
    wcagIssueCount: 23,
    industry: 'dental',
    emailBody: `
      <h1>Accessibility Issues Found</h1>
      <p>Hi there,</p>
      <p>We found 23 WCAG compliance issues on ${business.website}.</p>
      <p>This is a test from Lucy!</p>
    `
  });
  
  console.log('Email sent:', messageId);
  
  console.log('\n✅ Lucy workflow test complete!');
  console.log('Check:');
  console.log('1. Google Maps API usage in Cloud Console');
  console.log('2. New contact/company/deal in HubSpot');
  console.log('3. Email in your inbox');
}

testLucyWorkflow();
```

### Run the test:

```bash
# Set test environment variables
export TEST_EMAIL=your-email@example.com
export FROM_EMAIL=verified-sender@yourdomain.com
export HUBSPOT_ACCESS_TOKEN=your_access_token

# Run test
ts-node scripts/test-lucy-workflow.ts
```

### Expected Results:

1. ✅ Console shows 5 businesses discovered
2. ✅ HubSpot shows new contact, company, and deal
3. ✅ Email arrives in TEST_EMAIL inbox
4. ✅ No errors in console

---

## 🚀 Next Steps

Now that integrations are working:

1. **Add Screenshot Service** (Playwright)
2. **Add WCAG Analysis** (axe-core)
3. **Add PDF Generation** (PDFKit)
4. **Build UI** for human review
5. **Add Email Tracking** (webhooks)
6. **Implement Follow-ups** (scheduler)

---

## 💰 Cost Summary

**Development/Testing (first month):**
- Google Maps: $0-5
- HubSpot: $0 (free tier)
- Gmail: $0 (user's account)
- SendGrid: $0 (100 emails/day free)
- **Total: $0-5/month**

**Production (Starter tier):**
- Google Maps: $5-10/month (50 leads)
- HubSpot: $0
- SendGrid: $15/month (40K emails)
- **Total: $20-25/month**

**Production (Professional tier):**
- Google Maps: $18-25/month (200 leads)
- HubSpot: $0
- SendGrid: $60/month (100K emails)
- **Total: $78-85/month**

---

## 🐛 Troubleshooting

### Google Maps API

**Error: "API key not valid"**
- Check API restrictions
- Ensure Places API (New) is enabled
- Verify billing is enabled

**Error: "REQUEST_DENIED"**
- Enable required APIs
- Check API key restrictions
- Wait 5 minutes for propagation

### HubSpot

**Error: "401 Unauthorized"**
- Check access token is valid
- Verify OAuth scopes
- Re-authenticate if needed

**Error: "Property not found"**
- Run custom property setup script
- Check property names match exactly

### Gmail/Outlook

**Error: "Invalid credentials"**
- Check OAuth tokens
- Refresh access token if expired
- Re-authenticate user

**Error: "User hasn't granted permission"**
- Check OAuth scopes
- Add user to test users (if in development)

---

## 📚 Additional Resources

- [Google Maps Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [HubSpot CRM API Docs](https://developers.hubspot.com/docs/api/crm/understanding-the-crm)
- [Gmail API Send Email](https://developers.google.com/gmail/api/guides/sending)
- [SendGrid API Docs](https://docs.sendgrid.com/api-reference/mail-send/mail-send)

---

**Congratulations! You now have a working Lucy prototype with all three lynchpin integrations. Time to start prospecting!** 🎉


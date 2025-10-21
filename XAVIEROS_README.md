# XavierOS / WCAG Machine / Project Xavier

## Overview
XavierOS is a comprehensive AI-powered platform that combines three major systems:
1. **Lucy** - WCAG Sales Prospecting System
2. **eBook Machine** - 12-Agent Collaborative Writing System
3. **Email Writer** - AI-Powered Email Drafting Tool

---

## 🔥 Lucy - WCAG Sales Prospecting System

### Purpose
Automated WCAG compliance prospecting that finds leads, analyzes accessibility issues, and generates personalized sales outreach.

### Complete Workflow (9 Steps)

#### 1. Vertical Keywords Input
- User enters industry keywords (e.g., "healthcare", "law firms", "restaurants")
- System prepares search parameters

#### 2. Google Search & Discovery
- Automated Google searches for SMBs matching the vertical
- Filters results based on business criteria
- **Status:** ⚠️ Needs Backend Implementation

#### 3. Screenshot Homepage
- Takes automated screenshots of discovered websites
- Captures full-page renders for analysis
- **Status:** ⚠️ Needs Playwright/Puppeteer Integration

#### 4. WCAG Analysis
- Analyzes screenshots and HTML for WCAG 2.1 compliance issues
- Identifies specific accessibility violations
- Counts and categorizes issues by severity
- **Status:** ⚠️ Needs axe-core or similar integration

#### 5. PDF Generation with Overlays
- Creates visual PDF reports
- Colorful overlays highlight specific deficiencies
- Professional formatting for client presentations
- **Status:** ⚠️ Needs PDF generation library

#### 6. HubSpot Integration
- Researches company details
- Inputs leads into HubSpot CRM
- Enriches lead data with company information
- **Status:** ⚠️ Needs HubSpot API integration

#### 7. Email Draft Generation
- Creates vertical-friendly sales emails
- Utilizes sales closing best practices
- Personalizes based on WCAG findings
- **Status:** ✅ Frontend Complete (Mock Data)

#### 8. Human Review Queue
- Presents draft emails for human review
- Shows WCAG report and company details
- Allows editing and personalization
- **Status:** ✅ Frontend Complete

#### 9. Send & Schedule Follow-ups
- Sends approved emails
- Schedules follow-up attempts (email + physical mail)
- Tracks engagement and responses
- **Status:** ⚠️ Needs Email Service Integration

### Tech Stack Required
- **Frontend:** ✅ React/TypeScript (Complete)
- **Backend Needed:**
  - Playwright/Puppeteer (screenshots)
  - axe-core or Pa11y (WCAG analysis)
  - PDFKit or similar (PDF generation)
  - HubSpot API
  - SendGrid/Mailgun (email sending)
  - Scheduling service (follow-ups)

---

## 📚 eBook Machine - 12-Agent Collaborative System

### Purpose
Creates authentic, engaging eBooks through 12 specialized AI agents, each bringing unique expertise and perspective.

### The 12 Agents

#### 1. ⚡ Archivist - Keeper of Time
**Expertise:** Chronological views, milestone tracking, reflective prompts
**Features:**
- Timeline visualizations
- Journaling frameworks
- Progress tracking
- Historical context integration

**Contribution:** Provides temporal depth and helps readers see patterns in their own timeline

#### 2. ⚡ Bard - Storyteller
**Expertise:** Storytelling frameworks, narrative structure, mythic journeys
**Features:**
- Narrative chapter structure
- Hero's journey templates
- Metaphor and emotional resonance
- Data transformed into story

**Contribution:** Makes information personal and memorable through compelling narratives

#### 3. ⚡ Steward - Body Keeper
**Expertise:** Rest cycles, micro-breaks, stress monitoring, recovery actions
**Features:**
- Energy management guidance
- Sustainable practice recommendations
- Physical well-being integration
- Balance and recovery strategies

**Contribution:** Ensures readers maintain physical health while pursuing goals

#### 4. ⚡ Healer - Wound Tender
**Expertise:** Emotional recovery resources, resilience, guided meditations, trauma-informed care
**Features:**
- Healing resource curation
- Trauma-informed check-ins
- Support network connections
- Emotional processing guidance

**Contribution:** Addresses pain points with compassion and professional healing wisdom

#### 5. ⚡ Sentinel - Boundary Guardian
**Expertise:** Usage limits, focus modes, do-not-disturb settings, "no" templates
**Features:**
- Boundary-setting frameworks
- Communication templates for saying "no"
- Energy protection strategies
- Priority defense mechanisms

**Contribution:** Empowers readers to protect their time, energy, and priorities

#### 6. ⚡ Strategist - Pathfinder
**Expertise:** Goal setting, subgoals, planning tools, scenario modeling
**Features:**
- Project management frameworks
- Strategic planning tools
- Scenario analysis
- Three-moves-ahead thinking

**Contribution:** Provides actionable strategies and clear paths forward

#### 7. ⚡ Builder - Craftsman
**Expertise:** Habit streaks, progress dashboards, disciplined practices, scaffolding
**Features:**
- System creation templates
- Momentum-building techniques
- Progress dashboards
- Habit tracking frameworks

**Contribution:** Transforms vision into routine through systematic practices

#### 8. ⚡ Oracle - Seer
**Expertise:** Usage pattern analysis, predictive recommendations, burnout cycle detection
**Features:**
- Pattern recognition
- Timing optimization
- Predictive insights
- Cycle awareness

**Contribution:** Reveals patterns and optimal timing for action

#### 9. ⚡ Trickster - Chaos Agent
**Expertise:** Playful disruptions, pattern breaking, challenging assumptions
**Features:**
- Creative disruption prompts
- Assumption challenges
- Alternative perspective generation
- Rule-breaking guidance

**Contribution:** Breaks stale patterns and sparks innovative thinking

#### 10. ⚡ Ritualist - Sacred Keeper
**Expertise:** End-of-day reflections, goal-setting ceremonies, sacred practices
**Features:**
- Ritual creation templates
- Ceremony frameworks
- Intentional practice design
- Meaning-making tools

**Contribution:** Transforms ordinary tasks into sacred, meaningful acts

#### 11. ⚡ Legacy Steward - Keeper of Continuity
**Expertise:** Legacy planning, mentorship connections, growth retrospectives
**Features:**
- Long-term impact planning
- Mentorship frameworks
- Growth retrospectives
- Continuity strategies

**Contribution:** Connects present actions to lasting legacy

#### 12. ⚡ Faith Keeper - Bearer of Hope
**Expertise:** Encouragement, positive reframing, quote libraries, success stories, gratitude journaling
**Features:**
- Curated inspiration libraries
- Success story collections
- Gratitude journaling prompts
- Positive reframing techniques

**Contribution:** Maintains hope and perseverance through challenges

### eBook Generation Process

1. **Setup:** User defines topic, audience, and tone
2. **Agent Selection:** Choose which agents contribute (all 12 by default)
3. **Outline Generation:** System creates chapter structure
4. **Agent Assignment:** Each chapter assigned relevant agents
5. **Content Generation:** Agents collaborate on each chapter
6. **Review:** User can review and edit generated content
7. **Export:** Download complete eBook

**Status:** ✅ Frontend Complete with Mock Generation

---

## ✉️ Email Writer - AI-Powered Drafting Tool

### Purpose
Transforms raw thoughts into polished, professional emails with AI assistance.

### Features
- **Multi-language Support:** Currently supports English and Spanish
- **6 Tone Options:**
  - Professional (clear, business-appropriate)
  - Warm (friendly, approachable)
  - Concise (brief, to the point)
  - Formal (traditional, respectful)
  - Casual (relaxed, conversational)
  - Persuasive (compelling, convincing)
  
- **Context Integration:** Can paste original email for response context
- **Keyboard Shortcuts:** Cmd/Ctrl + Enter to generate
- **Copy to Clipboard:** One-click copy of generated emails

### Workflow
1. Enter raw thoughts/ideas
2. Select desired tone
3. Optionally add context email
4. Generate with AI
5. Review and copy

**Status:** ✅ Frontend Complete (needs AI API integration)

---

## 🏗️ Architecture

### Frontend (Complete)
- **Framework:** React 19 + TypeScript
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** Zustand (for auth)

### Backend (Needs Implementation)

#### Required Services

**1. WCAG Analysis Service**
```typescript
POST /api/lucy/analyze-wcag
Body: { url: string }
Response: {
  issueCount: number,
  issues: Issue[],
  screenshot: string (base64),
  severity: "high" | "medium" | "low"
}
```

**2. PDF Generation Service**
```typescript
POST /api/lucy/generate-pdf
Body: { 
  url: string,
  issues: Issue[],
  screenshot: string 
}
Response: {
  pdfUrl: string
}
```

**3. HubSpot Integration**
```typescript
POST /api/lucy/sync-hubspot
Body: {
  companyName: string,
  website: string,
  contactEmail: string,
  wcagIssues: number
}
Response: {
  hubspotId: string,
  enrichedData: CompanyData
}
```

**4. Email Service**
```typescript
POST /api/lucy/send-email
Body: {
  to: string,
  subject: string,
  body: string,
  attachments?: Attachment[]
}
Response: {
  sent: boolean,
  messageId: string
}
```

**5. AI Completion Service**
```typescript
POST /api/ai/complete
Body: {
  prompt: string,
  systemPrompt?: string,
  temperature?: number
}
Response: {
  completion: string
}
```

---

## 🚀 Getting Started

### Development Setup
```bash
cd "A5-Browser-Use-v.0.0.5/A5-Browser-Use-v.0.0.5/Blue Ocean Explorer"
pnpm install
pnpm dev
```

### Access the Applications
- Dashboard: http://localhost:3000/dashboard
- Lucy: http://localhost:3000/lucy
- eBook Machine: http://localhost:3000/ebook-machine
- Email Writer: http://localhost:3000/email-writer

---

## 📝 Next Steps for Full Implementation

### Priority 1: Lucy Lynchpin Integrations ⚡ CRITICAL
- [ ] **Google Maps API** - Business discovery (MUST HAVE)
  - Enable Places API (New)
  - Enable Geocoding API  
  - Set spending limits ($20-150/month)
- [ ] **HubSpot CRM** - Lead management (MUST HAVE)
  - Set up OAuth app
  - Create custom properties
  - Implement full sync workflow
- [ ] **Gmail/Outlook** - Email sending (MUST HAVE)
  - Set up Google OAuth (Gmail)
  - Set up Microsoft OAuth (Outlook)
  - Configure SendGrid (fallback)
  - Implement tracking webhooks

### Priority 2: Lucy Backend Services
- [ ] Set up Playwright for screenshots
- [ ] Integrate axe-core for WCAG analysis
- [ ] Implement PDF generation with overlays
- [ ] Build follow-up scheduler

### Priority 3: AI Integration
- [ ] Integrate Claude API or OpenAI for email generation
- [ ] Integrate AI for eBook content generation
- [ ] Set up API keys and rate limiting

### Priority 3: eBook Machine Enhancement
- [ ] Implement actual AI agent collaboration
- [ ] Create agent-specific prompt engineering
- [ ] Build chapter generation pipeline
- [ ] Add export formats (PDF, EPUB, MOBI)

### Priority 4: Production Ready
- [ ] Add authentication and authorization
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production environment

---

## 🔐 Environment Variables Needed

```env
# AI Services
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Lucy Integrations (The Lynchpins)
GOOGLE_MAPS_API_KEY=your_google_maps_key
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
SENDGRID_API_KEY=your_sendgrid_key

# Gmail OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Outlook OAuth (optional)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Database
DATABASE_URL=your_postgres_url

# App Config
NODE_ENV=development
APP_URL=http://localhost:3000
```

---

## 📊 Current Status Summary

| Component | Frontend | Backend | Status |
|-----------|----------|---------|--------|
| Lucy Workflow UI | ✅ | ⚠️ | Mock Data |
| WCAG Analysis | ✅ | ❌ | Needs Implementation |
| PDF Generation | ✅ | ❌ | Needs Implementation |
| HubSpot Sync | ✅ | ❌ | Needs Implementation |
| Email Drafting | ✅ | ⚠️ | Needs AI API |
| Human Review | ✅ | ✅ | Complete |
| Email Sending | ✅ | ❌ | Needs Implementation |
| eBook Machine UI | ✅ | ⚠️ | Mock Generation |
| 12 Agents | ✅ | ⚠️ | Needs AI Implementation |
| Email Writer | ✅ | ⚠️ | Needs AI API |

**Legend:**
- ✅ Complete
- ⚠️ Partially Complete
- ❌ Not Started

---

## 💡 Design Philosophy

XavierOS is built on the principle that AI should augment human capabilities, not replace them. Each system is designed with human-in-the-loop workflows:

- **Lucy:** AI finds and analyzes, humans personalize and send
- **eBook Machine:** 12 AI perspectives collaborate, humans curate and edit
- **Email Writer:** AI generates drafts, humans refine and send

This ensures quality, authenticity, and ethical use of AI technology.

---

## 📫 Questions or Issues?

This is an active development project. Refer to the main Blue Ocean Explorer documentation for general setup and contribution guidelines.

**Key Repositories:**
- Main: github.com/aaj441/Lucy
- Related: Blue Ocean Explorer (this codebase)


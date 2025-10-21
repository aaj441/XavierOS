# ERRC Framework for Blue Ocean Explorer

This document contains 30 ERRC-informed (Eliminate, Reduce, Raise, Create) meta questions to guide product development, user research, and strategic innovation for the Blue Ocean Explorer app.

## Overview

The ERRC framework helps identify opportunities to:
- **Eliminate**: Remove unnecessary features or friction
- **Reduce**: Minimize complexity or effort required
- **Raise**: Enhance existing capabilities beyond industry standards
- **Create**: Develop entirely new value propositions

---

## Eliminate

### 1. Scenario Comparison UI Clutter
**Question**: What clutter or unnecessary filters in scenario comparison UI could be removed to help users focus only on critical insights?

**Current State**: Scenario comparison uses a table-based view with multiple data points
**Relevant Files**: `src/routes/opportunities/$opportunityId/scenarios.index.tsx`, chart components
**Priority**: Medium

### 2. Manual Chart Generation
**Question**: Which repetitive manual steps in generating charts and scenario reports should be automated or removed?

**Current State**: Quick Actions exist for scenario generation; some manual configuration remains
**Relevant Files**: `src/server/trpc/procedures/createScenario.ts`, `src/utils/export.ts`
**Priority**: High

### 3. Opaque Analytics
**Question**: How can the UI eliminate opaque analytics or unreadable visualizations to ensure transparent data-driven decision-making?

**Current State**: Charts use tooltips and legends; transparency could be improved
**Relevant Files**: `src/components/charts/*`, `src/components/HelpTooltip.tsx`
**Priority**: High

### 4. Collaboration Barriers
**Question**: What barriers prevent teams from quickly sharing scenarios or collaborating in the app, and how could these be eliminated?

**Current State**: Boards are user-specific; no sharing mechanism exists
**Relevant Files**: `prisma/schema.prisma` (Board model), board-related procedures
**Priority**: Critical

### 5. Manual Opportunity Analysis
**Question**: Which obstacles slow down opportunity discovery by forcing users to manually analyze data instead of using agentic automation?

**Current State**: Some automation exists (Constellation, Radars); room for expansion
**Relevant Files**: `src/server/trpc/procedures/generateOpportunityConnections.ts`, `src/routes/radars/index.tsx`
**Priority**: High

---

## Reduce

### 6. Navigation Complexity
**Question**: How can the time and clicks needed to compare scenarios and switch between data views be reduced by smarter navigation or unified dashboards?

**Current State**: Tabbed navigation exists; unified dashboard could consolidate views
**Relevant Files**: `src/routes/dashboard/index.tsx`, `src/components/AppNav.tsx`
**Priority**: Medium

### 7. Static Visualization Reliance
**Question**: In what ways can reliance on static charts and spreadsheets for scenario analysis be minimized in favor of interactive visualizations?

**Current State**: Charts use Recharts with basic interactivity; scenario comparison is table-based
**Relevant Files**: `src/components/charts/*`, `src/routes/opportunities/$opportunityId/scenarios.index.tsx`
**Priority**: High

### 8. Cognitive Overload
**Question**: How can cognitive overload be reduced for users analyzing multiple scenarios, market signals, and team comments?

**Current State**: FilterStats helps; more summarization needed
**Relevant Files**: `src/components/FilterStats.tsx`, `src/components/HelpTooltip.tsx`
**Priority**: High

### 9. Paid Collaboration Features
**Question**: How could dependence on paid features for basic collaboration be reduced to promote team input and engagement?

**Current State**: No paid tiers currently implemented; collaboration features TBD
**Relevant Files**: User model, board procedures
**Priority**: Low (future consideration)

### 10. Import/Export Complexity
**Question**: What steps can simplify or streamline the data import/export process for scenarios and opportunity discovery, minimizing technical hurdles?

**Current State**: Export functionality exists; import not yet implemented
**Relevant Files**: `src/utils/export.ts`, `src/components/ExportMenu.tsx`
**Priority**: Medium

### 11. Discovery Noise
**Question**: How can noise and false positives in automated opportunity discovery be minimized while still surfacing outliers?

**Current State**: Basic filtering in radar matches; AI connection generation
**Relevant Files**: `src/server/trpc/procedures/getRadarMatches.ts`, Trend model
**Priority**: High

---

## Raise

### 12. Scenario Chart Quality
**Question**: What UI features can raise the accuracy, usefulness, and beauty of scenario comparison charts (e.g., animated projections, hover insights, timeline playback)?

**Current State**: Table-based comparison; charts exist for other features
**Relevant Files**: `src/routes/opportunities/$opportunityId/scenarios.index.tsx`, chart components
**Priority**: High

### 13. Agentic Scenario Generation
**Question**: How can agentic capabilities be raised to generate new scenario options, simulate outcomes, and suggest ROI strategies automatically?

**Current State**: AI generates projections; Quick Actions for preset scenarios
**Relevant Files**: `src/server/trpc/procedures/createScenario.ts`
**Priority**: High

### 14. Transparency & Auditability
**Question**: What can be done to raise transparency and auditability for all scenario inputs, modeling assumptions, and opportunity rankings?

**Current State**: Assumptions displayed; audit trails not comprehensive
**Relevant Files**: Scenario model, createScenario procedure
**Priority**: Medium

### 15. Collaboration Depth
**Question**: How can collaboration tools be deepened to allow for multi-user chat, in-line comments, version control, and conflict resolution?

**Current State**: Comment model exists; multi-user features not implemented
**Relevant Files**: Comment model, StrategySession model, board routes
**Priority**: Critical

### 16. Engagement Analytics
**Question**: In what ways can advanced analytics raise the ability to track scenario engagement—who viewed which, when, and for how long?

**Current State**: No engagement tracking implemented
**Relevant Files**: Would require new models and procedures
**Priority**: Low

### 17. Radar Discovery Power
**Question**: How can agentic automation raise the number and relevancy of blue ocean opportunities discovered with trend radar and multi-source analysis?

**Current State**: Basic radar matching; room for AI enhancement
**Relevant Files**: `src/server/trpc/procedures/getRadarMatches.ts`, Trend model
**Priority**: High

### 18. Export & Integration Options
**Question**: What additional export formats, API connections, or integrations could raise the reach and utility of your scenario and opportunity data?

**Current State**: CSV/JSON export; no external APIs
**Relevant Files**: `src/utils/export.ts`, `src/components/ExportMenu.tsx`
**Priority**: Medium

### 19. Audience-Specific Visualizations
**Question**: How can visualization frameworks be enhanced to raise clarity for C-suite, analyst, and investor audiences?

**Current State**: Single visualization style for all users
**Relevant Files**: Chart components, market and scenario routes
**Priority**: Medium

### 20. What-If Modeling Impact
**Question**: How can the app raise the impact of scenario "what-if" modeling by combining market, competitor, and trend data sources?

**Current State**: AI uses opportunity context; could incorporate more data sources
**Relevant Files**: `src/server/trpc/procedures/createScenario.ts`, Market/Competitor/Trend models
**Priority**: High

---

## Create

### 21. Interactive Scenario Charts
**Question**: How might interactive scenario comparison charts be created to show real-time changes in revenue, market share, and ROI as assumptions are adjusted?

**Current State**: Not implemented
**Relevant Files**: Would enhance `src/routes/opportunities/$opportunityId/scenarios.index.tsx`
**Priority**: High
**Implementation Notes**: Real-time recalculation without full DB persistence

### 22. Team Collaboration Module
**Question**: What new team collaboration modules could be developed for sharing scenarios, assigning roles, leaving comments, and reviewing suggestions in one feed?

**Current State**: Not implemented
**Relevant Files**: Board model, new procedures needed
**Priority**: Critical
**Implementation Notes**: Activity feed, member management, role-based access

### 23. Smart Alerts
**Question**: How can the agent create smart alerts for scenario changes, new blue ocean opportunities, or emerging risks detected in external data streams?

**Current State**: Radar alerts exist; scenario/risk alerts not implemented
**Relevant Files**: Radar model, would need background job
**Priority**: High
**Implementation Notes**: Expand radar criteria, add monitoring service

### 24. Digital Workshop Features
**Question**: What would digital workshop or consensus-building features look like for teams making strategic decisions with scenario analysis?

**Current State**: Not implemented
**Relevant Files**: Strategy route, board routes
**Priority**: Medium
**Implementation Notes**: Voting, ranking, structured decision processes

### 25. Advanced Trend Visualizations
**Question**: How could advanced visualization (network graphs, heatmaps, time-lapse) be created for the trend radar to spot hidden blue ocean shifts?

**Current State**: Constellation chart exists; trend-specific visualizations not implemented
**Relevant Files**: `src/components/charts/OpportunityConstellationChart.tsx`, radar route
**Priority**: Medium
**Implementation Notes**: Adapt existing network graph, add heatmap/time-series

### 26. Template Marketplace
**Question**: What marketplace or premium feature could be created for buying/selling scenario templates or expert analytic reports?

**Current State**: Not implemented
**Relevant Files**: Would require new Template model, marketplace procedures
**Priority**: Low (future monetization)
**Implementation Notes**: Payment integration, seller accounts, template storage

### 27. Gamification Elements
**Question**: How can light gamification elements (scenario "leaderboards", badges for best insights, weekly challenges) foster engagement and monetization?

**Current State**: Not implemented
**Relevant Files**: User model, InsightBreadcrumb model
**Priority**: Low
**Implementation Notes**: Points system, badges, engagement tracking

### 28. External System APIs
**Question**: What APIs or agentic plugins can be created for automatic import/export of scenario results to CRM, investor portfolios, or external BI systems?

**Current State**: Not implemented
**Relevant Files**: Export utilities, would need API endpoints
**Priority**: Medium
**Implementation Notes**: RESTful/GraphQL API, webhooks, API key auth

### 29. Audit Trail Transparency
**Question**: How could full transparency audit-trails be created for agentic opportunity discovery—users see what led to each suggestion?

**Current State**: Not implemented
**Relevant Files**: Opportunity-related models and procedures
**Priority**: High
**Implementation Notes**: Log AI reasoning, criteria, steps in JSON format

### 30. Monetization Models
**Question**: What new monetization models (subscription, pay-per-export, AI insights, white-labeling) could turn scenario comparison and automated discovery into a profitable engine for growth?

**Current State**: No monetization implemented
**Relevant Files**: User model, all AI procedures, export utilities
**Priority**: Medium (business model)
**Implementation Notes**: Subscription tiers, feature gating, payment processing

---

## Priority Matrix

### Critical (Foundational for Team Use)
- Q4: Collaboration Barriers
- Q15: Collaboration Depth
- Q22: Team Collaboration Module

### High (Core Feature Enhancement)
- Q2: Manual Chart Generation
- Q3: Opaque Analytics
- Q5: Manual Opportunity Analysis
- Q7: Static Visualization Reliance
- Q8: Cognitive Overload
- Q11: Discovery Noise
- Q12: Scenario Chart Quality
- Q13: Agentic Scenario Generation
- Q17: Radar Discovery Power
- Q20: What-If Modeling Impact
- Q21: Interactive Scenario Charts
- Q23: Smart Alerts
- Q29: Audit Trail Transparency

### Medium (Enhancement & Expansion)
- Q1: Scenario Comparison UI Clutter
- Q6: Navigation Complexity
- Q10: Import/Export Complexity
- Q14: Transparency & Auditability
- Q18: Export & Integration Options
- Q19: Audience-Specific Visualizations
- Q24: Digital Workshop Features
- Q25: Advanced Trend Visualizations
- Q28: External System APIs
- Q30: Monetization Models

### Low (Future Considerations)
- Q9: Paid Collaboration Features
- Q16: Engagement Analytics
- Q26: Template Marketplace
- Q27: Gamification Elements

---

## Implementation Roadmap Suggestions

### Phase 1: Foundation (Collaboration & Core UX)
Focus on questions: 4, 15, 22, 3, 8

### Phase 2: Agentic Intelligence
Focus on questions: 5, 11, 13, 17, 20, 29

### Phase 3: Visualization Excellence
Focus on questions: 7, 12, 21, 25

### Phase 4: Automation & Alerts
Focus on questions: 2, 23

### Phase 5: Integration & Monetization
Focus on questions: 18, 28, 30

---

## Notes for Product Development

- **Collaboration features** (Q4, Q15, Q22) are marked as critical because they unlock team-based value and differentiate from single-user tools
- **Agentic capabilities** (Q5, Q13, Q17, Q20) align with the app's core value proposition of AI-powered blue ocean discovery
- **Visualization improvements** (Q7, Q12, Q21) directly impact user decision-making quality
- **Transparency** (Q3, Q14, Q29) builds trust in AI-generated insights
- **Monetization** (Q30) should be considered alongside feature development to ensure sustainable growth

---

## Cross-References

### Related Models
- Board, Scenario, Opportunity, Market, Competitor, Trend
- User, Comment, StrategySession, Radar
- OpportunityConnection, InsightBreadcrumb

### Key Procedures
- createScenario, getRadarMatches, generateOpportunityConnections
- strategyChatStream, generateVibeCheck
- Board management procedures

### Key Components
- Chart components (Constellation, Status, Segment, Trends)
- AppNav, ExportMenu, FilterStats, HelpTooltip
- Scenario comparison UI

---

*Last Updated: [Auto-generated]*
*Version: 1.0*

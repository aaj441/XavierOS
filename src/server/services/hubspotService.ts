/**
 * HubSpot CRM Integration Service
 * Manages leads, contacts, companies, and deals for Lucy
 */

export interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  website?: string;
  lucy_wcag_issues?: number;
  lucy_last_analyzed?: string;
  lucy_pdf_report_url?: string;
  lucy_accessibility_score?: number;
  lucy_lead_source?: string;
  lucy_vertical?: string;
  lucy_location?: string;
}

export interface HubSpotCompany {
  name: string;
  domain?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lucy_wcag_compliance_status?: string;
  lucy_critical_issues?: number;
  lucy_high_issues?: number;
  lucy_medium_issues?: number;
  lucy_low_issues?: number;
}

export interface HubSpotDeal {
  dealname: string;
  dealstage: string;
  pipeline: string;
  amount?: number;
  closedate?: string;
  lucy_wcag_issue_count?: number;
  lucy_estimated_fix_cost?: number;
  lucy_lawsuit_risk_score?: number;
}

export class HubSpotService {
  private accessToken: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Create or update a contact in HubSpot
   */
  async createContact(properties: HubSpotContact): Promise<string> {
    const url = `${this.baseUrl}/crm/v3/objects/contacts`;

    // Check if contact exists first
    const existing = await this.findContactByEmail(properties.email);
    if (existing) {
      return this.updateContact(existing.id, properties);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Update an existing contact
   */
  async updateContact(contactId: string, properties: Partial<HubSpotContact>): Promise<string> {
    const url = `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    return contactId;
  }

  /**
   * Find contact by email
   */
  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    const url = `${this.baseUrl}/crm/v3/objects/contacts/search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  /**
   * Create a company in HubSpot
   */
  async createCompany(properties: HubSpotCompany): Promise<string> {
    const url = `${this.baseUrl}/crm/v3/objects/companies`;

    // Check if company exists
    if (properties.domain) {
      const existing = await this.findCompanyByDomain(properties.domain);
      if (existing) {
        return this.updateCompany(existing.id, properties);
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Update a company
   */
  async updateCompany(companyId: string, properties: Partial<HubSpotCompany>): Promise<string> {
    const url = `${this.baseUrl}/crm/v3/objects/companies/${companyId}`;

    await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    return companyId;
  }

  /**
   * Find company by domain
   */
  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    const url = `${this.baseUrl}/crm/v3/objects/companies/search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'domain',
                operator: 'EQ',
                value: domain,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  /**
   * Create a deal in HubSpot
   */
  async createDeal(
    properties: HubSpotDeal,
    contactId: string,
    companyId: string
  ): Promise<string> {
    const url = `${this.baseUrl}/crm/v3/objects/deals`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties,
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
          },
          {
            to: { id: companyId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Log email engagement to HubSpot
   */
  async logEmail(
    contactId: string,
    email: {
      subject: string;
      body: string;
      sentAt: Date;
      status: 'sent' | 'opened' | 'clicked' | 'bounced';
    }
  ): Promise<void> {
    const url = `${this.baseUrl}/crm/v3/objects/emails`;

    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          hs_timestamp: email.sentAt.toISOString(),
          hs_email_direction: 'EMAIL',
          hs_email_status: email.status.toUpperCase(),
          hs_email_subject: email.subject,
          hs_email_text: email.body,
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 198 }],
          },
        ],
      }),
    });
  }

  /**
   * Lucy-specific: Sync complete lead to HubSpot
   */
  async syncLucyLead(lead: {
    businessName: string;
    email: string;
    phone?: string;
    website: string;
    address: string;
    wcagIssueCount: number;
    accessibilityScore: number;
    pdfReportUrl: string;
    vertical: string;
    estimatedValue: number;
  }): Promise<{
    contactId: string;
    companyId: string;
    dealId: string;
  }> {
    // Parse domain from website
    const domain = new URL(lead.website).hostname;

    // Create company
    const companyId = await this.createCompany({
      name: lead.businessName,
      domain,
      phone: lead.phone,
      address: lead.address,
      lucy_wcag_compliance_status:
        lead.wcagIssueCount > 50
          ? 'non_compliant'
          : lead.wcagIssueCount > 20
            ? 'partially_compliant'
            : 'compliant',
      lucy_critical_issues: Math.floor(lead.wcagIssueCount * 0.15),
      lucy_high_issues: Math.floor(lead.wcagIssueCount * 0.35),
      lucy_medium_issues: Math.floor(lead.wcagIssueCount * 0.35),
      lucy_low_issues: Math.floor(lead.wcagIssueCount * 0.15),
    });

    // Create contact
    const contactId = await this.createContact({
      email: lead.email,
      company: lead.businessName,
      phone: lead.phone,
      website: lead.website,
      lucy_wcag_issues: lead.wcagIssueCount,
      lucy_last_analyzed: new Date().toISOString(),
      lucy_pdf_report_url: lead.pdfReportUrl,
      lucy_accessibility_score: lead.accessibilityScore,
      lucy_lead_source: 'lucy_discovery',
      lucy_vertical: lead.vertical,
      lucy_location: lead.address,
    });

    // Create deal
    const dealId = await this.createDeal(
      {
        dealname: `${lead.businessName} - Accessibility Remediation`,
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        amount: lead.estimatedValue,
        closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        lucy_wcag_issue_count: lead.wcagIssueCount,
        lucy_estimated_fix_cost: lead.estimatedValue,
        lucy_lawsuit_risk_score: Math.min(10, Math.floor(lead.wcagIssueCount / 10)),
      },
      contactId,
      companyId
    );

    return { contactId, companyId, dealId };
  }
}


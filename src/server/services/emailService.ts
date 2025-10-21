/**
 * Email Service - Supports Gmail, Outlook, and SendGrid
 * Sends Lucy outreach emails with tracking
 */

export interface EmailMessage {
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

export interface EmailProvider {
  send(message: EmailMessage): Promise<string>; // Returns message ID
}

/**
 * Gmail provider using Gmail API
 */
export class GmailProvider implements EmailProvider {
  constructor(private accessToken: string) {}

  async send(message: EmailMessage): Promise<string> {
    // Create MIME message
    const messageParts = [
      `From: ${message.from}`,
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      message.replyTo ? `Reply-To: ${message.replyTo}` : '',
      message.cc ? `Cc: ${message.cc.join(', ')}` : '',
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      message.htmlBody || message.textBody,
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
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }
}

/**
 * Outlook provider using Microsoft Graph API
 */
export class OutlookProvider implements EmailProvider {
  constructor(private accessToken: string) {}

  async send(message: EmailMessage): Promise<string> {
    const url = 'https://graph.microsoft.com/v1.0/me/sendMail';

    const emailPayload = {
      message: {
        subject: message.subject,
        body: {
          contentType: message.htmlBody ? 'HTML' : 'Text',
          content: message.htmlBody || message.textBody,
        },
        toRecipients: [
          {
            emailAddress: {
              address: message.to,
            },
          },
        ],
        from: {
          emailAddress: {
            address: message.from,
          },
        },
        replyTo: message.replyTo
          ? [
              {
                emailAddress: {
                  address: message.replyTo,
                },
              },
            ]
          : undefined,
        ccRecipients: message.cc?.map((email) => ({
          emailAddress: { address: email },
        })),
        attachments: message.attachments?.map((att) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.filename,
          contentType: att.contentType,
          contentBytes: att.data.toString('base64'),
        })),
      },
      saveToSentItems: true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      throw new Error(`Outlook API error: ${response.statusText}`);
    }

    return 'sent'; // Outlook doesn't return message ID directly
  }
}

/**
 * SendGrid provider (fallback/transactional)
 */
export class SendGridProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async send(message: EmailMessage): Promise<string> {
    const url = 'https://api.sendgrid.com/v3/mail/send';

    const payload = {
      personalizations: [
        {
          to: [{ email: message.to }],
          subject: message.subject,
          cc: message.cc?.map((email) => ({ email })),
          bcc: message.bcc?.map((email) => ({ email })),
        },
      ],
      from: {
        email: message.from,
        name: 'Lucy Accessibility',
      },
      reply_to: message.replyTo
        ? {
            email: message.replyTo,
          }
        : undefined,
      content: [
        {
          type: 'text/plain',
          value: message.textBody,
        },
        message.htmlBody
          ? {
              type: 'text/html',
              value: message.htmlBody,
            }
          : null,
      ].filter(Boolean),
      attachments: message.attachments?.map((att) => ({
        content: att.data.toString('base64'),
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment',
      })),
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    const messageId = response.headers.get('X-Message-Id');
    return messageId || 'sent';
  }
}

/**
 * Main EmailService class
 */
export class EmailService {
  private provider: EmailProvider;

  constructor(
    providerType: 'gmail' | 'outlook' | 'sendgrid',
    credentials: {
      accessToken?: string;
      apiKey?: string;
    }
  ) {
    switch (providerType) {
      case 'gmail':
        if (!credentials.accessToken) throw new Error('Gmail requires accessToken');
        this.provider = new GmailProvider(credentials.accessToken);
        break;
      case 'outlook':
        if (!credentials.accessToken) throw new Error('Outlook requires accessToken');
        this.provider = new OutlookProvider(credentials.accessToken);
        break;
      case 'sendgrid':
        if (!credentials.apiKey) throw new Error('SendGrid requires apiKey');
        this.provider = new SendGridProvider(credentials.apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerType}`);
    }
  }

  async sendEmail(message: EmailMessage): Promise<string> {
    return this.provider.send(message);
  }

  /**
   * Lucy-specific: Send WCAG outreach email
   */
  async sendLucyOutreach(params: {
    to: string;
    from: string;
    businessName: string;
    wcagIssueCount: number;
    industry: string;
    emailBody: string;
    pdfAttachment?: {
      filename: string;
      data: Buffer;
    };
  }): Promise<string> {
    const message: EmailMessage = {
      to: params.to,
      from: params.from,
      replyTo: params.from,
      subject: `${params.wcagIssueCount} Accessibility Issues Found - ${params.businessName}`,
      textBody: this.stripHtml(params.emailBody),
      htmlBody: params.emailBody,
      attachments: params.pdfAttachment
        ? [
            {
              filename: params.pdfAttachment.filename,
              contentType: 'application/pdf',
              data: params.pdfAttachment.data,
            },
          ]
        : undefined,
    };

    return this.sendEmail(message);
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}


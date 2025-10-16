import { env } from "~/server/env";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!env.EMAIL_ENABLED) {
    console.log("Email disabled, skipping email send to:", to);
    return;
  }

  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    console.warn("Email credentials not configured, skipping email send");
    return;
  }

  try {
    // Dynamic import of nodemailer to avoid bundling issues
    const nodemailer = await import("nodemailer");
    
    const transporter = nodemailer.default.createTransport({
      host: env.EMAIL_HOST,
      port: parseInt(env.EMAIL_PORT),
      secure: env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw - email failures shouldn't break the app
  }
}

type ScanCompleteEmailData = {
  userName: string;
  projectName: string;
  url: string;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  riskScore: number;
  scanUrl: string;
};

export async function sendScanCompleteEmail(
  to: string,
  data: ScanCompleteEmailData
): Promise<void> {
  const subject = `Accessibility Scan Complete - ${data.projectName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats { display: table; width: 100%; margin: 20px 0; }
          .stat { display: table-cell; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 5px; }
          .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .critical { color: #dc2626; }
          .serious { color: #ea580c; }
          .moderate { color: #ca8a04; }
          .minor { color: #2563eb; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔍 Scan Complete</h1>
            <p>Your accessibility scan has finished</p>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>The accessibility scan for <strong>${data.url}</strong> in project <strong>${data.projectName}</strong> has completed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <div style="font-size: 48px; font-weight: bold; color: ${data.riskScore > 70 ? '#dc2626' : data.riskScore > 40 ? '#ea580c' : '#10b981'};">
                ${data.riskScore}
              </div>
              <div style="color: #666; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Risk Score</div>
            </div>
            
            <h3>Issues Found: ${data.totalIssues}</h3>
            <div class="stats">
              <div class="stat">
                <div class="stat-value critical">${data.criticalIssues}</div>
                <div class="stat-label">Critical</div>
              </div>
              <div class="stat">
                <div class="stat-value serious">${data.seriousIssues}</div>
                <div class="stat-label">Serious</div>
              </div>
              <div class="stat">
                <div class="stat-value moderate">${data.moderateIssues}</div>
                <div class="stat-label">Moderate</div>
              </div>
              <div class="stat">
                <div class="stat-value minor">${data.minorIssues}</div>
                <div class="stat-label">Minor</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.scanUrl}" class="button">View Full Report</a>
            </div>
            
            <div class="footer">
              <p>This is an automated message from Lucy Accessibility Scanner</p>
              <p>You received this email because you have notifications enabled for this project</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

type ScanErrorEmailData = {
  userName: string;
  projectName: string;
  url: string;
  error: string;
};

export async function sendScanErrorEmail(
  to: string,
  data: ScanErrorEmailData
): Promise<void> {
  const subject = `Scan Failed - ${data.projectName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .error-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Scan Failed</h1>
            <p>An error occurred during the accessibility scan</p>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>The accessibility scan for <strong>${data.url}</strong> in project <strong>${data.projectName}</strong> encountered an error and could not complete.</p>
            
            <div class="error-box">
              <strong>Error Details:</strong><br>
              ${data.error}
            </div>
            
            <p>Please check the URL and try running the scan again. If the problem persists, ensure that:</p>
            <ul>
              <li>The URL is accessible and returns a valid HTML page</li>
              <li>The website doesn't block automated scanners</li>
              <li>The page loads within the timeout period (30 seconds)</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated message from Lucy Accessibility Scanner</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

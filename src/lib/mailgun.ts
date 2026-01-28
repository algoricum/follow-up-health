import Mailgun from 'mailgun.js';
import FormData from 'form-data';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    return null;
  }

  const mailgun = new Mailgun(FormData);
  return mailgun.client({
    username: 'api',
    key: apiKey,
  });
}

export async function sendEmail({ to, subject, html }: EmailData): Promise<boolean> {
  const domain = process.env.MAILGUN_DOMAIN;
  const apiKey = process.env.MAILGUN_API_KEY;
  const mg = getMailgunClient();

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [EMAIL] Starting email send`);
  console.log(`[${timestamp}] [EMAIL] Recipient: ${to}`);
  console.log(`[${timestamp}] [EMAIL] Subject: ${subject}`);
  console.log(`[${timestamp}] [EMAIL] Domain: ${domain || 'NOT SET'}`);
  console.log(`[${timestamp}] [EMAIL] API Key configured: ${!!apiKey}`);

  if (!mg || !domain) {
    console.warn(`[${timestamp}] [EMAIL] Mailgun not configured - domain or API key missing. Skipping email send.`);
    return false;
  }

  try {
    console.log(`[${timestamp}] [EMAIL] Sending email via Mailgun...`);
    const result = await mg.messages.create(domain, {
      from: `Follow-Up Health <noreply@${domain}>`,
      to: [to],
      subject,
      html,
    });
    
    const messageId = result?.id || 'unknown';
    console.log(`[${timestamp}] [EMAIL] ✓ Email sent successfully`);
    console.log(`[${timestamp}] [EMAIL] Message ID: ${messageId}`);
    console.log(`[${timestamp}] [EMAIL] Recipient: ${to}`);
    return true;
  } catch (error: unknown) {
    console.error(`[${timestamp}] [EMAIL] ✗ Failed to send email`);
    console.error(`[${timestamp}] [EMAIL] Recipient: ${to}`);
    console.error(`[${timestamp}] [EMAIL] Error:`, error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { body?: unknown } };
      console.error(`[${timestamp}] [EMAIL] Mailgun API response:`, err.response?.body);
    }
    return false;
  }
}

export interface SnapshotEmailData {
  grade: string;
  riskLow: number;
  riskHigh: number;
  dropoffPercent: number;
  drivers: { title: string; description: string }[];
  scores: {
    speed: number;
    persistence: number;
    coverage: number;
  };
}

/** Returns the stats block only (grade, revenue, drivers, scores) as HTML fragment. */
export function generateSnapshotBlock(data: SnapshotEmailData): string {
  const driversList = data.drivers
    .map((d) => {
      const isWorking = d.title.includes('(Working)');
      const bgColor = isWorking ? '#ECFDF5' : '#FEF2F2';
      const borderColor = isWorking ? '#A7F3D0' : '#FECACA';
      const iconBg = isWorking ? '#D1FAE5' : '#FEE2E2';
      const icon = isWorking ? '✓' : '⚠️';

      return `<li style="margin-bottom: 12px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="background: ${iconBg}; border-radius: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px;">${icon}</div>
          <div>
            <div style="font-weight: 600; color: #1E3A5F; font-size: 14px; margin-bottom: 4px;">${d.title}</div>
            <div style="color: #475569; font-size: 12px; line-height: 1.4;">${d.description}</div>
          </div>
        </div>
      </li>`;
    })
    .join('');

  return `
    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h1 style="color: #1E3A5F; font-size: 24px; margin: 0 0 16px 0;">Your Follow-Up Health Snapshot</h1>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="background: white; border-radius: 8px; padding: 16px; flex: 1; min-width: 120px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #0D9488;">${data.grade}</div>
          <div style="color: #64748B; font-size: 14px;">Grade</div>
        </div>
        <div style="background: white; border-radius: 8px; padding: 16px; flex: 2; min-width: 200px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #E11D48;">$${data.riskLow.toLocaleString()} - $${data.riskHigh.toLocaleString()}</div>
          <div style="color: #64748B; font-size: 14px;">Monthly Revenue at Risk</div>
        </div>
      </div>
    </div>
    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1E3A5F; font-size: 18px; margin: 0 0 16px 0;">The 3 Places Momentum Usually Dies</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">${driversList}</ul>
    </div>
    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1E3A5F; font-size: 18px; margin: 0 0 16px 0;">Component Scores</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Speed</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.scores.speed}/100</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Persistence</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.scores.persistence}/100</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748B;">Coverage</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.scores.coverage}/100</td>
        </tr>
      </table>
    </div>
  `;
}

export interface BuildEmailHtmlOptions {
  /** Admin-editable template body (plain text or HTML). */
  customContent: string;
  /** Placeholder values for customContent. */
  placeholders: {
    grade: string;
    risk_low: string;
    risk_high: string;
    dropoff_percent: string;
  };
}

/**
 * Builds full email HTML: custom content (from template) + stats block + CTA + footer.
 * Always includes both configurable content and scores/stats.
 */
export function buildEmailHtml(opts: BuildEmailHtmlOptions): string {
  const { customContent, placeholders } = opts;

  const replacePlaceholders = (text: string) =>
    text
      .replace(/\{\{grade\}\}/g, placeholders.grade)
      .replace(/\{\{risk_low\}\}/g, placeholders.risk_low)
      .replace(/\{\{risk_high\}\}/g, placeholders.risk_high)
      .replace(/\{\{dropoff_percent\}\}/g, placeholders.dropoff_percent);

  const custom = replacePlaceholders(customContent.trim());
  const looksLikeHtml = /<[^>]+>/.test(custom);
  const customHtml = looksLikeHtml ? custom : custom.replace(/\n/g, '<br>');
  const enhancedCustomHtml = customHtml.replace(/<a\b([^>]*?)>/gi, (match, attrs) => {
    const hrefMatch = attrs.match(/\bhref=(["'])(.*?)\1/i);
    if (!hrefMatch) {
      return match;
    }

    const hrefValue = hrefMatch[2].trim();
    const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(hrefValue);
    const isMailOrTel = /^(mailto:|tel:)/i.test(hrefValue);
    let nextAttrs = attrs;
    if (!hasProtocol && !isMailOrTel) {
      const normalizedHref = `https://${hrefValue}`;
      nextAttrs = nextAttrs.replace(hrefMatch[0], `href="${normalizedHref}"`);
    }

    if (!/style=/.test(nextAttrs)) {
      nextAttrs = ` style="color: #0D9488; text-decoration: underline;"${nextAttrs}`;
    }
    if (!/target=/.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} target="_blank"`;
    }
    if (!/rel=/.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} rel="noopener noreferrer"`;
    }

    return `<a${nextAttrs}>`;
  });

  const main = custom
    ? `<div style="background-color: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px; color: #1E3A5F; line-height: 1.6;">
      <div>${enhancedCustomHtml}</div>
    </div>`
    : '';
console.log(main);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1E3A5F; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${main}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px;">
        <p>This snapshot was generated by the Follow-Up Health Dashboard.</p>
      </div>
    </body>
    </html>
  `;
}

/** Legacy: full snapshot email (no custom content). Prefer buildEmailHtml for template support. */
export function generateSnapshotHtml(data: SnapshotEmailData): string {
  const block = generateSnapshotBlock(data);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1E3A5F; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${block}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px;">
        <p>This snapshot was generated by the Follow-Up Health Dashboard.</p>
      </div>
    </body>
    </html>
  `;
}

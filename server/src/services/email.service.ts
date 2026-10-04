import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config/env.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    if (config.smtpHost && config.smtpUser && config.smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });
      return this.transporter;
    }

    return null;
  }

  /**
   * Send a transactional verification email to staff members (Operations / Agents)
   */
  public static async sendVerificationEmail(data: {
    name: string;
    email: string;
    verificationLink: string;
    role: string;
  }): Promise<void> {
    const roleTitle = data.role === 'EMPLOYEE' ? 'Operations' : 'Real Estate Agent';
    let cleanUrl = (data.verificationLink || '').trim();
    while (/^(http:\/\/|https:\/\/)?CLIENT_URL=/i.test(cleanUrl)) {
      cleanUrl = cleanUrl.replace(/^(http:\/\/|https:\/\/)?CLIENT_URL=/i, '').trim();
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `http://${cleanUrl}`;
    }

    const html = [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">',
      '  <div style="margin-bottom: 20px; border-bottom: 2px solid #0284c7; padding-bottom: 12px;">',
      '    <h2 style="color: #0f172a; margin: 0;">SKYLINE CRM</h2>',
      '    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Corporate Security & Account Activation</p>',
      '  </div>',
      '  <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>' + data.name + '</strong>,</p>',
      '  <p style="color: #334155; font-size: 14px; line-height: 1.6;">',
      '    Thank you for registering as a <strong>' + roleTitle + '</strong> on the SKYLINE CRM enterprise portal.',
      '  </p>',
      '  <p style="color: #334155; font-size: 14px; line-height: 1.6;">',
      '    To activate your staff credentials and proceed to the portal, please verify your corporate email address by clicking the button below:',
      '  </p>',
      '  <div style="margin: 28px 0; text-align: center;">',
      '    <a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">',
      '      Verify Corporate Email',
      '    </a>',
      '  </div>',
      '  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 16px; word-break: break-all;">',
      '    If the button above is not clickable, copy and paste this URL into your browser:<br />',
      '    <a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">' + cleanUrl + '</a>',
      '  </p>',
      '  <p style="color: #64748b; font-size: 12px; line-height: 1.5;">',
      '    This verification link is single-use and will expire in 24 hours. If you did not request this registration, no further action is required.',
      '  </p>',
      '  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />',
      '  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">',
      '    &copy; ' + new Date().getFullYear() + ' Skyline Realty Group. All rights reserved. Confidential corporate communication.',
      '  </p>',
      '</div>',
    ].join('\n');

    const text = [
      `Hello ${data.name},`,
      '',
      `Thank you for registering as a ${roleTitle} on the SKYLINE CRM enterprise portal.`,
      '',
      'To activate your staff credentials and proceed to the portal, please verify your corporate email address by clicking the link below:',
      cleanUrl,
      '',
      'This verification link is single-use and will expire in 24 hours. If you did not request this registration, no further action is required.',
      '',
      `© ${new Date().getFullYear()} Skyline Realty Group. All rights reserved. Confidential corporate communication.`,
    ].join('\n');

    const transporter = this.getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: config.smtpFrom,
          to: data.email,
          subject: 'Verify Your Skyline CRM Corporate Account',
          html,
          text,
        });
        console.log('[EmailService] Live verification email delivered via SMTP to ' + data.email + ' (' + roleTitle + ')');
      } catch (err: any) {
        console.error('[EmailService] Failed to send email via SMTP to ' + data.email + ':', err.message);
      }
    } else {
      console.warn('[EmailService] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in .env. Live internet dispatch skipped for ' + data.email + ' (' + roleTitle + ')');
    }
  }
}

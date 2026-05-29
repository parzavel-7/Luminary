import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendScanAlert = async (email: string, url: string, score: number, previousScore?: number) => {
  try {
    let subject = `Luminary Audit Complete: ${url}`;
    let message = `Your accessibility audit for ${url} is complete. Your current score is ${score}%.`;

    if (previousScore !== undefined) {
      if (score < previousScore) {
        subject = `⚠️ Alert: Accessibility Score Drop for ${url}`;
        message = `Attention: Your accessibility score for ${url} has dropped from ${previousScore}% to ${score}%. Please review the latest violations in your dashboard.`;
      }
    }

    const { data, error } = await resend.emails.send({
      from: 'Luminary <alerts@luminary-audit.com>',
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
          <h1 style="color: #3b83f5;">Luminary Audit Results</h1>
          <p>${message}</p>
          <div style="margin: 30px 0; padding: 20px; background: #f4f4f4; border-radius: 10px;">
            <p style="font-size: 24px; font-weight: bold; margin: 0;">Score: ${score}%</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">
            View Full Report
          </a>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

export const sendScanFailureAlert = async (email: string, url: string, errorMessage: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Luminary <alerts@luminary-audit.com>',
      to: [email],
      subject: `❌ Luminary Audit Failed: ${url}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
          <h1 style="color: #ef4444; font-weight: 300;">Luminary Audit Failed</h1>
          <p>We encountered an issue while auditing your website: <strong>${url}</strong>.</p>
          <div style="margin: 30px 0; padding: 20px; background: #fee2e2; color: #991b1b; border-radius: 10px; border-left: 4px solid #ef4444;">
            <p style="font-size: 14px; font-weight: bold; margin: 0;">Error Details:</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 13px;">${errorMessage}</p>
          </div>
          <p>Our background worker attempted to scan the site multiple times, but it repeatedly failed. This could be due to network timeouts, a firewalled host, or the website actively blocking our crawler request.</p>
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 13px;">
              Go to Command Center
            </a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send failure email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email failure service error:', error);
    return { success: false, error };
  }
};

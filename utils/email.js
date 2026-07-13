const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { smtp } = config;
  if (smtp.host && smtp.user && smtp.pass) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }
  return transporter;
}

async function sendPasswordResetEmail(email, token) {
  const transport = getTransporter();
  const resetUrl = `${config.siteUrl}/auth/reset-password?token=${token}`;

  if (!transport) {
    console.log(`[EMAIL] Password reset for ${email}: ${resetUrl}`);
    return;
  }

  await transport.sendMail({
    from: `"Design Resource Finder" <${config.smtp.user}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;">
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0054d6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:14px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };

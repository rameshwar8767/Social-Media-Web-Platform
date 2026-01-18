import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_SMTP_PORT || '25'),  // Port 25 = most reliable
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    },
    connectionTimeout: 10000,  // 10s max
    greetingTimeout: 5000,
    socketTimeout: 10000
  });
  
  console.log('📧 Mailtrap configured');
} catch (error) {
  console.warn('⚠️ Mailtrap setup failed, using dummy mailer');
  transporter = {
    sendMail: async () => ({ messageId: 'dummy-123' })
  };
}

const sendMail = async (options) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: { name: 'LinkUp 👋', link: process.env.FRONTEND_URL || 'http://localhost:5173' }
    });

    const emailContent = {
      body: {
        name: options.name || 'User',
        intro: options.intro || '',
        ...(options.action && {
          action: {
            instructions: options.action.instructions || '',
            button: { color: options.action.color || '#10b981', text: options.action.text, link: options.action.link }
          }
        }),
        outro: options.outro || ''
      }
    };

    const emailText = mailGenerator.generatePlaintext(emailContent);
    const emailBody = mailGenerator.generate(emailContent);

    const info = await transporter.sendMail({
      from: `"LinkUp" <${process.env.MAIL_FROM || 'noreply@linkup.app'}>`,
      to: options.to,
      subject: options.subject,
      text: emailText,
      html: emailBody
    });

    console.log('✅ Email sent:', info.messageId, options.to);
    return info;
  } catch (error) {
    console.error('⚠️ Email failed (continuing):', error.message.split('\n')[0]);
    // Don't throw → Registration continues!
    return { messageId: 'skipped-' + Date.now() };
  }
};

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  await sendMail({
    to: user.email,
    subject: '✅ Verify LinkUp Account',
    name: user.full_name,
    intro: `Welcome ${user.full_name}!`,
    action: { instructions: 'Verify:', color: '#10b981', text: 'Verify Email', link: url },
    outro: '24h expiry.'
  });
  console.log(`✅ Verification setup for: ${user.email}`);
};

export const sendResetPasswordEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  await sendMail({
    to: user.email,
    subject: '🔑 Reset Password',
    name: user.full_name,
    intro: 'Password reset requested.',
    action: { instructions: 'Reset:', color: '#ef4444', text: 'Reset Now', link: url },
    outro: '15min expiry.'
  });
};

export default { sendMail, sendVerificationEmail, sendResetPasswordEmail };

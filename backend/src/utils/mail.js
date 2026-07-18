import nodemailer from "nodemailer";

const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
];

const isMailConfigured = requiredEnvVars.every((key) => !!process.env[key]);

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export const sendMail = async ({
  to,
  subject,
  text = "",
  html = "",
  from = process.env.MAIL_FROM,
  attachments = [],
}) => {
  if (!isMailConfigured || !transporter) {
    throw new Error("Mail service is not configured properly");
  }

  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return info;
};

export const verifyMailConnection = async () => {
  if (!isMailConfigured || !transporter) {
    return false;
  }

  await transporter.verify();
  return true;
};

export default transporter;
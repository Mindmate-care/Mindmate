// Backend/utils/emailService.js
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com";

let transporter = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * sendMail - send via SMTP if configured; otherwise log for local/dev
 * @param {{to:string, subject:string, text?:string, html?:string}} mail
 */
export const sendMail = async ({ to, subject, text, html }) => {
  if (transporter) {
    return transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });
  } else {
    // Fallback: log to console so OTPs are visible during development
    console.log("==== Email fallback ====");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
    if (html) console.log("HTML:", html);
    console.log("=======================");
    return { fallback: true };
  }
};

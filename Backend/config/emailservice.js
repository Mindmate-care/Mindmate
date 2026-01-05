// utils/emailService.js
import axios from "axios";

export const sendMail = async ({ to, subject, text }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "MindMate", email: "care.mindmate@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: `<p>${text}</p>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Brevo email sent to ${to}`);
  } catch (err) {
    console.error("❌ Brevo email failed:", err.response?.data || err.message);
    throw new Error("Failed to send email");
  }
};



import nodemailer from "nodemailer";

//  Transporter 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Connection
transporter.verify((error) => {
  if (error) {
    console.error("Email service error:", error.message);
  } else {
    console.log("Email service ready");
  }
});

// Send Email Utility 
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email send error:", err.message);
    throw err;
  }
};
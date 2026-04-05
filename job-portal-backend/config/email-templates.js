// Email Verification Template 
export const emailVerificationTemplate = (name, verificationUrl) => ({
  subject: "Verify Your RemoteFlex Email Address",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Welcome to RemoteFlex, ${name}! 👋</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; background-color: #2563eb; color: white; 
                padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verify Email Address
      </a>
      <p style="color: #666;">This link expires in 24 hours.</p>
      <p style="color: #666;">If you did not create an account, ignore this email.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">RemoteFlex — Connecting African Talent to the World</p>
    </div>
  `,
});

// Password Reset Template
export const passwordResetTemplate = (name, resetUrl) => ({
  subject: "Reset Your RemoteFlex Password",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Password Reset Request 🔐</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #dc2626; color: white; 
                padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #666;">This link expires in 1 hour.</p>
      <p style="color: #666;">If you did not request a password reset, ignore this email.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">RemoteFlex — Connecting African Talent to the World</p>
    </div>
  `,
});

// Application Status Template 
export const applicationStatusTemplate = (applicantName, jobTitle, companyName, status) => {
  const statusConfig = {
    reviewed: { color: "#2563eb", emoji: "👀", message: "Your application is being reviewed." },
    shortlisted: { color: "#16a34a", emoji: "🎉", message: "Congratulations! You have been shortlisted." },
    rejected: { color: "#dc2626", emoji: "😔", message: "Unfortunately your application was not successful this time." },
  };

  const config = statusConfig[status] || { color: "#666", emoji: "📋", message: "Your application status has been updated." };

  return {
    subject: `Application Update — ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${config.color};">Application Update ${config.emoji}</h2>
        <p>Hi ${applicantName},</p>
        <p>${config.message}</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Job:</strong> ${jobTitle}</p>
          <p style="margin: 8px 0 0;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 8px 0 0;"><strong>Status:</strong> 
            <span style="color: ${config.color}; font-weight: bold; text-transform: capitalize;">${status}</span>
          </p>
        </div>
        <a href="${process.env.CLIENT_URL}/applications" 
           style="display: inline-block; background-color: ${config.color}; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View My Applications
        </a>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">RemoteFlex — Connecting African Talent to the World</p>
      </div>
    `,
  };
};
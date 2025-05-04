
// moodify\src\lib\mail.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Moodify" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export function generateOTPEmail(username: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #8b5cf6; margin-bottom: 5px;">Moodify</h1>
        <p style="color: #6b7280; font-size: 16px;">Your personal music companion</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #4b5563; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">Hi ${username}, thanks for signing up! Please use the following OTP to verify your email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; background-color: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
      </div>
      
      <div style="text-align: center; color: #9ca3af; font-size: 14px;">
        <p>If you didn't sign up for Moodify, you can safely ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} Moodify. All rights reserved.</p>
      </div>
    </div>
  `;
}

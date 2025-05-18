
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #121212; color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);">
      <!-- Header -->
      <div style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: 1px;">Moodify</h1>
        <p style="margin: 5px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Discover music that matches your mood</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px 25px; background-color: #1e1e1e; border-radius: 8px; margin: 0 15px; margin-top: -15px; position: relative;">
        <h2 style="color: #e2e2e2; margin-top: 0; font-size: 22px; text-align: center;">Verify Your Email</h2>
        
        <p style="color: #b0b0b0; margin-bottom: 25px; line-height: 1.5; font-size: 16px;">
          Hello <span style="color: #d8b4fe; font-weight: 600;">${username}</span>,
        </p>
        
        <p style="color: #b0b0b0; margin-bottom: 25px; line-height: 1.5; font-size: 16px;">
          Thank you for joining Moodify! To complete your registration and start your musical journey, please use the verification code below:
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #ffffff; background: linear-gradient(to right, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15)); padding: 20px; border-radius: 12px; display: inline-block; border: 1px solid rgba(139, 92, 246, 0.3);">
            ${otp}
          </div>
        </div>
        
        <p style="color: #b0b0b0; font-size: 15px; margin-bottom: 25px; line-height: 1.5;">
          This verification code will expire in <span style="color: #f9a8d4; font-weight: 600;">10 minutes</span>. If you didn't request this code, please ignore this email.
        </p>
        
        <div style="background-color: #2d2d2d; padding: 15px; border-radius: 8px; margin-top: 30px;">
          <p style="color: #b0b0b0; margin: 0; font-size: 14px; line-height: 1.5;">
            <strong style="color: #e2e2e2;">Need help?</strong> If you're having trouble with the verification process, please contact our support team at <a href="mailto:support@moodify.com" style="color: #a78bfa; text-decoration: none;">support@moodify.com</a>
          </p>
        </div>
      </div>
      
     
        
        <p style="color: #9ca3af; font-size: 14px; margin-bottom: 5px;">
          &copy; ${new Date().getFullYear()} Moodify by <span style="color: #d8b4fe; font-weight: 600;">AuraBeats</span>
        </p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">
          All rights reserved. Crafted with ♫ by AuraBeats team.
        </p>
      </div>
    </div>
  `;
}


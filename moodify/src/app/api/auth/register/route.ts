
// moodify\src\app\api\auth\register\route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendEmail, generateOTPEmail } from '@/lib/mail';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    const newUser = new User({
      username,
      email,
      password,
      isVerified: false,
    });
    
    await newUser.save();
    
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, expiresAt },
      { upsert: true, new: true }
    );
    
    await sendEmail({
      to: email,
      subject: 'Verify your Moodify account',
      html: generateOTPEmail(username, otp),
    });
    
    return NextResponse.json(
      { message: 'User registered successfully. Please verify your email.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

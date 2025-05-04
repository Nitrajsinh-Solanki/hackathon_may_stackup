
// moodify\src\app\api\auth\verify-otp\route.ts


import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return NextResponse.json(
        { message: 'OTP not found. Please request a new one.' },
        { status: 404 }
      );
    }
    
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }
    
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }
    
    await User.findOneAndUpdate(
      { email },
      { isVerified: true }
    );
    
    await OTP.deleteOne({ email });
    
    return NextResponse.json(
      { message: 'Email verified successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
        { message: 'An error occurred during OTP verification' },
        { status: 500 }
      );
    }
  }
  

// hackathon_may_stackup\moodify\src\app\api\user\update-profile\route.ts



import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };
    
    await connectToDatabase();
    
    const { username, email } = await request.json();
    
    if (!username || !email) {
      return NextResponse.json(
        { message: 'Username and email are required' },
        { status: 400 }
      );
    }
    
    // checking if email is already in use by another user
    if (email !== decoded.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== decoded.userId) {
        return NextResponse.json(
          { message: 'Email is already in use' },
          { status: 409 }
        );
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { username, email },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // updating the JWT token with new user info
    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    (await cookies()).set({
      name: 'auth_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

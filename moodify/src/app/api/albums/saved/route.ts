// hackathon_may_stackup\moodify\src\app\api\albums\saved\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
   
    
    // getting the token from cookies
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        username: string;
      };

      
      await connectToDatabase();
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('User not found in database');
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      

      
      const response = { savedAlbums: user.savedAlbums || [] };
      
      
      return NextResponse.json(response, { status: 200 });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Fetch saved albums error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching saved albums' },
      { status: 500 }
    );
  }
}

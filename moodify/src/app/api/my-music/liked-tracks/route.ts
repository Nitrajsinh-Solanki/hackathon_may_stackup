// hackathon_may_stackup\moodify\src\app\api\my-music\liked-tracks\route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
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
    };
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const likedTracks = user.likedTracks || [];
    
    // sorting liked tracks by most recently liked first
    const sortedLikedTracks = [...likedTracks].sort((a, b) => {
      return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
    });
    
    return NextResponse.json(
      { likedTracks: sortedLikedTracks },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch liked tracks error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch liked tracks' },
      { status: 500 }
    );
  }
}

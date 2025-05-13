// hackathon_may_stackup\moodify\src\app\api\my-music\like\batch\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    const { trackIds } = await request.json();
    
    if (!trackIds || !Array.isArray(trackIds)) {
      return NextResponse.json(
        { message: 'Track IDs array is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create a map of liked track IDs for quick lookup
    const likedTrackMap: Record<string, boolean> = {};
    if (user.likedTracks && user.likedTracks.length > 0) {
      user.likedTracks.forEach((track: { trackId: string }) => {
        likedTrackMap[track.trackId] = true;
      });
    }
    
    // Check which tracks are liked
    const results: Record<string, boolean> = {};
    trackIds.forEach((trackId: string) => {
      results[trackId] = !!likedTrackMap[trackId];
    });
    
    return NextResponse.json(
      { results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Batch check like status error:', error);
    return NextResponse.json(
      { message: 'Failed to check like status' },
      { status: 500 }
    );
  }
}

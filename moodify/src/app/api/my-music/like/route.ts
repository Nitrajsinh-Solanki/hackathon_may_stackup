// hackathon_may_stackup\moodify\src\app\api\my-music\like\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
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
    
    const { trackId, title, artist, artwork, duration, genre, mood } = await request.json();
    
    if (!trackId || !title || !artist) {
      return NextResponse.json(
        { message: 'Missing required track information' },
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
    
    // initializing  likedTracks array if it doesn't exist
    if (!user.likedTracks) {
      user.likedTracks = [];
    }
    
    // checking if track is already liked
    const existingTrackIndex = user.likedTracks.findIndex(
      (track: { trackId: any; }) => track.trackId === trackId
    );
    
    let isLiked = false;
    
    if (existingTrackIndex !== -1) {
      user.likedTracks.splice(existingTrackIndex, 1);
    } else {
      user.likedTracks.push({
        trackId,
        title,
        artist,
        artwork,
        duration,
        genre,
        mood,
        likedAt: new Date(),
      });
      isLiked = true;
    }
    
    await user.save();
    
    return NextResponse.json(
      { 
        message: isLiked ? 'Track liked successfully' : 'Track unliked successfully',
        isLiked 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like track error:', error);
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    );
  }
}

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
    
    const trackId = request.nextUrl.searchParams.get('trackId');
    
    if (!trackId) {
      return NextResponse.json(
        { message: 'Track ID is required' },
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
    
    // checking if likedTracks exists before using some()
    const isLiked = user.likedTracks ? 
      user.likedTracks.some((track: { trackId: string; }) => track.trackId === trackId) : 
      false;
    
    return NextResponse.json(
      { isLiked },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check like status error:', error);
    return NextResponse.json(
      { message: 'Failed to check like status' },
      { status: 500 }
    );
  }
}

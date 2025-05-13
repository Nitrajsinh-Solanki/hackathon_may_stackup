// hackathon_may_stackup\moodify\src\app\api\my-music\like\route.ts


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
    
    const isLiked = user.likedTracks.some(
      (track: { trackId: string }) => track.trackId === trackId
    );
    
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Check like status error:', error);
    return NextResponse.json(
      { message: 'Failed to check like status' },
      { status: 500 }
    );
  }
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
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };
    
    const {
      trackId,
      title,
      artist,
      artwork,
      duration,
      genre,
      mood,
      cloudinaryUrl 
    } = await request.json();
    
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
    
    const trackIndex = user.likedTracks.findIndex(
      (track: { trackId: string }) => track.trackId === trackId
    );
    
    let isLiked = false;
    
    if (trackIndex === -1) {
      // Track is not liked, add it to liked tracks
      user.likedTracks.push({
        trackId,
        title,
        artist,
        artwork,
        duration,
        genre,
        mood,
        cloudinaryUrl, 
        likedAt: new Date(),
      });
      isLiked = true;
    } else {
      // track is already liked, remove it
      user.likedTracks.splice(trackIndex, 1);
      isLiked = false;
    }
    
    await user.save();
    
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json(
      { message: 'Failed to toggle like status' },
      { status: 500 }
    );
  }
}

// hackathon_may_stackup\moodify\src\app\api\tracks\[trackId]\like\route.ts



import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { trackId: string } }
) {
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
    
    const trackId = params.trackId;
    
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
    
    // checking if track exists in liked tracks
    if (!user.likedTracks) {
      return NextResponse.json(
        { message: 'No liked tracks found' },
        { status: 404 }
      );
    }
    
    const trackIndex = user.likedTracks.findIndex(
      (track: { trackId: string }) => track.trackId === trackId
    );
    
    if (trackIndex === -1) {
      return NextResponse.json(
        { message: 'Track not found in liked tracks' },
        { status: 404 }
      );
    }
    
    // Remove the track from liked tracks
    user.likedTracks.splice(trackIndex, 1);
    await user.save();
    
    return NextResponse.json(
      { message: 'Track unliked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unlike track error:', error);
    return NextResponse.json(
      { message: 'Failed to unlike track' },
      { status: 500 }
    );
  }
}

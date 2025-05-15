// hackathon_may_stackup\moodify\src\app\api\playlists\delete\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User, { CreatedPlaylist } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(request: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };
    
    if (!decoded.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // getting playlist ID from URL
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('id');
    
    if (!playlistId) {
      return NextResponse.json({ message: 'Playlist ID is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const playlistIndex = user.createdPlaylists.findIndex(
      (playlist: CreatedPlaylist & { _id: any }) => playlist._id.toString() === playlistId
    );
    
    if (playlistIndex === -1) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
    }
    
    user.createdPlaylists.splice(playlistIndex, 1);
    await user.save();
    
    return NextResponse.json({
      message: 'Playlist deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete playlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}

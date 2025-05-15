// hackathon_may_stackup\moodify\src\app\api\playlists\add-track\route.ts



import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User, { PlaylistTrack } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // verifying authentication
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
    
    // getting request body
    const body = await request.json();
    const { playlistId, track } = body;
    
    if (!playlistId || !track) {
      return NextResponse.json({ message: 'Playlist ID and track data are required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // finding the playlist
    const playlistIndex = user.createdPlaylists.findIndex(
      (playlist: { _id: { toString: () => any; }; }) => playlist._id.toString() === playlistId
    );
    
    if (playlistIndex === -1) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
    }
    
    const trackExists = user.createdPlaylists[playlistIndex].tracks.some(
      (t: { trackId: any; }) => t.trackId === track.trackId
    );
    
    if (trackExists) {
      return NextResponse.json({ 
        message: 'Track already exists in this playlist',
        playlist: user.createdPlaylists[playlistIndex]
      }, { status: 200 });
    }
    
    const newTrack: PlaylistTrack = {
      trackId: track.trackId,
      title: track.title,
      artist: track.artist,
      cloudinaryUrl: track.cloudinaryUrl,
      coverImage: track.coverImage,
      duration: track.duration,
      addedAt: new Date()
    };
    
    // adding track to playlist
    user.createdPlaylists[playlistIndex].tracks.push(newTrack);
    user.createdPlaylists[playlistIndex].updatedAt = new Date();
    
    await user.save();
    
    return NextResponse.json({
      message: 'Track added to playlist successfully',
      playlist: user.createdPlaylists[playlistIndex]
    });
    
  } catch (error: any) {
    console.error('Add track to playlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add track to playlist' },
      { status: 500 }
    );
  }
}

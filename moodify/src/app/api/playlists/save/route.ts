// hackathon_may_stackup\moodify\src\app\api\playlists\save\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface Playlist {
  playlistId: string;
  title: string;
  description?: string;
  coverImage?: string;
  trackCount?: number;
  creator?: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const {
      playlistId,
      title,
      description,
      coverImage,
      trackCount,
      creator,
    }: Playlist = await req.json();

    if (!playlistId || !title) {
      return NextResponse.json({ error: 'Playlist ID and title are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const playlistAlreadySaved = user.savedPlaylists.some(
      (playlist: Playlist) => playlist.playlistId === playlistId
    );

    if (playlistAlreadySaved) {
      return NextResponse.json(
        { error: 'Playlist already saved', alreadySaved: true },
        { status: 400 }
      );
    }

    user.savedPlaylists.push({
      playlistId,
      title,
      description,
      coverImage,
      trackCount,
      creator,
      savedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ success: true, message: 'Playlist saved successfully' });
  } catch (error) {
    console.error('Error saving playlist:', error);
    return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { playlistId }: { playlistId: string } = await req.json();

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const initialLength = user.savedPlaylists.length;
    user.savedPlaylists = user.savedPlaylists.filter(
      (playlist: Playlist) => playlist.playlistId !== playlistId
    );

    if (user.savedPlaylists.length === initialLength) {
      return NextResponse.json({ error: 'Playlist not found in saved playlists' }, { status: 404 });
    }

    await user.save();

    return NextResponse.json({ success: true, message: 'Playlist removed from saved playlists' });
  } catch (error) {
    console.error('Error removing saved playlist:', error);
    return NextResponse.json({ error: 'Failed to remove saved playlist' }, { status: 500 });
  }
}

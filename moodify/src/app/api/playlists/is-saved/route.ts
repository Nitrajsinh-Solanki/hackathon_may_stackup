// hackathon_may_stackup\moodify\src\app\api\playlists\is-saved\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ isSaved: false, authenticated: false }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const playlistId = req.nextUrl.searchParams.get('playlistId');

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ isSaved: false, authenticated: true }, { status: 200 });
    }

    const isSaved = user.savedPlaylists.some(
      (playlist: { playlistId: string }) => playlist.playlistId === playlistId
    );

    return NextResponse.json({ isSaved, authenticated: true });
  } catch (error) {
    console.error('Error checking if playlist is saved:', error);
    return NextResponse.json({ error: 'Failed to check if playlist is saved' }, { status: 500 });
  }
}

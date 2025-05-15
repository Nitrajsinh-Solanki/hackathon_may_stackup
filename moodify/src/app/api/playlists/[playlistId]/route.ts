// hackathon_may_stackup\moodify\src\app\api\playlists\[playlistId]\route.ts



import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest, context: any) {
    try {
      const { params } = await context;
      const playlistId = params.playlistId;
  
      if (!playlistId) {
        return NextResponse.json({ message: 'Playlist ID is required' }, { status: 400 });
      }
  
      const token = (await cookies()).get('auth_token')?.value;
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        email: string;
        username: string;
      };
  
      if (!decoded.userId) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
  
      await connectToDatabase();
  
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      const playlist = user.createdPlaylists.find(
        (playlist: { _id: { toString: () => string } }) => playlist._id.toString() === playlistId
      );
  
      if (!playlist) {
        return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
      }
  
      return NextResponse.json({
        message: 'Playlist fetched successfully',
        playlist
      });
    } catch (error: any) {
      console.error('Fetch playlist error:', error);
      return NextResponse.json(
        { message: error.message || 'Failed to fetch playlist' },
        { status: 500 }
      );
    }
  }
  
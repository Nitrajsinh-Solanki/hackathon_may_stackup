// hackathon_may_stackup\moodify\src\app\api\albums\unsave\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User, { SavedAlbum } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // getting the token from cookies
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const { albumId } = await request.json();
    
    if (!albumId) {
      return NextResponse.json(
        { message: 'Album ID is required' },
        { status: 400 }
      );
    }
    
    if (!user.savedAlbums) {
      return NextResponse.json(
        { message: 'No saved albums found' },
        { status: 404 }
      );
    }
    
    const initialLength = user.savedAlbums.length;
    user.savedAlbums = user.savedAlbums.filter((album: SavedAlbum) => album.albumId !== albumId);
    
    if (user.savedAlbums.length === initialLength) {
      return NextResponse.json(
        { message: 'Album not found in saved albums' },
        { status: 404 }
      );
    }
    
    await user.save();
    
    return NextResponse.json(
      { message: 'Album removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unsave album error:', error);
    return NextResponse.json(
      { message: 'An error occurred while removing the album' },
      { status: 500 }
    );
  }
}

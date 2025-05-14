// hackathon_may_stackup\moodify\src\app\api\albums\save\route.ts

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
    
    // connecting to database
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // getting album data from request
    const albumData = await request.json();
    
    if (!user.savedAlbums) {
      user.savedAlbums = [];
    }
    
    const albumExists = user.savedAlbums.some(
      (album: SavedAlbum) => album.albumId === albumData.albumId
    );
    
    if (albumExists) {
      return NextResponse.json(
        { message: 'Album already saved' },
        { status: 409 }
      );
    }
    
    // adding album to user's saved albums
    const newAlbum = {
      albumId: albumData.albumId,
      title: albumData.title,
      artist: albumData.artist,
      coverImage: albumData.coverImage || '',
      year: albumData.year,
      genre: albumData.genre,
      trackCount: albumData.trackCount,
      savedAt: new Date(),
    };
    
    user.savedAlbums.push(newAlbum);

    
    await user.save();
    
    return NextResponse.json(
      { message: 'Album saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save album error:', error);
    return NextResponse.json(
      { message: 'An error occurred while saving the album' },
      { status: 500 }
    );
  }
}

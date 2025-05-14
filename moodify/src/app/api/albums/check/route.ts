// hackathon_may_stackup\moodify\src\app\api\albums\check\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User, { SavedAlbum } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // getting albumId from query params
    const url = new URL(request.url);
    const albumId = url.searchParams.get('albumId');
    
    if (!albumId) {
      return NextResponse.json(
        { message: 'Album ID is required' },
        { status: 400 }
      );
    }

    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated', isSaved: false },
        { status: 200 }
      );
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        username: string;
      };
      
      await connectToDatabase();
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { message: 'User not found', isSaved: false },
          { status: 200 }
        );
      }
      
      const isSaved = user.savedAlbums?.some((album: SavedAlbum) => album.albumId === albumId) || false;
      
      return NextResponse.json({ isSaved }, { status: 200 });
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Invalid authentication token', isSaved: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Check saved album error:', error);
    return NextResponse.json(
      { message: 'An error occurred', isSaved: false },
      { status: 200 }
    );
  }
}

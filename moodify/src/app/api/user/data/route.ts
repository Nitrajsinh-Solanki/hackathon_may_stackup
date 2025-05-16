// hackathon_may_stackup\moodify\src\app\api\user\data\route.ts



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
    
    return NextResponse.json({
      likedTracks: user.likedTracks || [],
      savedPlaylists: user.savedPlaylists || [],
      savedAlbums: user.savedAlbums || [],
      searchHistory: user.searchHistory || []
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

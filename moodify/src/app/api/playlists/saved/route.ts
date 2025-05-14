// hackathon_may_stackup\moodify\src\app\api\playlists\saved\route.ts


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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      savedPlaylists: user.savedPlaylists.sort((a: any, b: any) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ) 
    });
  } catch (error) {
    console.error('Error fetching saved playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch saved playlists' }, { status: 500 });
  }
}

// hackathon_may_stackup\moodify\src\app\api\playlists\create\route.ts



import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '@/lib/db';
import User, { PlaylistTrack } from '@/models/User';

// configuring cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
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
    
    // getting form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File;
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Playlist name is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const newPlaylist: {
      name: string;
      description?: string;
      coverImage?: string;
      tracks: PlaylistTrack[];
      createdAt: Date;
      updatedAt: Date;
    } = {
      name: name.trim(),
      description: description ? description.trim() : undefined,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (coverImage) {
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const base64Image = buffer.toString('base64');
      const dataURI = `data:${coverImage.type};base64,${base64Image}`;
      
      // uploading to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: 'moodify-playlists',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
      
      newPlaylist.coverImage = (uploadResult as any).secure_url;
    }
    
    user.createdPlaylists.push(newPlaylist);
    await user.save();
    
    return NextResponse.json({
      message: 'Playlist created successfully',
      playlist: user.createdPlaylists[user.createdPlaylists.length - 1],
    });
  } catch (error: any) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create playlist' },
      { status: 500 }
    );
  }
}

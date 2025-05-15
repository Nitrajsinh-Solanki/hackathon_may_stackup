// hackathon_may_stackup\moodify\src\app\api\playlists\update\route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '@/lib/db';
import User, { CreatedPlaylist } from '@/models/User';

// configuring cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: NextRequest) {
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
    
    // getting playlist ID from URL
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('id');
    
    if (!playlistId) {
      return NextResponse.json({ message: 'Playlist ID is required' }, { status: 400 });
    }
    
    // getting form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File | null;
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Playlist name is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // finding playlist index
    const playlistIndex = user.createdPlaylists.findIndex(
      (playlist: CreatedPlaylist & { _id: any }) => playlist._id.toString() === playlistId
    );
    
    if (playlistIndex === -1) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
    }
    
    // updating playlist data
    user.createdPlaylists[playlistIndex].name = name.trim();
    user.createdPlaylists[playlistIndex].description = description ? description.trim() : undefined;
    user.createdPlaylists[playlistIndex].updatedAt = new Date();
    
    // uploading new cover image if provided
    if (coverImage) {
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const base64Image = buffer.toString('base64');
      const dataURI = `data:${coverImage.type};base64,${base64Image}`;
      
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
      
      user.createdPlaylists[playlistIndex].coverImage = (uploadResult as any).secure_url;
    }
    
    await user.save();
    
    return NextResponse.json({
      message: 'Playlist updated successfully',
      playlist: user.createdPlaylists[playlistIndex],
    });
  } catch (error: any) {
    console.error('Update playlist error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

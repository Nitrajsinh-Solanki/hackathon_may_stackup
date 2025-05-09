// moodify\src\app\api\upload\route.ts


import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import * as mm from 'music-metadata';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// configure cloudinary for data storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // verify authentication
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const genre = formData.get('genre') as string;
    const mood = formData.get('mood') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 });
    }

    const tempDir = join(process.cwd(), 'temp');
    await mkdir(tempDir, { recursive: true });

    // save file to temp directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(tempDir, file.name);
    await writeFile(filePath, buffer);

    const metadata = await mm.parseFile(filePath);
    const duration = metadata.format.duration || 0;
    
    // upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        {
          resource_type: 'video',
          folder: 'moodify-audio',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // clean up temp file
    await fs.unlink(filePath);

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.uploadedTracks.push({
      title: title || metadata.common.title || file.name,
      artist: artist || metadata.common.artist || user.username,
      cloudinaryUrl: (uploadResult as any).secure_url,
      coverImage: metadata.common.picture?.[0] ? 
        `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}` : 
        undefined,
      duration,
      genre: genre || metadata.common.genre?.[0],
      mood,
      uploadedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      track: user.uploadedTracks[user.uploadedTracks.length - 1],
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

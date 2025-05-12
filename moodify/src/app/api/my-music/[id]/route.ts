// hackathon_may_stackup\moodify\src\app\api\my-music\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// configuring cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use params directly without await
    const trackId = await params.id;

    // Verify authentication
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the track in the user's uploaded tracks
    const trackIndex = user.uploadedTracks.findIndex(
      (track: any) => track._id.toString() === trackId
    );

    if (trackIndex === -1) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Get the track to delete
    const trackToDelete = user.uploadedTracks[trackIndex];
    
    const cloudinaryUrl = trackToDelete.cloudinaryUrl;
    const publicIdMatch = cloudinaryUrl.match(/\/v\d+\/(.+?)(\.\w+)?$/);
    
    if (publicIdMatch && publicIdMatch[1]) {
      const publicId = publicIdMatch[1];
      
      // Delete from Cloudinary
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          publicId,
          { resource_type: 'video' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    }

    // Remove the track from the user's uploaded tracks
    user.uploadedTracks.splice(trackIndex, 1);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    );
  }
}

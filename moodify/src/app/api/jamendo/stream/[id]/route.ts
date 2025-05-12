// hackathon_may_stackup\moodify\src\app\api\jamendo\stream\[id]\route.ts

import { NextResponse } from 'next/server';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID || '08b9b0f8';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Track ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // explicitly request the audio format
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${id}&audioformat=mp32`;
    console.log('Server-side Jamendo API call for stream:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Jamendo API returned ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }
    
    const track = data.results[0];
    
    // check if audio URL exists
    if (!track.audio) {
      console.error('No audio URL provided by Jamendo API for track:', id);
      return NextResponse.json(
        { error: 'No audio URL available for this track' },
        { status: 404 }
      );
    }
    
    // ensuring the audio URL includes the audioformat parameter
    let audioUrl = track.audio;
    if (!audioUrl.includes('audioformat=')) {
      const separator = audioUrl.includes('?') ? '&' : '?';
      audioUrl = `${audioUrl}${separator}audioformat=mp32`;
    }
    
    return NextResponse.json({ streamUrl: audioUrl });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get stream URL',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

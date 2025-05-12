// hackathon_may_stackup\moodify\src\app\api\jamendo\search\route.ts

import { NextResponse } from 'next/server';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID || '08b9b0f8';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // explicitly request the audio format
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&audioformat=mp32`;
    console.log('Server-side Jamendo API call:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Jamendo API returned ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Process the results to ensure valid audio URLs
    const tracks = (data.results || []).map((track: any) => {
      if (track.audio && !track.audio.includes('audioformat=')) {
        const separator = track.audio.includes('?') ? '&' : '?';
        track.audio = `${track.audio}${separator}audioformat=mp32`;
      }
      return track;
    });
    
    return NextResponse.json({ data: tracks });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search Jamendo tracks',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

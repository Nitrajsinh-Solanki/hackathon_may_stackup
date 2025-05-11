// hackathon_may_stackup\moodify\src\app\api\audiodb\search-albums\route.ts


import { NextResponse } from 'next/server';
import { AUDIODB_API } from '@/lib/audiodb-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistName = searchParams.get('s');
  
  if (!artistName) {
    return NextResponse.json(
      { error: 'Artist name parameter is required', album: [] },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `${AUDIODB_API}/searchalbum.php?s=${encodeURIComponent(artistName)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } 
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search albums (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    // ensuring we always return a valid structure
    if (!data || !data.album) {
      return NextResponse.json({ album: [] });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { album: [] },
      { status: 200 } 
    );
  }
}

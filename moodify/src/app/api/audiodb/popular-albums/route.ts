// hackathon_may_stackup\moodify\src\app\api\audiodb\popular-albums\route.ts


import { NextResponse } from 'next/server';
import { AUDIODB_API } from '@/lib/audiodb-api';

// list of popular artists to fetch albums from
const POPULAR_ARTISTS = [
  'Eminem',
  'Taylor Swift',
  'Ed Sheeran',
  'Drake',
  'Adele',
  'Beyonce',
  'The Weeknd',
  'Billie Eilish'
];

export async function GET() {
  try {
    const randomArtist = POPULAR_ARTISTS[Math.floor(Math.random() * POPULAR_ARTISTS.length)];
    
    const response = await fetch(
      `${AUDIODB_API}/searchalbum.php?s=${encodeURIComponent(randomArtist)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } 
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular albums (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data || !data.album) {
      return NextResponse.json({ albums: [] });
    }
    
    // return  the albums with a different key to distinguish from the API response
    return NextResponse.json({ albums: data.album });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { albums: [] },
      { status: 200 }
    );
  }
}



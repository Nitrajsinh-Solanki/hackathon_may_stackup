// hackathon_may_stackup\moodify\src\app\api\deezer\featured-playlists\route.ts



import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.deezer.com/chart/0/playlists?limit=25', {
      headers: {
        'Accept': 'application/json'
      },

      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured playlists (Status: ${response.status})`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured playlists', data: [] },
      { status: 500 }
    );
  }
}

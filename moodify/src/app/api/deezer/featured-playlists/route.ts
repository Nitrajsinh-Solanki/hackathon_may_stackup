// hackathon_may_stackup\moodify\src\app\api\deezer\featured-playlists\route.ts




import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '50';
  const index = searchParams.get('index') || '0';
  
  try {
    const response = await fetch(`https://api.deezer.com/chart/0/playlists?limit=${limit}&index=${index}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured playlists (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    // Ensure we have the correct data structure
    if (!data || !data.data) {
      console.error('Invalid data structure from Deezer API:', data);
      return NextResponse.json({ data: [], total: 0 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured playlists', data: [] },
      { status: 500 }
    );
  }
}

// hackathon_may_stackup\moodify\src\app\api\audiodb\tracks\route.ts





import { NextResponse } from 'next/server';
import { AUDIODB_API } from '@/lib/audiodb-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('m');
  
  if (!albumId) {
    return NextResponse.json(
      { error: 'Album ID parameter is required', track: [] },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `${AUDIODB_API}/track.php?m=${albumId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } 
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data || !data.track) {
      return NextResponse.json({ track: [] });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { track: [] },
      { status: 200 } 
    );
  }
}

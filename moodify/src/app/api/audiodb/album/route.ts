
// hackathon_may_stackup\moodify\src\app\api\audiodb\album\route.ts




import { NextResponse } from 'next/server';
import { AUDIODB_API } from '@/lib/audiodb-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('m');
  
  if (!albumId) {
    return NextResponse.json(
      { error: 'Album ID parameter is required', album: [] },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `${AUDIODB_API}/album.php?m=${albumId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch album (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
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

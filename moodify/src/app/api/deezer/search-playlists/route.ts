// hackathon_may_stackup\moodify\src\app\api\deezer\search-playlists\route.ts


import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '25';
  const index = searchParams.get('index') || '0';
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required', data: [], total: 0 },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(
      `https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=${limit}&index=${index}`,
      {
        headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 60 } 
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to search playlists (Status: ${response.status})`);
      }
      
      const data = await response.json();
      
      if (!data || !data.data) {
        return NextResponse.json({ data: [], total: 0 });
      }
      
      return NextResponse.json(data);
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { data: [], total: 0 },
        { status: 200 } 
      );
    }
  }
  

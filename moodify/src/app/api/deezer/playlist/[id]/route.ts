// hackathon_may_stackup\moodify\src\app\api\deezer\playlist\[id]\route.ts


import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } =  params;

  if (!id) {
    return NextResponse.json(
      { error: 'Playlist ID is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.deezer.com/playlist/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist (Status: ${response.status})`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist details' },
      { status: 500 }
    );
  }
}

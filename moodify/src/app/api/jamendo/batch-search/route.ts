// hackathon_may_stackup\moodify\src\app\api\jamendo\batch-search\route.ts



import { NextResponse } from "next/server";

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";
const CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID;

export async function POST(request: Request) {
  try {
    const { recommendations } = await request.json();
    
    if (!recommendations || !Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: "Invalid recommendations data" },
        { status: 400 }
      );
    }

    // processing each recommendation in parallel
    const results = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const searchQuery = `${rec.title} ${rec.artist}`;
          
          console.log(`Searching Jamendo for: ${searchQuery}`);
          
          const response = await fetch(
            `${JAMENDO_API_BASE}/tracks/?client_id=${CLIENT_ID}&format=json&limit=1&namesearch=${encodeURIComponent(searchQuery)}&audioformat=mp32`
          );

          if (!response.ok) {
            console.error(`Jamendo API error for "${searchQuery}": ${response.status}`);
            return { ...rec, found: false };
          }

          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const track = data.results[0];
            return {
              title: rec.title,
              artist: rec.artist,
              jamendoId: track.id,
              imageUrl: track.album_image || track.image,
              audioUrl: track.audio || null,
              found: true
            };
          }
          
          return { ...rec, found: false };
        } catch (error) {
          console.error(`Error searching Jamendo for ${rec.title}:`, error);
          return { ...rec, found: false };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in Jamendo batch search API:", error);
    return NextResponse.json(
      { error: "Failed to process batch search" },
      { status: 500 }
    );
  }
}

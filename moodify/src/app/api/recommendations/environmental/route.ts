// hackathon_may_stackup\moodify\src\app\api\recommendations\environmental\route.ts

import { NextResponse } from "next/server";
import { getMusicRecommendations } from "@/lib/gemini-api";

export async function POST(request: Request) {
  try {
    const { location, temperature, weatherCondition, timeOfDay } = await request.json();
    
    if (!location || temperature === undefined || !weatherCondition || !timeOfDay) {
      return NextResponse.json(
        { error: "Missing required environmental data" },
        { status: 400 }
      );
    }
    
    const recommendations = await getMusicRecommendations(
      location,
      temperature,
      weatherCondition,
      timeOfDay
    );
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get music recommendations" },
      { status: 500 }
    );
  }
}

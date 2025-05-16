// hackathon_may_stackup\moodify\src\app\api\geolocation\route.ts


import { NextResponse } from "next/server";

export async function GET() {
  try {
    // using a free IP geolocation API as fallback for getting users location
    const response = await fetch("https://ipapi.co/json/");
    
    if (!response.ok) {
      throw new Error("Failed to fetch IP geolocation data");
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name
    });
  } catch (error) {
    console.error("Error in geolocation API:", error);
    return NextResponse.json(
      { error: "Failed to get geolocation data" },
      { status: 500 }
    );
  }
}


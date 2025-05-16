// hackathon_may_stackup\moodify\src\lib\gemini-api.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// initializing  the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getMusicRecommendations(
  location: string,
  temperature: number,
  weatherCondition: string,
  timeOfDay: string
) {
  try {
    // getting the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // creating an  prompt for music recommendations based on environmental data
    const prompt = `
      You are a professional music curator with expertise in matching songs to moods and environments.
      
      Current environmental context:
      - Location: ${location}
      - Temperature: ${temperature}°C
      - Weather: ${weatherCondition}
      - Time of day: ${timeOfDay}
      
      Based on these factors, recommend all songs that would perfectly complement this environment and enhance the listener's mood.
      
      Consider these factors in your recommendations:
      - For cold weather (below 15°C): Consider cozy, warm-feeling songs or reflective music
      - For warm weather (15-25°C): Suggest upbeat but not overwhelming tracks
      - For hot weather (above 25°C): Recommend refreshing, breezy, or chill music
      - For rainy conditions: Suggest atmospheric, contemplative, or melancholic songs
      - For sunny conditions: Recommend bright, optimistic tracks
      - For morning: Energizing but gentle songs to start the day
      - For afternoon: Balanced, steady energy tracks
      - For evening: Relaxing, unwinding music
      - For night: Atmospheric, dreamy, or deep tracks
      
      Provide a diverse mix of well-known artists and songs that are likely to be available in music libraries.
      Include a mix of contemporary hits and timeless classics that fit the mood.
      
      Format your response as a JSON array of song objects, each with 'title' and 'artist' properties.
      Example: [{"title": "Song Name", "artist": "Artist Name"}, ...]
      
      Return ONLY the JSON array with no additional text or explanation.
    `;

    // generating content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // extracting JSON from the response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to parse recommendations from Gemini API");
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;
  } catch (error) {
    console.error("Error getting music recommendations:", error);
    throw error;
  }
}

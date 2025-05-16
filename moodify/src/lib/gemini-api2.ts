// hackathon_may_stackup\moodify\src\lib\gemini-api2.ts


import { GoogleGenerativeAI } from "@google/generative-ai";
import { IUser } from "@/models/User";

// initializing the Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getPersonalizedMusicRecommendations(user: IUser) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const likedTracks = user.likedTracks?.map(
      (t) => `${t.title} by ${t.artist}${t.genre ? ` (Genre: ${t.genre})` : ""}${t.mood ? ` - Mood: ${t.mood}` : ""}`
    );
    
    const searchQueries = user.searchHistory?.map((s) => s.query);
    
    const savedAlbums = user.savedAlbums?.map(
      (a) => `${a.title} by ${a.artist}${a.genre ? ` (Genre: ${a.genre})` : ""}`
    );
    
    const savedPlaylists = user.savedPlaylists?.map((p) => p.title);
    
    const prompt = `You are an expert music recommendation engine. Your task is to analyze a user's musical preferences and listening behavior to suggest new tracks they are likely to enjoy.

Use the following user data:
- Recent liked tracks: ${likedTracks?.slice(0, 15).join(", ") || "None"}
- Recent search history: ${searchQueries?.slice(0, 10).join(", ") || "None"}
- Saved albums: ${savedAlbums?.slice(0, 10).join(", ") || "None"}
- Saved playlists: ${savedPlaylists?.slice(0, 10).join(", ") || "None"}

Analyze genres, moods, artists, and trends in this data. Recommend a diverse list of songs that align with the user's taste while also introducing a few new discoveries in similar styles or genres. Ensure a mix of:
- Familiar styles
- Emerging artists or hidden gems
- Timeless classics if they fit the user's pattern

Return a JSON array of song objects with the format:
[
  {
    "title": "Song Name",
    "artist": "Artist Name"
  },
  ...
]

Respond ONLY with the JSON array and no additional explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to parse personalized recommendations from Gemini API.");
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;
  } catch (error) {
    console.error("Error getting personalized music recommendations:", error);
    throw error;
  }
}

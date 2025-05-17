
// hackathon_may_stackup\moodify\src\lib\gemini-user-summary.ts



import { GoogleGenerativeAI } from "@google/generative-ai";
import { IUser } from "@/models/User";
import crypto from 'crypto';

// initializing the Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export function generateDataHash(user: IUser): string {
  // create a hash of the user's music data to detect changes
  const dataToHash = {
    likedTracks: user.likedTracks?.map(t => t.trackId),
    searchHistory: user.searchHistory?.map(s => s.query),
    savedPlaylists: user.savedPlaylists?.map(p => p.playlistId),
    savedAlbums: user.savedAlbums?.map(a => a.albumId),
  };
  
  return crypto.createHash('md5').update(JSON.stringify(dataToHash)).digest('hex');
}

export async function generateUserSummary(user: IUser): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // preparing user data for the prompt
    const likedTracks = user.likedTracks?.map(
      (t) => `${t.title} by ${t.artist}${t.genre ? ` (Genre: ${t.genre})` : ""}${t.mood ? ` - Mood: ${t.mood}` : ""}`
    );
    
    const searchQueries = user.searchHistory?.map((s) => s.query);
    
    const savedAlbums = user.savedAlbums?.map(
      (a) => `${a.title} by ${a.artist}${a.genre ? ` (Genre: ${a.genre})` : ""}`
    );
    
    const savedPlaylists = user.savedPlaylists?.map((p) => p.title);
    
    const prompt = `
      You are a witty, fun music personality analyst. Your task is to create a playful, engaging summary of a user's music personality based on their listening data.
      
      User's music data:
      - Liked tracks: ${likedTracks?.slice(0, 15).join(", ") || "None"}
      - Search history: ${searchQueries?.slice(0, 10).join(", ") || "None"}
      - Saved albums: ${savedAlbums?.slice(0, 10).join(", ") || "None"}
      - Saved playlists: ${savedPlaylists?.slice(0, 10).join(", ") || "None"}
      
      Create a fun, quirky summary of their music personality in under 150 words. Include:
      - A creative DJ nickname based on their taste
      - Observations about their music preferences and listening habits
      - Playful teasing about any patterns you notice (like mood swings, guilty pleasures, etc.)
      - Emoji to enhance the personality of the summary
      
      Make it personal, funny, and insightful - like a friend who knows their music taste well.
      The tone should be conversational and slightly teasing but always kind.
      
      Example style: "Meet DJ Daydreamer 🎧 — You cry to sad piano at 2AM but still blast 2010s pop bangers while brushing your teeth. Your playlists are 80% lo-fi, 10% nostalgia, and 10% 'I'm okay, I swear 😅'. You searched 'What is jazz fusion' at 3AM and saved an album called Melancholy Chill Volume 6. We see you, you beautiful emotional rollercoaster."
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating user summary:", error);
    return "We couldn't analyze your music personality at the moment. Please try again later!";
  }
}

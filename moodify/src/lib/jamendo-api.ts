// hackathon_may_stackup\moodify\src\lib\jamendo-api.ts



const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID ;

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  album_name: string;
  audio: string;
  audiodownload: string;
  image: string;
}

export const searchJamendoTracks = async (
  query: string,
  limit = 2
): Promise<JamendoTrack[]> => {
  try {
    if (!JAMENDO_CLIENT_ID) {
      console.error('Jamendo API client ID not configured');
      return [];
    }
    const url = `/api/jamendo/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('Fetching Jamendo tracks with URL:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Jamendo API returned ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format from Jamendo API:', data);
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error('Jamendo Track Search Failed:', error);
    return [];
  }
};

export const getJamendoStreamUrl = async (trackId: string): Promise<string | null> => {
  try {
    if (!JAMENDO_CLIENT_ID) {
      console.error('Jamendo API client ID not configured');
      return null;
    }
    
    // using a proxy route to avoid CORS issues
    const url = `/api/jamendo/stream/${trackId}`;
    console.log('Fetching Jamendo stream URL:', url);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Jamendo API returned ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.streamUrl) {
      console.error('No stream URL returned from API');
      return null;
    }
    
    return data.streamUrl;
  } catch (error) {
    console.error('Jamendo Stream URL Fetch Failed:', error);
    return null;
  }
};

// hackathon_may_stackup\moodify\src\lib\audiodb-api.ts



// TheAudioDB API utility functions
export const AUDIODB_API = 'https://www.theaudiodb.com/api/v1/json/2';

// Types for TheAudioDB API responses
export interface AudioDBAlbum {
  idAlbum: string;
  strAlbum: string;
  strArtist: string;
  intYearReleased: string;
  strGenre: string;
  strStyle: string;
  strReleaseFormat: string;
  strAlbumThumb: string;
  strDescriptionEN: string;
  intScore: string;
  strMood: string;
  intScoreVotes: string;
}

export interface AudioDBTrack {
  idTrack: string;
  strTrack: string;
  strAlbum: string;
  strArtist: string;
  intDuration: string;
  strGenre: string;
  strMusicVid: string;
  strTrackThumb: string;
  intTrackNumber: string;
}

export interface AudioDBSearchResult<T> {
  album?: T[];
  track?: T[];
}

export interface AudioDBDiscography {
  strAlbum: string;
  intYearReleased: string;
}

// Default and load more limits
export const DEFAULT_LIMIT = 100;
export const LOAD_MORE_LIMIT = 100;

// Helper function to handle API errors
const handleApiError = (error: any, message: string): never => {
  console.error(`${message}:`, error);
  throw new Error(message);
};

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number | string): string => {
  const secondsNum = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  const minutes = Math.floor(secondsNum / 60);
  const remainingSeconds = Math.floor(secondsNum % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Search for albums by artist name
export const searchAlbumsByArtist = async (
  artistName: string
): Promise<AudioDBAlbum[]> => {
  try {
    const res = await fetch(
      `/api/audiodb/search-albums?s=${encodeURIComponent(artistName)}`
    );
    
    if (!res.ok) {
      throw new Error(`Failed to search albums (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.album || [];
  } catch (error) {
    console.error('Failed to search albums:', error);
    return [];
  }
};

// Get album details by ID
export const fetchAlbumById = async (albumId: string): Promise<AudioDBAlbum | null> => {
  try {
    const res = await fetch(`/api/audiodb/album?m=${albumId}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch album (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.album?.[0] || null;
  } catch (error) {
    console.error('Failed to fetch album:', error);
    return null;
  }
};

// Get tracks for an album by ID
export const fetchTracksByAlbumId = async (albumId: string): Promise<AudioDBTrack[]> => {
  try {
    const res = await fetch(`/api/audiodb/tracks?m=${albumId}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch album tracks (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.track || [];
  } catch (error) {
    console.error('Failed to fetch album tracks:', error);
    return [];
  }
};

// Get artist discography (basic album info)
export const fetchDiscography = async (artistName: string): Promise<AudioDBDiscography[]> => {
  try {
    const res = await fetch(`/api/audiodb/discography?s=${encodeURIComponent(artistName)}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch discography (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.album || [];
  } catch (error) {
    console.error('Failed to fetch discography:', error);
    return [];
  }
};

// Get popular albums (using a predefined list of popular artists)
export const getPopularAlbums = async (): Promise<AudioDBAlbum[]> => {
  try {
    const res = await fetch('/api/audiodb/popular-albums');
    
    if (!res.ok) {
      throw new Error(`Failed to fetch popular albums (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.albums || [];
  } catch (error) {
    console.error('Failed to fetch popular albums:', error);
    return [];
  }
};

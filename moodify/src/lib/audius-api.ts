// moodify\src\lib\audius-api.ts

// Audius API utility functions
const AUDIUS_API_BASE_URL = 'https://discoveryprovider.audius.co/v1';

export interface Track {
  id: string;
  title: string;
  permalink: string;
  artwork: {
    '150x150': string;
    '480x480': string;
    '1000x1000': string;
  };
  description: string;
  genre: string;
  mood: string;
  release_date: string;
  duration: number;
  user: {
    id: string;
    name: string;
    handle: string;
    profile_picture?: {
      '150x150': string;
      '480x480': string;
      '1000x1000': string;
    };
  };
  play_count: number;
  favorite_count: number;
  repost_count: number;
}

export interface ApiResponse<T> {
  data: T;
}

export const genres = [
  'All Genres',
  'Electronic',
  'Rock',
  'Metal',
  'Alternative',
  'Hip-Hop/Rap',
  'Experimental',
  'Punk',
  'Folk',
  'Pop',
  'Ambient',
  'Soundtrack',
  'World',
  'Jazz',
  'Acoustic',
  'Funk',
  'R&B/Soul',
  'Classical',
  'House',
  'Techno',
  'Trap',
  'Trance',
  'Drum & Bass',
  'Disco',
  'Dubstep',
];

export const moods = [
  'All Moods',
  'Energizing',
  'Relaxing',
  'Melancholy',
  'Romantic',
  'Peaceful',
  'Upbeat',
  'Intense',
  'Dreamy',
  'Ethereal',
  'Soothing',
  'Motivational',
  'Nostalgic',
  'Hopeful',
  'Empowering',
];

// Default and load more limits
export const DEFAULT_LIMIT = 50;
export const LOAD_MORE_LIMIT = 30;

export const getTrendingTracks = async (
  genre?: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
): Promise<Track[]> => {
  try {
    let url = `${AUDIUS_API_BASE_URL}/tracks/trending?limit=${limit}&offset=${offset}`;
    if (genre && genre !== 'All Genres') {
      url += `&genre=${encodeURIComponent(genre)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch trending tracks');
    }
    
    const data: ApiResponse<Track[]> = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return [];
  }
};

export const searchTracks = async (
  query: string,
  genre?: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
): Promise<Track[]> => {
  try {
    let url = `${AUDIUS_API_BASE_URL}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }
    
    const data: ApiResponse<Track[]> = await response.json();
    
    // Filter by genre if specified
    if (genre && genre !== 'All Genres') {
      return (data.data || []).filter(track => 
        track.genre && track.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getStreamUrl = (trackId: string): string => {
  return `${AUDIUS_API_BASE_URL}/tracks/stream/${trackId}`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// hackathon_may_stackup\moodify\src\lib\deezer-api.ts

// deezer API utility functions
export const DEEZER_API = 'https://api.deezer.com';

export interface DeezerArtist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  tracklist: string;
  type: string;
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  tracklist: string;
  type: string;
  artist?: DeezerArtist;
  release_date?: string;
  genre_id?: number;
  genres?: {
    data: Array<{ id: number; name: string; picture: string }>;
  };
  nb_tracks?: number;
  duration?: number;
  fans?: number;
  rating?: number;
  record_type?: string;
  available?: boolean;
  explicit_lyrics?: boolean;
  explicit_content_lyrics?: number;
  explicit_content_cover?: number;
  contributors?: DeezerArtist[];
  tracks?: {
    data: DeezerTrack[];
  };
}

export interface DeezerTrack {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  title_version: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  artist: DeezerArtist;
  album: DeezerAlbum;
  type: string;
}

export interface DeezerPlaylist {
  id: number;
  title: string;
  description: string;
  duration: number;
  public: boolean;
  is_loved_track: boolean;
  collaborative: boolean;
  nb_tracks: number;
  fans: number;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  checksum: string;
  tracklist: string;
  creation_date: string;
  md5_image: string;
  picture_type: string;
  creator: {
    id: number;
    name: string;
    tracklist: string;
    type: string;
  };
  type: string;
  tracks?: {
    data: DeezerTrack[];
  };
}

export interface DeezerSearchResult<T> {
  data: T[];
  total: number;
  next?: string;
}

export const DEFAULT_LIMIT = 25;
export const LOAD_MORE_LIMIT = 25;

const handleApiError = (error: any, message: string): never => {
  console.error(`${message}:`, error);
  throw new Error(message);
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// fetching a playlist by ID
export const fetchPlaylist = async (id: string): Promise<DeezerPlaylist> => {
  try {
    const res = await fetch(`${DEEZER_API}/playlist/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch playlist (Status: ${res.status})`);
    return await res.json();
  } catch (error) {
    return handleApiError(error, 'Failed to fetch playlist');
  }
};

// fetching playlist tracks
export const fetchPlaylistTracks = async (id: string): Promise<DeezerTrack[]> => {
  try {
    const playlist = await fetchPlaylist(id);
    return playlist.tracks?.data || [];
  } catch (error) {
    return handleApiError(error, 'Failed to fetch playlist tracks');
  }
};

// searching for playlists
export const searchPlaylists = async (
  query: string,
  limit: number = DEFAULT_LIMIT,
  index: number = 0): Promise<DeezerSearchResult<DeezerPlaylist>> => {
  try {
    const res = await fetch(
      `/api/deezer/search-playlists?q=${encodeURIComponent(query)}&limit=${limit}&index=${index}`
    );
    
    if (!res.ok) throw new Error(`Failed to search playlists (Status: ${res.status})`);
    
    const data = await res.json();
    if (!data || !data.data) {
      return { data: [], total: 0 };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to search playlists:', error);
    return { data: [], total: 0 };
  }
};

export const getFeaturedPlaylists = async (
  limit: number = DEFAULT_LIMIT): Promise<DeezerPlaylist[]> => {
  try {
    const res = await fetch(`/api/deezer/featured-playlists?limit=${limit}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch featured playlists (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch featured playlists:', error);
    return []; 
  }
};

export const searchAlbums = async (
  query: string,
  limit: number = DEFAULT_LIMIT,
  index: number = 0): Promise<DeezerSearchResult<DeezerAlbum>> => {
  try {
    const res = await fetch(
      `/api/deezer/search-albums?q=${encodeURIComponent(query)}&limit=${limit}&index=${index}`
    );
    
    if (!res.ok) {
      throw new Error(`Failed to search albums (Status: ${res.status})`);
    }
    
    const data = await res.json();
    
    if (!data || !data.data) {
      return { data: [], total: 0 };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to search albums:', error);
    return { data: [], total: 0 };
  }
};

export const fetchAlbum = async (id: string): Promise<DeezerAlbum> => {
  try {
    const res = await fetch(`${DEEZER_API}/album/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch album (Status: ${res.status})`);
    return await res.json();
  } catch (error) {
    return handleApiError(error, 'Failed to fetch album');
  }
};

// getting album tracks
export const fetchAlbumTracks = async (id: string): Promise<DeezerTrack[]> => {
  try {
    const album = await fetchAlbum(id);
    return album.tracks?.data || [];
  } catch (error) {
    return handleApiError(error, 'Failed to fetch album tracks');
  }
};

// getting popular albums
export const getPopularAlbums = async (
  limit: number = DEFAULT_LIMIT): Promise<DeezerAlbum[]> => {
  try {
    const res = await fetch(`/api/deezer/popular-albums?limit=${limit}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch popular albums (Status: ${res.status})`);
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch popular albums:', error);
    return []; 
  }
};

export const getTrackById = async (id: string): Promise<DeezerTrack> => {
  try {
    const res = await fetch(`${DEEZER_API}/track/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch track (Status: ${res.status})`);
    return await res.json();
  } catch (error) {
    return handleApiError(error, 'Failed to fetch track');
  }
};

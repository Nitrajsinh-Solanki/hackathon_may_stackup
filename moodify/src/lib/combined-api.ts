// hackathon_may_stackup\moodify\src\lib\combined-api.ts

import { DeezerTrack } from './deezer-api';
import { searchJamendoTracks, getJamendoStreamUrl } from './jamendo-api';


export const validateStreamUrl = async (streamUrl: string): Promise<boolean> => {
  if (!streamUrl) return false;
  
  try {
    if (streamUrl.includes('jamendo.com')) {
      console.log('Assuming Jamendo URL is valid:', streamUrl);
      return true;
    }
    
    const response = await fetch(streamUrl, {
      method: 'HEAD',
      mode: 'no-cors' 
    });
    
    console.log('Stream URL validation response:', response.status);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Error validating stream URL:', error);
    return true;
  }
};



export const findMatchingJamendoTrack = async (
  deezerTrackTitle: string,
  deezerArtistName: string
) => {
  const query = `${deezerTrackTitle} ${deezerArtistName}`;
  
  try {
    console.log(`Searching Jamendo for: "${query}"`);
    const jamendoTracks = await searchJamendoTracks(query, 5);
    
    if (!jamendoTracks || jamendoTracks.length === 0) {
      console.log('No Jamendo tracks found for:', query);
      return null;
    }
    
    const match = jamendoTracks.find((track) =>
      track.name.toLowerCase().includes(deezerTrackTitle.toLowerCase()) ||
      deezerTrackTitle.toLowerCase().includes(track.name.toLowerCase()) ||
      track.artist_name.toLowerCase().includes(deezerArtistName.toLowerCase())
    );
    
    if (match) {
      console.log('Found Jamendo match:', match.name, 'by', match.artist_name);
      
      // verify the audio URL is valid
      if (!match.audio) {
        console.log('Jamendo match has no audio URL:', match.name);
        return null;
      }
    } else {
      console.log('No matching Jamendo track found');
      if (jamendoTracks.length > 0 && jamendoTracks[0].audio) {
        return jamendoTracks[0];
      }
    }
    
    return match || null;
  } catch (error: any) {
    console.error('Error searching Jamendo tracks:', error);
    return null;
  }
};


export const getPlayableTrackSource = async (deezerTrack: DeezerTrack) => {
  try {
    console.log(`Finding playable source for: "${deezerTrack.title}" by ${deezerTrack.artist.name}`);
    
    // first try Jamendo
    const jamendoMatch = await findMatchingJamendoTrack(deezerTrack.title, deezerTrack.artist.name);
    
    if (jamendoMatch && jamendoMatch.audio) {
      console.log('Found Jamendo match:', jamendoMatch);
      
      let streamUrl = jamendoMatch.audio;
      if (!streamUrl.includes('audioformat=')) {
        const separator = streamUrl.includes('?') ? '&' : '?';
        streamUrl = `${streamUrl}${separator}audioformat=mp32`;
      }
      
      console.log('Using Jamendo stream URL:', streamUrl);
      
      // trying to validate the stream URL
      const isValid = await validateStreamUrl(streamUrl);
      if (!isValid) {
        console.warn('Jamendo stream URL validation failed, but will try to use it anyway');
      }
      
      return {
        id: deezerTrack.id,
        title: deezerTrack.title,
        artist: deezerTrack.artist.name,
        image: deezerTrack.album.cover_medium,
        streamUrl: streamUrl,
        source: 'jamendo',
        jamendoId: jamendoMatch.id,
        duration: deezerTrack.duration,
      };
    }
    
    // fallback to Deezer preview if available
    if (deezerTrack.preview) {
      console.log('Using Deezer preview URL:', deezerTrack.preview);
      return {
        id: deezerTrack.id,
        title: deezerTrack.title,
        artist: deezerTrack.artist.name,
        image: deezerTrack.album.cover_medium,
        streamUrl: deezerTrack.preview,
        source: 'deezer',
        duration: deezerTrack.duration,
      };
    }
    
    console.log('No playable source found for track');
    return null;
  } catch (error: any) {
    console.error('Error getting playable track:', error);
    
    if (deezerTrack.preview) {
      return {
        id: deezerTrack.id,
        title: deezerTrack.title,
        artist: deezerTrack.artist.name,
        image: deezerTrack.album.cover_medium,
        streamUrl: deezerTrack.preview,
        source: 'deezer',
        duration: deezerTrack.duration,
      };
    }
    
    return null;
  }
};


export const getPlayableTracks = async (deezerTracks: DeezerTrack[]) => {
  console.log(`Processing ${deezerTracks.length} tracks for display`);
  
  const displayTracks = deezerTracks.map(track => {
    return {
      ...track,
      isPotentiallyPlayable: !!track.preview,
      source: track.preview ? 'deezer' : null
    };
  });

  
  
  return displayTracks;
};

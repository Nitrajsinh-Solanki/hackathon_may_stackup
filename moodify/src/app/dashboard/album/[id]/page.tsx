// hackathon_may_stackup\moodify\src\app\dashboard\album\[id]\page.tsx




'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Play, Pause, Clock, Music, Calendar, User, Disc } from 'lucide-react';
import { fetchAlbumById, fetchTracksByAlbumId, AudioDBAlbum, AudioDBTrack, formatDuration } from '@/lib/audiodb-api';

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params.id as string;
  
  const [album, setAlbum] = useState<AudioDBAlbum | null>(null);
  const [tracks, setTracks] = useState<AudioDBTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<AudioDBTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAlbumAndTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // fetch album details
        const albumData = await fetchAlbumById(albumId);
        if (!albumData) {
          throw new Error('Album not found');
        }
        setAlbum(albumData);
        
        // fetch tracks for the album
        const tracksData = await fetchTracksByAlbumId(albumId);
        setTracks(tracksData);
      } catch (err) {
        console.error('Error loading album:', err);
        setError('Failed to load album details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAlbumAndTracks();
    
    // cleanup function
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [albumId]);

  const playTrack = (track: AudioDBTrack) => {
    if (audio) {
      audio.pause();
    }
    

    setCurrentTrack(track);
    setIsPlaying(true);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 30000);
  };

  const togglePlayPause = (track: AudioDBTrack) => {
    if (currentTrack?.idTrack === track.idTrack) {
      setIsPlaying(!isPlaying);
    } else {
      playTrack(track);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded-lg">
        {error || 'Failed to load album details'}
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              {album.strAlbumThumb ? (
                <Image
                  src={album.strAlbumThumb}
                  alt={album.strAlbum}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Disc size={64} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{album.strAlbum}</h1>
                
                <div className="flex items-center text-gray-400 mb-4">
                  {album.strArtist && (
                    <div className="flex items-center mr-4">
                      <User size={16} className="mr-1" />
                      <span>{album.strArtist}</span>
                    </div>
                  )}
                  
                  {album.intYearReleased && (
                    <div className="flex items-center mr-4">
                      <Calendar size={16} className="mr-1" />
                      <span>{album.intYearReleased}</span>
                    </div>
                  )}
                  
                  {tracks.length > 0 && (
                    <div className="flex items-center mr-4">
                      <Music size={16} className="mr-1" />
                      <span>{tracks.length} tracks</span>
                    </div>
                  )}
                </div>
                
                {album.strGenre && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className="bg-purple-900/40 text-purple-200 text-xs px-2 py-1 rounded-full"
                    >
                      {album.strGenre}
                    </span>
                    {album.strStyle && album.strStyle !== album.strGenre && (
                      <span 
                        className="bg-purple-900/40 text-purple-200 text-xs px-2 py-1 rounded-full"
                      >
                        {album.strStyle}
                      </span>
                    )}
                  </div>
                )}
                
                {album.strDescriptionEN && (
                  <div className="text-gray-400 text-sm mb-4 line-clamp-4">
                    {album.strDescriptionEN}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => tracks.length > 0 && playTrack(tracks[0])}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center w-full md:w-auto mt-4"
                disabled={tracks.length === 0}
              >
                <Play size={20} fill="white" className="mr-2" />
                Play Album
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
        
        {tracks.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {tracks.map((track, index) => (
              <div 
                key={track.idTrack}
                className={`py-3 px-2 flex items-center hover:bg-gray-800/50 rounded ${
                  currentTrack?.idTrack === track.idTrack ? 'bg-purple-900/20' : ''
                }`}
              >
                <div className="w-8 text-center text-gray-500 mr-4">
                  {currentTrack?.idTrack === track.idTrack ? (
                    <button onClick={() => togglePlayPause(track)}>
                      {isPlaying ? (
                        <Pause size={18} className="text-purple-400" />
                      ) : (
                        <Play size={18} fill="currentColor" className="text-purple-400" />
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => playTrack(track)}
                      className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                  )}
                </div>
                
                <div className="w-8 text-center text-gray-500 mr-4">
                  {track.intTrackNumber || index + 1}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    currentTrack?.idTrack === track.idTrack ? 'text-purple-400' : 'text-white'
                  }`}>
                    {track.strTrack}
                  </div>
                  {track.strArtist && (
                    <div className="text-sm text-gray-400">
                      {track.strArtist}
                    </div>
                  )}
                </div>
                
                <div className="text-gray-500 text-sm">
                  {track.intDuration ? formatDuration(parseInt(track.intDuration)) : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No tracks available for this album
          </div>
        )}
      </div>
    </div>
  );
}

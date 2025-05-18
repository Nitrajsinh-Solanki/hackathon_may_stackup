// moodify\src\app\dashboard\[trackId]\page.tsx


'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Track, getTrackById, getStreamUrl } from '@/lib/audius-api';
import { Loader2, ArrowLeft, Clock, Heart, Download, ListPlus, Play } from 'lucide-react';
import MusicPlayer from '@/app/components/MusicPlayer';
import { formatDuration } from '@/lib/audius-api';
import { useLikedTracks } from '@/app/context/LikedTracksContext';
import PlaylistSelector from '@/app/components/PlaylistSelector';
import React from 'react';

export default function TrackPage() {
  const params = useParams();
  const trackId = params.trackId as string;
  const router = useRouter();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  
  const { checkTrackLiked, toggleLike } = useLikedTracks();
  const isLiked = track ? checkTrackLiked(track.id) : false;

  useEffect(() => {
    const fetchTrack = async () => {
      setIsLoading(true);
      try {
        const trackData = await getTrackById(trackId);
        if (trackData) {
          setTrack(trackData);
          setShowPlayer(true);
        } else {
          setError('Track not found');
        }
      } catch (err) {
        console.error('Error fetching track:', err);
        setError('Failed to load track. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (trackId) {
      fetchTrack();
    }
    
    return () => {
      setIsPlaying(false);
      setShowPlayer(false);
    };
  }, [trackId]);

  const handleBack = () => {
    router.back();
  };

  const handlePlayTrack = () => {
    setIsPlaying(true);
  };

  const handleDownload = () => {
    if (!track) return;
    
    const streamUrl = getStreamUrl(track.id);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = streamUrl;
    
    const safeFileName = track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadLink.download = `${safeFileName}.mp3`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleLikeToggle = async () => {
    if (!track || isLikeLoading) return;
    
    setIsLikeLoading(true);
    
    try {
      await toggleLike({
        trackId: track.id,
        title: track.title,
        artist: track.user.name,
        artwork: track.artwork['480x480'] || track.artwork['150x150'] || '',
        duration: track.duration,
        genre: track.genre,
        mood: track.mood,
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleAddToPlaylist = () => {
    setShowPlaylistSelector(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }
  
  if (error || !track) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-300">{error || 'Track not found'}</p>
        <button
          onClick={handleBack}
          className="mt-2 text-sm text-white bg-red-800 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
 
  
    
  return (
    <div className="pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        <span className="text-sm sm:text-base">Back to Discovery</span>
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative group max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
  <img
    src={track.artwork['150x150'] || track.artwork['480x480'] || track.artwork['1000x1000'] || '/placeholder-album.png'}
    alt={track.title}
    className="w-full aspect-square object-cover"
    srcSet={`
      ${track.artwork['150x150'] || track.artwork['480x480']} 150w,
      ${track.artwork['480x480'] || track.artwork['1000x1000']} 480w,
      ${track.artwork['1000x1000'] || track.artwork['480x480']} 1000w
    `}
    sizes="(max-width: 640px) 150px, (max-width: 768px) 480px, 1000px"
  />
            
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePlayTrack}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full"
              >
                <Play size={24} fill="white" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
            <button
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base transition-colors ${
                isLiked
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <Heart size={16} className={isLiked ? 'fill-red-400' : ''} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              onClick={handleAddToPlaylist}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-full flex items-center text-sm sm:text-base"
            >
              <ListPlus size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add to Playlist</span>
              <span className="sm:hidden">Add</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-full flex items-center text-sm sm:text-base"
            >
              <Download size={16} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-2 mt-6 lg:mt-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center lg:text-left">{track.title}</h1>
          <p className="text-purple-400 text-base sm:text-lg mb-4 text-center lg:text-left">{track.user.name}</p>
          
          <div className="flex items-center justify-center lg:justify-start space-x-4 text-xs sm:text-sm text-gray-400 mb-6">
            <div className="flex items-center">
              <Heart size={14} className="mr-1" />
              <span>{track.favorite_count.toLocaleString()} likes</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{formatDuration(track.duration)}</span>
            </div>
          </div>
          
          {track.genre && (
            <div className="mb-4 text-center lg:text-left">
              <span className="text-gray-400 text-xs sm:text-sm">Genre: </span>
              <span className="bg-gray-800 text-white text-xs sm:text-sm px-3 py-1 rounded-full">{track.genre}</span>
            </div>
          )}
          
          {track.mood && (
            <div className="mb-4 text-center lg:text-left">
              <span className="text-gray-400 text-xs sm:text-sm">Mood: </span>
              <span className="bg-gray-800 text-white text-xs sm:text-sm px-3 py-1 rounded-full">{track.mood}</span>
            </div>
          )}
          
          {track.description && (
            <div className="mt-6">
              <h3 className="text-white text-base sm:text-lg font-medium mb-2 text-center lg:text-left">Description</h3>
              <p className="text-gray-400 text-sm sm:text-base whitespace-pre-line">{track.description}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${showPlayer ? 'block' : 'hidden'} md:block`}>
        {track && showPlayer && (
          <MusicPlayer
            track={track}
            onClose={() => setIsPlaying(false)}
            autoPlay={isPlaying}
          />
        )}
      </div>
      
      {track && (
        <PlaylistSelector
          isOpen={showPlaylistSelector}
          onClose={() => setShowPlaylistSelector(false)}
          track={track}
        />
      )}
    </div>
  );
  
  }
  


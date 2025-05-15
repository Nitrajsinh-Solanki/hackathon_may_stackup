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
    <div className="pb-20">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Discovery
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative group">
            <img
              src={track.artwork['1000x1000'] || track.artwork['480x480'] || '/placeholder-album.png'}
              alt={track.title}
              className="w-full aspect-square object-cover"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePlayTrack}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full"
              >
                <Play size={24} fill="white" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                isLiked
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <Heart size={18} className={isLiked ? 'fill-red-400' : ''} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              onClick={handleAddToPlaylist}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <ListPlus size={18} className="mr-2" />
              Add to Playlist
            </button>
            
            <button
              onClick={handleDownload}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <Download size={18} className="mr-2" />
              Download
            </button>
          </div>
        </div>
        
        {/* track Details */}
        <div className="md:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{track.title}</h1>
          <p className="text-purple-400 text-lg mb-4">{track.user.name}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center">
              <Heart size={16} className="mr-1" />
              <span>{track.favorite_count.toLocaleString()} likes</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{formatDuration(track.duration)}</span>
            </div>
          </div>
          
          {track.genre && (
            <div className="mb-4">
              <span className="text-gray-400 text-sm">Genre: </span>
              <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">{track.genre}</span>
            </div>
          )}
          
          {track.mood && (
            <div className="mb-4">
              <span className="text-gray-400 text-sm">Mood: </span>
              <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">{track.mood}</span>
            </div>
          )}
          
          {track.description && (
            <div className="mt-6">
              <h3 className="text-white text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-400 whitespace-pre-line">{track.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {track && showPlayer && (
        <MusicPlayer
          track={track}
          onClose={() => setIsPlaying(false)}
          autoPlay={isPlaying}
        />
      )}

      {/* playlist selector modal */}
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

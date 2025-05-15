// moodify\src\app\components\TrackCard.tsx


// this component is for home page music listing cards 


'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, ListPlus } from 'lucide-react';
import { Track } from '@/lib/audius-api';
import { formatDuration } from '@/lib/audius-api';
import { useLikedTracks } from '@/app/context/LikedTracksContext';
import PlaylistSelector from './PlaylistSelector';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  const { checkTrackLiked, toggleLike } = useLikedTracks();
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  
  const isLiked = checkTrackLiked(track.id);
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (isLikeLoading) return;
    
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

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPlaylistSelector(true);
  };

  return (
    <>
      <Link href={`/dashboard/${track.id}`}>
        <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer group relative">
          <div className="relative">
            <img
              src={track.artwork['480x480'] || track.artwork['150x150'] || '/placeholder-album.png'}
              alt={track.title}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay(track);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full"
              >
                <Play size={24} fill="white" />
              </button>
            </div>
            
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
              <button
                onClick={handleAddToPlaylist}
                className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
                aria-label="Add to playlist"
              >
                <ListPlus size={18} className="text-white" />
              </button>
              
              <button
                onClick={handleLikeToggle}
                className="bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
                aria-label={isLiked ? "Unlike track" : "Like track"}
                disabled={isLikeLoading}
              >
                <Heart 
                  size={18}
                  className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-white'} transition-colors`}
                />
              </button>
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="text-white font-medium truncate">{track.title}</h3>
            <p className="text-gray-400 text-sm truncate">{track.user.name}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{formatDuration(track.duration)}</span>
              <span>{track.play_count.toLocaleString()} plays</span>
            </div>
          </div>
        </div>
      </Link>

      {/* playlist selector modal */}
      <PlaylistSelector 
        isOpen={showPlaylistSelector}
        onClose={() => setShowPlaylistSelector(false)}
        track={track}
      />
    </>
  );
}

// hackathon_may_stackup\moodify\src\app\components\TrackList.tsx



'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, Music, Loader } from 'lucide-react';
import { DeezerTrack, formatDuration } from '@/lib/deezer-api';

interface TrackListProps {
  tracks: DeezerTrack[];
  playableTracks?: any[];
  onTrackPlay?: (trackId: number) => void;
  isLoading?: boolean;
  loadingTrackId?: number | null;
  currentlyPlayingId?: number | null;
}

export default function TrackList({
  tracks,
  playableTracks,
  onTrackPlay,
  isLoading = false,
  loadingTrackId = null,
  currentlyPlayingId = null
}: TrackListProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);

  const handlePlayTrack = (trackId: number) => {
    if (onTrackPlay) {
      onTrackPlay(trackId);
    }
  };

  const isPotentiallyPlayable = (trackId: number) => {
    const track = tracks.find(t => t.id === trackId);
    return !!track?.preview;
  };

  return (
    <div className="bg-gray-900/50 rounded-lg overflow-hidden shadow-xl border border-gray-800/50">
      <div className="grid grid-cols-11 px-4 py-3 border-b border-gray-800 text-gray-300 text-sm font-medium bg-gray-800/30">
        <div className="col-span-1">#</div>
        <div className="col-span-6">Title</div>
        <div className="col-span-4">Album</div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tracks...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Music size={40} className="mx-auto mb-4 opacity-50" />
          <p>No tracks found in this playlist</p>
        </div>
      ) : (
        tracks.map((track, index) => {
          const isPlayable = isPotentiallyPlayable(track.id);
          const isLoading = loadingTrackId === track.id;
          const isActive = currentlyPlayingId === track.id;
          const isHovered = hoveredTrack === track.id;

          return (
            <div
              key={track.id}
              className={`grid grid-cols-11 px-4 py-3 items-center transition-colors duration-200
                ${isActive ? 'bg-purple-900/20 border-l-4 border-purple-500' : 'border-l-4 border-transparent hover:bg-gray-800/50'}
                ${!isPlayable ? 'opacity-60' : ''}
              `}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
            >
              <div className="col-span-1">
                {isLoading ? (
                  <Loader size={18} className="animate-spin text-purple-500" />
                ) : isHovered || isActive ? (
                  <button
                    onClick={() => isPlayable && handlePlayTrack(track.id)}
                    className={`${isPlayable ? 'text-white hover:text-purple-500' : 'text-gray-600 cursor-not-allowed'}
                      transition-colors duration-200 p-1 rounded-full hover:bg-purple-500/20`}
                    disabled={!isPlayable}
                  >
                    {isActive ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                  </button>
                ) : (
                  <span className="text-gray-500 font-medium">{index + 1}</span>
                )}
              </div>

              <div className="col-span-6 flex items-center">
                <div className="w-10 h-10 relative mr-3 flex-shrink-0 rounded overflow-hidden shadow-md">
                  {track.album.cover_small ? (
                    <Image
                      src={track.album.cover_small}
                      alt={track.album.title}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded">
                      <Music size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white font-medium truncate hover:text-purple-400 transition-colors duration-200">
                    {track.title}
                    {!isPlayable && (
                      <span className="ml-2 px-2 py-0.5 bg-red-900/30 text-red-400 rounded-full text-xs">
                        Not Playable
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm truncate">{track.artist.name}</div>
                </div>
              </div>

              <div className="col-span-4 text-gray-400 truncate">{track.album.title}</div>
            </div>
          );
        })
      )}
    </div>
  );
}

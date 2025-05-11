// hackathon_may_stackup\moodify\src\app\components\PlaylistCard.tsx


'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Music, User } from 'lucide-react';
import { DeezerPlaylist, formatDuration } from '@/lib/deezer-api';

interface PlaylistCardProps {
  playlist: DeezerPlaylist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Link 
      href={`/dashboard/playlist/${playlist.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-square">
        {playlist.picture_medium ? (
          <Image
            src={playlist.picture_medium}
            alt={playlist.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <Music size={48} className="text-gray-500" />
          </div>
        )}
        
        {isHovering && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-purple-600 rounded-full p-3 animate-pulse">
              <Play size={24} fill="white" className="ml-1" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{playlist.title}</h3>
        
        <div className="flex items-center mt-2 text-sm text-gray-400">
          <Music size={14} className="mr-1" />
          <span>{playlist.nb_tracks} tracks</span>
          
          {playlist.duration > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{formatDuration(playlist.duration)}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <User size={12} className="mr-1" />
          <span>By {playlist.creator?.name || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
}

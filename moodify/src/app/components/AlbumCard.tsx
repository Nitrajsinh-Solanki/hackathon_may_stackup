// hackathon_may_stackup\moodify\src\app\components\AlbumCard.tsx



'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Music, User, Calendar } from 'lucide-react';
import { AudioDBAlbum } from '@/lib/audiodb-api';

interface AlbumCardProps {
  album: AudioDBAlbum;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <Link 
      href={`/dashboard/album/${album.idAlbum}`}
      className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-square">
        {album.strAlbumThumb ? (
          <Image
            src={album.strAlbumThumb}
            alt={album.strAlbum}
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
        <h3 className="font-semibold text-white truncate">{album.strAlbum}</h3>
        
        <div className="flex items-center mt-2 text-sm text-gray-400">
          <Music size={14} className="mr-1" />
          <span>Album</span>
        </div>
        
        <div className="flex items-center mt-2 text-xs text-gray-500">
          {album.strArtist && (
            <>
              <User size={12} className="mr-1" />
              <span>{album.strArtist}</span>
            </>
          )}
          
          {album.intYearReleased && (
            <>
              <span className="mx-2">•</span>
              <Calendar size={12} className="mr-1" />
              <span>{album.intYearReleased}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}


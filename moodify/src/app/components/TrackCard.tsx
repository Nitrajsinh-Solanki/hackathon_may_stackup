// moodify\src\app\components\TrackCard.tsx


import { Track, formatDuration } from '@/lib/audius-api';
import { Play, Heart, Clock } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600">
      <div className="relative group">
        <img 
          src={track.artwork['480x480'] || '/placeholder-album.png'} 
          alt={track.title}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <button 
            onClick={() => onPlay(track)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transform transition-transform group-hover:scale-105"
          >
            <Play size={24} fill="white" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-white truncate">{track.title}</h3>
        <p className="text-gray-400 text-sm truncate">{track.user.name}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Heart size={14} className="mr-1" />
            <span>{track.favorite_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{formatDuration(track.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

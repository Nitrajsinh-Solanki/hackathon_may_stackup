// moodify\src\app\components\MusicPlayer.tsx


'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Track, getStreamUrl, formatDuration } from '@/lib/audius-api';

interface MusicPlayerProps {
  track: Track | null;
  onClose: () => void;
}

export default function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (track) {
      setIsPlaying(true);
    }
  }, [track]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.volume = newMutedState ? 0 : volume;
    }
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
      <audio
        ref={audioRef}
        src={getStreamUrl(track.id)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        autoPlay
      />
      
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center w-1/4">
          <img 
            src={track.artwork['150x150'] || '/placeholder-album.png'} 
            alt={track.title}
            className="h-12 w-12 rounded-md mr-3"
          />
          <div className="truncate">
            <p className="text-white font-medium truncate">{track.title}</p>
            <p className="text-gray-400 text-sm truncate">{track.user.name}</p>
          </div>
        </div>
        
        <div className="w-2/4 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <button className="text-gray-400 hover:text-white">
              <SkipBack size={20} />
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="text-gray-400 hover:text-white">
              <SkipForward size={20} />
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%)`
              }}
            />
            <span className="text-xs text-gray-400 w-10">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
        
        <div className="w-1/4 flex justify-end items-center space-x-4">
          <button 
            className="text-gray-400 hover:text-white"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}

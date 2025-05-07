// moodify\src\app\components\MusicPlayer.tsx




"use client";
import { useEffect, useRef, useState } from "react";
import { Track, getStreamUrl } from "@/lib/audius-api";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";

interface MusicPlayerProps {
  track: Track;
  onClose: () => void;
}

export default function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const streamUrl = getStreamUrl(track.id);
    console.log("Loading audio from:", streamUrl);
    
    setIsAudioReady(false);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    
    audio.src = streamUrl;
    audio.volume = volume;
    audio.crossOrigin = "anonymous"; 
    audio.preload = "auto";
    
    const handleCanPlay = () => {
      console.log("Audio can play now");
      setIsAudioReady(true);
    };
    
    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
    };
    
    const handleError = () => {
      console.error("Audio error:", audio.error);
      
      // get specific error message based on error code
      let errorMessage = "Failed to load audio. Please try again.";
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio playback was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading audio.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio decoding error.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format not supported.";
            break;
        }
      }
      
      setAudioError(errorMessage);
      setIsPlaying(false);
      
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        
        const alternativeUrl = `https://discoveryprovider.audius.co/v1/tracks/stream/${track.id}?app_name=MOODIFY`;
        console.log("Trying alternative URL:", alternativeUrl);
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = alternativeUrl;
            audioRef.current.load();
          }
        }, 1000);
      }
    };
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    
    // Try to load the audio
    audio.load();
    
    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [track.id, volume, loadAttempts]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioReady) return;
    
    if (isPlaying) {
      console.log("Attempting to play audio");
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
          
          // Check if it's a user interaction error
          if (err.name === "NotAllowedError") {
            setAudioError("Playback requires user interaction. Please click play again.");
          } else {
            setAudioError("Playback failed. Try again or try another track.");
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, isAudioReady]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (audioError) {
      setAudioError(null);
      if (audioRef.current) {
        const streamUrl = getStreamUrl(track.id);
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        setLoadAttempts(0);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 z-50">
      <audio ref={audioRef} className="hidden" />
      <div className="max-w-7xl mx-auto">
        {/* Visualizer */}
        <div className="mb-4">
          <AudioVisualizer audioRef={audioRef} />
        </div>
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4">
            <img
              src={track.artwork["150x150"] || "/placeholder-album.png"}
              alt={track.title}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <h4 className="text-white font-medium truncate max-w-[200px]">
                {track.title}
              </h4>
              <p className="text-gray-400 text-sm truncate max-w-[200px]">
                {track.user.name}
              </p>
              {audioError && (
                <p className="text-red-400 text-xs mt-1">{audioError}</p>
              )}
            </div>
          </div>
          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-xl mx-4">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white">
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="text-gray-400 hover:text-white">
                <SkipForward size={20} />
              </button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-400 w-10">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
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
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

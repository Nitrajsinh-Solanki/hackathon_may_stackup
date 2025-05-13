// moodify\src\app\components\MusicPlayer.tsx





"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
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
  autoPlay?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  userInteracted?: boolean;
  onError?: () => void;
}

const MusicPlayer = forwardRef(({ 
  track, 
  onClose, 
  autoPlay = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  userInteracted = false,
  onError
}: MusicPlayerProps, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [localUserInteracted, setLocalUserInteracted] = useState(userInteracted);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  
useImperativeHandle(ref, () => ({
  playTrack: () => {
    if (audioRef.current && isAudioReady) {
      setLocalUserInteracted(true);
      setIsPlaying(true);
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      context.resume().then(() => {
        if (audioRef.current) {
          console.log("Attempting to play track via playTrack method");
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromiseRef.current = playPromise;
            playPromise
              .then(() => {
                console.log("Track started playing successfully");
              })
              .catch(err => {
                console.error("Force play failed:", err);
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.play().catch(e => 
                      console.error("Retry play failed:", e)
                    );
                  }
                }, 200);
              });
          }
        }
      });
    } else {
      console.warn("Audio not ready yet or ref not available");
    }
  }
}));



  // updating local state when prop changes
  useEffect(() => {
    setLocalUserInteracted(userInteracted);
  }, [userInteracted]);

  // setting up  audio source and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          audio.pause();
        })
        .catch(err => {
          console.error("Error handling previous play promise:", err);
        })
        .finally(() => {
          playPromiseRef.current = null;
        });
    } else {
      audio.pause();
    }
    
    const streamUrl = getStreamUrl(track.id);
    console.log("Loading audio from:", streamUrl);
    
    setIsAudioReady(false);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    audio.src = streamUrl;
    audio.crossOrigin = "anonymous"; 
    audio.preload = "auto";
    
const handleCanPlay = () => {
  console.log("Audio can play now");
  setIsAudioReady(true);
  
  if (autoPlay && localUserInteracted) {
    console.log("Attempting auto-play");
    const promise = audio.play()
      .then(() => {
        console.log("Auto-play successful");
        setIsPlaying(true);
      })
      .catch(err => {
        console.error("Auto-play failed:", err);
        setIsPlaying(false);
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => {
                console.log("Delayed auto-play successful");
                setIsPlaying(true);
              })
              .catch(e => console.error("Delayed auto-play failed:", e));
          }
        }, 300);
      });
    playPromiseRef.current = promise;
  }
};

    
    
    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
    };
    
    const handleError = () => {
      console.error("Audio error:", audio.error);
          
      if (loadAttempts < 3) {
        console.log(`Retrying load (attempt ${loadAttempts + 1})...`);
        setLoadAttempts(prev => prev + 1);
                  
        // trying to reload with a slight delay
        setTimeout(() => {
          if (audioRef.current) {
            const streamUrl = getStreamUrl(track.id);
            audioRef.current.src = streamUrl;
            audioRef.current.load();
          }
        }, 1000);
      } else {
        setAudioError("Failed to load audio. Please try again or try another track.");
              
        // calling the onError callback if provided
        if (onError) {
          onError();
        }
      }
    };
    
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    
const handleEnded = () => {
  console.log("Track ended, playing next track");
  setIsPlaying(false);
  
  if (hasNext && onNext) {
    setTimeout(() => {
      onNext();
    }, 100);
  }
};

    
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    
    audio.volume = isMuted ? 0 : volume;
    
    audio.load();
    
    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audio.pause();
          })
          .catch(err => {
            console.error("Error in cleanup:", err);
          });
      } else {
        audio.pause();
      }
      
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [track.id, loadAttempts, autoPlay, localUserInteracted, hasNext, onNext]); 

  useEffect(() => {
    const handleUserInteraction = () => {
      setLocalUserInteracted(true);
      
      if (autoPlay && isAudioReady && !isPlaying && audioRef.current) {
        const promise = audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Play after interaction failed:", err));
        
        playPromiseRef.current = promise;
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [autoPlay, isAudioReady, isPlaying]);

  // handling play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioReady) return;
    
    if (isPlaying) {
      console.log("Attempting to play audio");
      
      if (playPromiseRef.current) {
        console.log("There's already a play operation in progress");
        return;
      }
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromiseRef.current = playPromise;
        
        playPromise
          .then(() => {
            playPromiseRef.current = null;
          })
          .catch((err) => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
            playPromiseRef.current = null;
            
            if (err.name === "NotAllowedError") {
              setAudioError("Playback requires user interaction. Please click play again.");
            } else {
              setAudioError("Playback failed. Try again or try another track.");
            }
          });
      }
    } else {
      // only pause if there's no pending play operation
      if (!playPromiseRef.current) {
        audio.pause();
      } else {
        // If there's a pending play operation, wait for it to resolve before pausing
        playPromiseRef.current
          .then(() => {
            audio.pause();
            playPromiseRef.current = null;
          })
          .catch(err => {
            console.error("Error in play promise before pause:", err);
            playPromiseRef.current = null;
          });
      }
    }
  }, [isPlaying, isAudioReady]);

  // separate effect for handling volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (progressRef.current && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100;
      progressRef.current.style.width = `${progressPercentage}%`;
    }
  }, [currentTime, duration]);

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
    setLocalUserInteracted(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setLocalUserInteracted(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setLocalUserInteracted(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
    setLocalUserInteracted(true);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    
    const seekPercentage = clickPosition / progressBarWidth;
    const seekTime = duration * seekPercentage;
    
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
    
    setLocalUserInteracted(true);
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
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
        <div className="mb-4">
          <AudioVisualizer audioRef={audioRef} />
        </div>
        <div className="flex items-center justify-between">
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
              {!localUserInteracted && autoPlay && (
                <p className="text-yellow-400 text-xs mt-1">Click play to start audio</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-xl mx-4">
            <div className="flex items-center space-x-4">
              <button 
                className={`text-gray-400 hover:text-white ${!hasPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePrevious}
                disabled={!hasPrevious}
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                className={`text-gray-400 hover:text-white ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNext}
                disabled={!hasNext}
              >
                <SkipForward size={20} />
              </button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-400 w-10">
                {formatTime(currentTime)}
              </span>
              
              {/* custom progress bar with colored progress */}
              <div 
                className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer relative"
                onClick={handleProgressBarClick}
              >
                <div 
                  ref={progressRef}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            {/* Custom volume slider with colored progress */}
            <div className="w-20 h-1 bg-gray-700 rounded-lg relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
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
});

MusicPlayer.displayName = "MusicPlayer";

export default MusicPlayer;
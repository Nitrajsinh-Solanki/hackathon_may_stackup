
// hackathon_may_stackup\moodify\src\app\components\LikedMusicList.tsx


"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Heart, Clock } from "lucide-react";
import MusicPlayer from "@/app/components/MusicPlayer";
import CloudinaryMusicPlayer from "@/app/components/CloudinaryMusicPlayer";

interface LikedTrack {
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  genre?: string;
  mood?: string;
  likedAt: string;
  cloudinaryUrl?: string; 
}

export default function LikedMusicList() {
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [playerKey, setPlayerKey] = useState(0); 
  const [userInteracted, setUserInteracted] = useState(false);
  const playerRef = useRef<{ playTrack: () => void } | null>(null);
  const [useCloudinaryPlayer, setUseCloudinaryPlayer] = useState(false);

  useEffect(() => {
    const fetchLikedTracks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/my-music/liked-tracks");
        if (!response.ok) {
          throw new Error("Failed to fetch liked tracks");
        }
        const data = await response.json();
        setLikedTracks(data.likedTracks || []);
      } catch (err) {
        console.error("Error fetching liked tracks:", err);
        setError("Failed to load your liked music. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikedTracks();
    
    // setting user interaction flag when user interacts with the page
    const handleInteraction = () => {
      setUserInteracted(true);
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const handlePlay = (track: LikedTrack, index: number) => {
    setUserInteracted(true);
    
    if (showPlayer) {
      setPlayerKey(prevKey => prevKey + 1);
    }
    
    // check if track has a cloudinaryUrl and set the player type accordingly
    if (track.cloudinaryUrl) {
      setUseCloudinaryPlayer(true);
      
      const cloudinaryTrack = {
        _id: track.trackId,
        title: track.title,
        artist: track.artist,
        cloudinaryUrl: track.cloudinaryUrl,
        coverImage: track.artwork,
        duration: track.duration,
        genre: track.genre || "",
        mood: track.mood || ""
      };
      
      setCurrentTrack(cloudinaryTrack);
    } else {
      setUseCloudinaryPlayer(false);
      
      const playerTrack = {
        id: track.trackId,
        title: track.title,
        user: {
          name: track.artist
        },
        artwork: {
          "150x150": track.artwork,
          "480x480": track.artwork,
          "1000x1000": track.artwork
        },
        duration: track.duration,
        genre: track.genre || "",
        mood: track.mood || "",
        play_count: 0
      };
      
      setCurrentTrack(playerTrack);
    }
    
    setCurrentTrackIndex(index);
    setShowPlayer(true);
    
    setTimeout(() => {
      if (playerRef.current && playerRef.current.playTrack) {
        playerRef.current.playTrack();
      }
    }, 300);
  };

  const handleAudiusError = () => {
    // if we have a cloudinary URL for the current track, switch to cloudinary player
    const track = likedTracks[currentTrackIndex];
    if (track && track.cloudinaryUrl) {
      setUseCloudinaryPlayer(true);
      
      const cloudinaryTrack = {
        _id: track.trackId,
        title: track.title,
        artist: track.artist,
        cloudinaryUrl: track.cloudinaryUrl,
        coverImage: track.artwork,
        duration: track.duration,
        genre: track.genre || "",
        mood: track.mood || ""
      };
      
      setCurrentTrack(cloudinaryTrack);
      setPlayerKey(prevKey => prevKey + 1);
    }
  };

  const handleUnlike = async (trackId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // sending request to unlike the track
      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlike track');
      }
      
      // removing the track from the local state
      setLikedTracks(prev => prev.filter(track => track.trackId !== trackId));
    } catch (error) {
      console.error("Error unliking track:", error);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      const prevTrack = likedTracks[prevIndex];
      handlePlay(prevTrack, prevIndex);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < likedTracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      const nextTrack = likedTracks[nextIndex];
      handlePlay(nextTrack, nextIndex);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-white bg-red-800 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (likedTracks.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <p className="text-gray-400">You haven't liked any music yet</p>
        <p className="text-gray-500 mt-2">
          Explore the discovery page and like some tracks to see them here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-800/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-800/60 text-left">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">#</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">Title</th>
                <th className="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">Artist</th>
                <th className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">
                  <Clock size={16} />
                </th>
                <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">Genre</th>
                <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm">Mood</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-gray-400 font-medium text-xs md:text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {likedTracks.map((track, index) => (
                <tr
                  key={track.trackId}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handlePlay(track, index)}
                >
                  <td className="px-2 md:px-4 py-2 md:py-3 text-gray-400 text-xs md:text-sm">{index + 1}</td>
                  <td className="px-2 md:px-4 py-2 md:py-3">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                        <img
                          src={track.artwork || "/placeholder-album.png"}
                          alt={track.title}
                          className="w-8 h-8 md:w-10 md:h-10 rounded object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded">
                          <Play size={16} className="text-white" fill="white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium truncate max-w-[120px] sm:max-w-[200px] text-xs md:text-sm">
                          {track.title}
                        </span>
                        <span className="sm:hidden text-gray-400 text-xs truncate max-w-[120px]">
                          {track.artist}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-300 text-xs md:text-sm">{track.artist}</td>
                  <td className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 text-gray-400 text-xs md:text-sm">
                    {formatTime(track.duration)}
                  </td>
                  <td className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3">
                    {track.genre && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {track.genre}
                      </span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3">
                    {track.mood && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {track.mood}
                      </span>
                    )}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-right">
                    <button
                      onClick={(e) => handleUnlike(track.trackId, e)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Unlike"
                    >
                      <Heart size={16} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showPlayer && currentTrack && (
        useCloudinaryPlayer ? (
          <CloudinaryMusicPlayer
            key={playerKey}
            ref={playerRef}
            track={currentTrack}
            onClose={() => setShowPlayer(false)}
            autoPlay={true}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={currentTrackIndex > 0}
            hasNext={currentTrackIndex < likedTracks.length - 1}
            userInteracted={userInteracted}
          />
        ) : (
          <MusicPlayer
            key={playerKey}
            ref={playerRef}
            track={currentTrack}
            onClose={() => setShowPlayer(false)}
            autoPlay={true}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={currentTrackIndex > 0}
            hasNext={currentTrackIndex < likedTracks.length - 1}
            userInteracted={userInteracted}
            onError={handleAudiusError}
          />
        )
      )}
    </div>
  );
  

  
}

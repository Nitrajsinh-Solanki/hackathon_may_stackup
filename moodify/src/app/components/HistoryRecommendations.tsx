// hackathon_may_stackup\moodify\src\app\components\HistoryRecommendations.tsx


"use client";
import { useState, useEffect, useRef } from "react";
import { getPersonalizedMusicRecommendations } from "@/lib/gemini-api2";
import { searchJamendoTracks, JamendoTrack } from "@/lib/jamendo-api";
import { IUser } from "@/models/User";
import Image from "next/image";
import CloudinaryMusicPlayer from "./CloudinaryMusicPlayer";
import { Compass } from "lucide-react";

interface Recommendation {
  title: string;
  artist: string;
}

interface CloudinaryTrack {
  _id: string;
  title: string;
  artist?: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  genre?: string;
  mood?: string;
}

export default function HistoryRecommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    async function fetchUserDataAndRecommendations() {
      try {
        setLoading(true);
        setError(null);
        
        // fetching user data
        const userDataResponse = await fetch('/api/user/data');
        if (!userDataResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userDataResponse.json();
        
        // creating a user object with the required structure for the recommendation function
        const user = {
          likedTracks: userData.likedTracks || [],
          savedPlaylists: userData.savedPlaylists || [],
          savedAlbums: userData.savedAlbums || [],
          searchHistory: userData.searchHistory || []
        } as IUser;
        
        // checking if user has any history data
        const hasHistory = 
          user.likedTracks.length > 0 ||
          user.savedPlaylists.length > 0 ||
          user.savedAlbums.length > 0 ||
          user.searchHistory.length > 0;
        
        if (!hasHistory) {
          setIsNewUser(true);
          setLoading(false);
          return;
        }
        
        // getting recommendations from Gemini only if user has history
        const recs = await getPersonalizedMusicRecommendations(user);
        setRecommendations(recs);
        
        // fetching tracks from Jamendo for each recommendation
        const jamendoTracks = await Promise.all(
          recs.slice(0, 6).map(async (rec: { title: any; artist: any; }) => {
            const searchQuery = `${rec.title} ${rec.artist}`;
            const tracks = await searchJamendoTracks(searchQuery, 1);
            return tracks[0] || null;
          })
        );
        
        // filtering out null results
        setTracks(jamendoTracks.filter(Boolean));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserDataAndRecommendations();
  }, []);

  // converting Jamendo track to CloudinaryTrack format for the player
  const convertToCloudinaryTrack = (track: JamendoTrack): CloudinaryTrack => {
    return {
      _id: track.id || `jamendo-${Math.random().toString(36).substr(2, 9)}`,
      title: track.name,
      artist: track.artist_name,
      cloudinaryUrl: track.audio,
      coverImage: track.image,
      duration: track.duration || 0,
      genre: track.genre_name || "",
      mood: "",
    };
  };

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setUserInteracted(true);
  };

  const handleClosePlayer = () => {
    setCurrentTrackIndex(null);
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Personalizing Your Recommendations...
        </h3>
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Personalized For You
        </h3>
        <div className="text-center py-10">
          <div className="mb-4">
            <Compass className="h-16 w-16 mx-auto text-purple-500" />
          </div>
          <h4 className="text-white text-lg font-medium mb-2">
            Welcome to Moodify!
          </h4>
          <p className="text-gray-300 max-w-md mx-auto">
            Start exploring music, create playlists, and like tracks to get personalized recommendations based on your taste.
          </p>
          <div className="mt-6">
            <a 
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Compass className="mr-2 h-4 w-4" />
              Start Exploring
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-24">
      <h3 className="text-xl font-semibold text-white mb-4">
        Personalized For You
      </h3>
      
      {tracks.length === 0 ? (
        <div className="text-center py-10">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="text-gray-300 text-lg">
            We couldn't find any playable tracks based on your history.
          </p>
          <p className="text-gray-400 mt-2">
            Try liking more tracks or creating playlists to improve recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map((track, index) => (
            <div 
              key={track.id}
              className="bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700 transition cursor-pointer group"
              onClick={() => handlePlayTrack(index)}
            >
              <div className="relative h-48 w-full">
                <Image
                  src={track.image || '/placeholder-album.png'}
                  alt={track.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-purple-600 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-medium truncate">{track.name}</h4>
                <p className="text-gray-400 text-sm truncate mt-1">{track.artist_name}</p>
                {track.album_name && (
                  <p className="text-gray-500 text-xs mt-2 truncate">
                    Album: {track.album_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {currentTrackIndex !== null && tracks[currentTrackIndex] && (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700">
    <CloudinaryMusicPlayer
      ref={playerRef}
      track={convertToCloudinaryTrack(tracks[currentTrackIndex])}
      onClose={handleClosePlayer}
      autoPlay={true}
      onPrevious={handlePreviousTrack}
      onNext={handleNextTrack}
      hasPrevious={currentTrackIndex > 0}
      hasNext={currentTrackIndex < tracks.length - 1}
      userInteracted={userInteracted}
    />
  </div>
)}

    </div>
  );
}

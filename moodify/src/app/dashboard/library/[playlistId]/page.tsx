// hackathon_may_stackup\moodify\src\app\dashboard\library\[playlistId]\page.tsx


"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Music, Play, Trash } from "lucide-react";
import MusicPlayer from "@/app/components/MusicPlayer";
import { formatDuration } from "@/lib/audius-api";

interface PlaylistTrack {
  trackId: string;
  title: string;
  artist: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  addedAt: Date;
}

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  tracks: PlaylistTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params.playlistId as string;
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRemovingTrack, setIsRemovingTrack] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch playlist");
        }
        const data = await response.json();
        setPlaylist(data.playlist);
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError("Failed to load playlist. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const handleBack = () => {
    router.back();
  };

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleNext = () => {
    if (playlist && currentTrackIndex < playlist.tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentTrackIndex(-1);
  };

  const handleRemoveTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    
    if (!playlist || !trackId) return;
    
    try {
      setIsRemovingTrack(trackId);
      
      const response = await fetch(`/api/playlists/${playlistId}/remove-track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove track");
      }
      
      const data = await response.json();
      setPlaylist(data.playlist);
      
      if (currentTrackIndex !== -1 && playlist.tracks[currentTrackIndex]?.trackId === trackId) {
        setIsPlaying(false);
        setCurrentTrackIndex(-1);
      }
    } catch (err: any) {
      console.error("Error removing track:", err);
      alert(`Error removing track: ${err.message}`);
    } finally {
      setIsRemovingTrack(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-300">{error || "Playlist not found"}</p>
        <button
          onClick={handleBack}
          className="mt-2 text-sm text-white bg-red-800 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < playlist.tracks.length 
    ? playlist.tracks[currentTrackIndex] 
    : null;

  return (
    <div className="pb-24">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Library
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div 
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 aspect-square relative group cursor-pointer"
            onClick={handlePlayAll}
          >
            {playlist.coverImage ? (
              <img
                src={playlist.coverImage}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                <Music size={64} className="text-gray-600" />
              </div>
            )}
            
            {/* play button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full"
                disabled={playlist.tracks.length === 0}
              >
                <Play size={24} fill="white" />
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="text-gray-400 mb-4">{playlist.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
            <div>Created: {formatDate(playlist.createdAt.toString())}</div>
            <div>Updated: {formatDate(playlist.updatedAt.toString())}</div>
            <div>{playlist.tracks.length} tracks</div>
          </div>
          
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className={`px-6 py-2 rounded-full text-white font-medium ${
              playlist.tracks.length > 0
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            Play All
          </button>
        </div>
      </div>

      {/* tracks list */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Tracks</h2>
        
        {playlist.tracks.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center">
            <Music size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">This playlist is empty. Add some tracks to get started!</p>
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400 text-sm">
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Artist</th>
                  <th className="p-4 text-right">
                    <Clock size={16} />
                  </th>
                  <th className="p-4 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {playlist.tracks.map((track, index) => (
                  <tr
                    key={track.trackId}
                    className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${
                      currentTrackIndex === index ? "bg-purple-900/30" : ""
                    } cursor-pointer`}
                    onClick={() => handlePlayTrack(index)}
                  >
                    <td className="p-4 text-gray-400">
                      {currentTrackIndex === index && isPlaying ? (
                        <div className="w-4 h-4 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1 h-4 bg-purple-500 animate-pulse-fast mx-px"></div>
                            <div className="w-1 h-3 bg-purple-500 animate-pulse-slow mx-px"></div>
                            <div className="w-1 h-5 bg-purple-500 animate-pulse mx-px"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center text-gray-400 group-hover:text-white">
                          <Play size={14} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 mr-3 bg-gray-700 rounded overflow-hidden flex-shrink-0"
                        >
                          {track.coverImage ? (
                            <img
                              src={track.coverImage}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Music size={16} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="text-white truncate">{track.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{track.artist}</td>
                    <td className="p-4 text-right text-gray-400">
                      {formatDuration(track.duration)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => handleRemoveTrack(e, track.trackId)}
                        className="text-gray-500 hover:text-red-400"
                        title="Remove from playlist"
                        disabled={isRemovingTrack === track.trackId}
                      >
                        {isRemovingTrack === track.trackId ? (
                          <div className="w-4 h-4 border-t-2 border-red-400 border-solid rounded-full animate-spin"></div>
                        ) : (
                          <Trash size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* music Player is implemented here */}
      {currentTrack && (
        <MusicPlayer
          track={{
            id: currentTrack.trackId,
            title: currentTrack.title,
            user: {
                name: currentTrack.artist,
                id: "",
                handle: ""
            },
            artwork: {
              "150x150": currentTrack.coverImage || "/placeholder-album.png",
              "480x480": currentTrack.coverImage || "/placeholder-album.png",
              "1000x1000": currentTrack.coverImage || "/placeholder-album.png"
            },
            duration: currentTrack.duration,
            favorite_count: 0,
            play_count: 0,
            permalink: "",
            description: "",
            genre: "",
            mood: "",
            release_date: "",
            repost_count: 0
          }}
          onClose={handleClosePlayer}
          autoPlay={isPlaying}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={currentTrackIndex > 0}
          hasNext={playlist && currentTrackIndex < playlist.tracks.length - 1}
          userInteracted={true}
        />
      )}
    </div>
  );
}


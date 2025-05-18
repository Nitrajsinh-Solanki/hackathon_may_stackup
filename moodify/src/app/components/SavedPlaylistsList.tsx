// hackathon_may_stackup\moodify\src\app\components\SavedPlaylistsList.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Music, Loader, Bookmark, X, BookmarkX } from "lucide-react";
import { useRouter } from "next/navigation";

interface SavedPlaylist {
  playlistId: string;
  title: string;
  description?: string;
  coverImage?: string;
  trackCount?: number;
  creator?: string;
  savedAt: string;
}

export default function SavedPlaylistsList() {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsavingPlaylistId, setUnsavingPlaylistId] = useState<string | null>(null);
  const router = useRouter();

  const fetchSavedPlaylists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/playlists/saved");
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?redirect=/dashboard/library");
          return;
        }
        throw new Error("Failed to fetch saved playlists");
      }
      
      const data = await response.json();
      setPlaylists(data.savedPlaylists || []);
    } catch (err) {
      console.error("Error fetching saved playlists:", err);
      setError("Failed to load your saved playlists. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlaylists();
  }, [router]);

  const handleUnsavePlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    try {
      setUnsavingPlaylistId(playlistId);
      
      const response = await fetch("/api/playlists/save", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId }),
      });
      if (!response.ok) {
        throw new Error("Failed to unsave playlist");
      }
      // removing the playlist from the state
      setPlaylists(playlists.filter(playlist => playlist.playlistId !== playlistId));
      
    } catch (err) {
      console.error("Error unsaving playlist:", err);
      setError("Failed to unsave playlist. Please try again later.");
    } finally {
      setUnsavingPlaylistId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={30} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <Music size={40} className="mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400 mb-4">You haven't saved any playlists yet</p>
        <Link 
          href="/dashboard/playlist-album"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
        >
          Explore Playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {playlists.map((playlist) => (
        <div key={playlist.playlistId} className="relative group">
          <Link
            href={`/dashboard/playlist/${playlist.playlistId}`}
            className="block bg-gray-800/40 hover:bg-gray-800/70 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 group"
          >
            <div className="relative aspect-square">
              {playlist.coverImage ? (
                <Image
                  src={playlist.coverImage}
                  alt={playlist.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Music size={30} className="text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-2 sm:p-3 md:p-4">
                <div className="bg-purple-600 rounded-full p-2 sm:p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Music size={16} className="text-white" />
                </div>
              </div>
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <h3 className="text-white text-sm sm:text-base font-medium truncate">{playlist.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
                {playlist.trackCount} tracks • {playlist.creator || "Unknown"}
              </p>
            </div>
          </Link>
          
          {/* unsave button */}
          <button
            onClick={(e) => handleUnsavePlaylist(e, playlist.playlistId)}
            disabled={unsavingPlaylistId === playlist.playlistId}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 cursor-pointer hover:scale-110 touch-action-manipulation"
            title="Unsave playlist"
          >
            {unsavingPlaylistId === playlist.playlistId ? (
              <Loader size={16} className="animate-spin text-red-400" />
            ) : (
              <BookmarkX size={16} className="text-red-400" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
  



}

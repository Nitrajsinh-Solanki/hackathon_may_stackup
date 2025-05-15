// hackathon_may_stackup\moodify\src\app\components\PlaylistSelector.tsx


"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Check, FolderPlus } from "lucide-react";
import { Track } from "@/lib/audius-api";
import { CreatedPlaylist } from "@/models/User";

interface PlaylistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

export default function PlaylistSelector({ isOpen, onClose, track }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<(CreatedPlaylist & { _id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/playlists/created");
      
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTrackToPlaylist = async (playlistId: string) => {
    if (addingToPlaylist) return;
    
    setAddingToPlaylist(playlistId);
    setSuccessMessage(null);
    
    try {
      const trackData = {
        trackId: track.id,
        title: track.title,
        artist: track.user.name,
        cloudinaryUrl: getStreamUrl(track.id),
        coverImage: track.artwork['480x480'] || track.artwork['150x150'] || '',
        duration: track.duration,
      };
      
      const response = await fetch("/api/playlists/add-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId,
          track: trackData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to add track to playlist");
      }
      
      setSuccessMessage(`Added to ${data.playlist.name}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "Failed to add track to playlist");
      console.error("Error adding track to playlist:", err);
    } finally {
      setAddingToPlaylist(null);
    }
  };
  
  const getStreamUrl = (trackId: string): string => {
    return `https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream?app_name=MOODIFY`;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Save to Playlist</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-200 flex items-center">
              <Check size={18} className="mr-2" />
              {successMessage}
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={track.artwork['150x150'] || '/placeholder-album.png'} 
                alt={track.title}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="overflow-hidden">
                <h3 className="text-white font-medium truncate">{track.title}</h3>
                <p className="text-gray-400 text-sm truncate">{track.user.name}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <h3 className="text-gray-300 text-sm font-medium mb-2">Your Playlists</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-purple-500" />
              </div>
            ) : playlists.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <FolderPlus size={32} className="mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 mb-2">You don't have any playlists yet</p>
                <a 
                  href="/dashboard/library?tab=playlists" 
                  className="text-purple-500 hover:text-purple-400 text-sm"
                >
                  Create a playlist
                </a>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={() => addTrackToPlaylist(playlist._id!)}
                    disabled={addingToPlaylist === playlist._id}
                    className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      {playlist.coverImage ? (
                        <img 
                          src={playlist.coverImage} 
                          alt={playlist.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600">
                          <FolderPlus size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <h4 className="text-white truncate">{playlist.name}</h4>
                      <p className="text-gray-400 text-xs">
                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                    {addingToPlaylist === playlist._id ? (
                      <Loader2 size={18} className="animate-spin text-purple-500" />
                    ) : (
                      <Plus size={18} className="text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

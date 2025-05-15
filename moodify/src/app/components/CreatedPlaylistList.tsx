// hackathon_may_stackup\moodify\src\app\components\CreatedPlaylistList.tsx





"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, MoreVertical, Play, Trash2, Edit } from "lucide-react";
import { CreatedPlaylist } from "@/models/User";
import EditPlaylistModal from "./EditPlaylistModal";

export default function CreatedPlaylistsList() {
  const [playlists, setPlaylists] = useState<(CreatedPlaylist & { _id?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<(CreatedPlaylist & { _id?: string }) | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  
  // creating a ref for the document to handle click outside
  const documentRef = useRef<Document | null>(null);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("/api/playlists/created");
      
      if (!response.ok) {
        throw new Error("Failed to fetch created playlists");
      }
      
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching created playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    documentRef.current = document;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeDropdown) return;
      
      const target = event.target as HTMLElement;
      const isDropdownToggle = target.closest('[data-dropdown-toggle]');
      
      if (!isDropdownToggle || 
         (isDropdownToggle && isDropdownToggle.getAttribute('data-dropdown-toggle') !== activeDropdown)) {
        const isInsideDropdown = target.closest(`[data-dropdown-menu="${activeDropdown}"]`);
        
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (e: React.MouseEvent, playlistId: string | undefined) => {
    e.stopPropagation(); 
    if (!playlistId) return;
    setActiveDropdown(activeDropdown === playlistId ? null : playlistId);
  };

  const handleDeletePlaylist = async (e: React.MouseEvent, playlistId: string | undefined) => {
    e.stopPropagation(); 
    if (!playlistId) return;
    
    try {
      setIsDeleting(playlistId);
      const response = await fetch(`/api/playlists/delete?id=${playlistId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete playlist");
      }
      // removing playlist from state
      setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
      setActiveDropdown(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete playlist");
      console.error("Error deleting playlist:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditPlaylist = (e: React.MouseEvent, playlist: CreatedPlaylist & { _id?: string }) => {
    e.stopPropagation(); 
    setEditingPlaylist(playlist);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleEditSuccess = () => {
    fetchPlaylists();
  };

  const handlePlaylistClick = (playlistId: string | undefined) => {
    if (!playlistId) return;
    router.push(`/dashboard/library/${playlistId}`);
  };

  const handlePlayClick = (e: React.MouseEvent, playlistId: string | undefined) => {
    e.stopPropagation(); 
    if (!playlistId) return;
    router.push(`/dashboard/library/${playlistId}`);
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
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-white bg-red-500/20 hover:bg-red-500/30 px-4 py-1 rounded-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <Music size={48} className="mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400 mb-4">You haven't created any playlists yet</p>
        <Link 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            const createPlaylistTab = document.querySelector('button[data-tab="create-playlist"]');
            if (createPlaylistTab instanceof HTMLElement) {
              createPlaylistTab.click();
            }
          }}
          className="text-purple-500 hover:text-purple-400"
        >
          Create your first playlist
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map((playlist, index) => (
          <div 
            key={index} 
            className="bg-gray-800/40 rounded-lg overflow-hidden hover:bg-gray-800/60 transition-colors group cursor-pointer"
            onClick={() => handlePlaylistClick(playlist._id)}
          >
            <div className="relative aspect-square">
              {playlist.coverImage ? (
                <Image 
                  src={playlist.coverImage}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <Music size={48} className="text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  className="bg-purple-600 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  onClick={(e) => handlePlayClick(e, playlist._id)}
                >
                  <Play fill="white" size={20} className="text-white ml-1" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
                <div className="relative">
                  <button 
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                    onClick={(e) => toggleDropdown(e, playlist._id)}
                    data-dropdown-toggle={playlist._id}
                    aria-label="More options"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {activeDropdown === playlist._id && (
                    <div 
                      className="fixed z-[9999]"
                      style={{
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        data-dropdown-menu={playlist._id}
                        className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                        style={{
                          top: `${document.querySelector(`[data-dropdown-toggle="${playlist._id}"]`)?.getBoundingClientRect().bottom}px`,
                          left: `${document.querySelector(`[data-dropdown-toggle="${playlist._id}"]`)?.getBoundingClientRect().left}px`,
                          transform: 'translateX(-80%)',
                          minWidth: '12rem',
                          pointerEvents: 'auto'
                        }}
                      >
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          onClick={(e) => handleEditPlaylist(e, playlist)}
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Playlist
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          onClick={(e) => handleDeletePlaylist(e, playlist._id)}
                          disabled={isDeleting === playlist._id}
                        >
                          {isDeleting === playlist._id ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-t-2 border-red-400 border-solid rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} className="mr-2" />
                              Delete Playlist
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editingPlaylist && (
        <EditPlaylistModal
          playlist={editingPlaylist}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

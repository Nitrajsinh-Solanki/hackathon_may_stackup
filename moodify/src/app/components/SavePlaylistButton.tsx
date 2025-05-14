// hackathon_may_stackup\moodify\src\app\components\SavePlaylistButton.tsx


"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SavePlaylistButtonProps {
  playlistId: string;
  title: string;
  description?: string;
  coverImage?: string;
  trackCount?: number;
  creator?: string;
}

export default function SavePlaylistButton({
  playlistId,
  title,
  description,
  coverImage,
  trackCount,
  creator,
}: SavePlaylistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`/api/playlists/is-saved?playlistId=${playlistId}`);
        const data = await response.json();
        
        setIsSaved(data.isSaved);
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking if playlist is saved:", error);
      }
    };

    checkIfSaved();
  }, [playlistId]);

  const handleSavePlaylist = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        // removing from saved playlists
        const response = await fetch("/api/playlists/save", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playlistId }),
        });

        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // adding to saved playlists
        const response = await fetch("/api/playlists/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playlistId,
            title,
            description,
            coverImage,
            trackCount,
            creator,
          }),
        });

        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSavePlaylist}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
        isSaved
          ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      } transition-colors`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      ) : isSaved ? (
        <BookmarkCheck size={16} />
      ) : (
        <Bookmark size={16} />
      )}
      {isSaved ? "Saved" : "Save Playlist"}
    </button>
  );
}


// hackathon_may_stackup\moodify\src\app\components\LikeButton.tsx


"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  genre?: string;
  mood?: string;
  cloudinaryUrl?: string; 
}

export default function LikeButton({
  trackId,
  title,
  artist,
  artwork,
  duration,
  genre,
  mood,
  cloudinaryUrl 
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // checking if the track is already liked when component mounts
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/my-music/like?trackId=${trackId}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    checkLikeStatus();
  }, [trackId]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/my-music/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          title,
          artist,
          artwork,
          duration,
          genre,
          mood,
          cloudinaryUrl 
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`transition-colors ${
        isLiked 
          ? "text-red-500 hover:text-red-400" 
          : "text-gray-400 hover:text-red-400"
      }`}
      aria-label={isLiked ? "Unlike" : "Like"}
    >
      <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
    </button>
  );
}

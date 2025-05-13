// hackathon_may_stackup\moodify\src\app\context\LikedTracksContext.tsx


'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TrackInfo {
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  genre?: string;
  mood?: string;
}

type LikedTracksContextType = {
  likedTracks: Record<string, boolean>;
  checkTrackLiked: (trackId: string) => boolean;
  toggleLike: (trackInfo: TrackInfo) => Promise<boolean | undefined>;
  refreshLikedTracks: () => Promise<void>;
  isLoading: boolean;
};

const LikedTracksContext = createContext<LikedTracksContextType | undefined>(undefined);

export function LikedTracksProvider({ children }: { children: ReactNode }) {
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const refreshLikedTracks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/my-music/liked-tracks');
      if (response.ok) {
        const data = await response.json();
        const likedMap: Record<string, boolean> = {};
        data.likedTracks.forEach((track: { trackId: string }) => {
          likedMap[track.trackId] = true;
        });
        setLikedTracks(likedMap);
      }
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshLikedTracks();
  }, []);
  
  const checkTrackLiked = (trackId: string) => {
    return !!likedTracks[trackId];
  };
  
  const toggleLike = async (trackInfo: TrackInfo): Promise<boolean | undefined> => {
    try {
      const response = await fetch('/api/my-music/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackInfo),
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikedTracks(prev => ({
          ...prev,
          [trackInfo.trackId]: data.isLiked
        }));
        return data.isLiked;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  return (
    <LikedTracksContext.Provider value={{ 
       likedTracks,
       checkTrackLiked,
       toggleLike,
       refreshLikedTracks,
       isLoading
    }}>
      {children}
    </LikedTracksContext.Provider>
  );
}

export function useLikedTracks() {
  const context = useContext(LikedTracksContext);
  if (context === undefined) {
    throw new Error('useLikedTracks must be used within a LikedTracksProvider');
  }
  return context;
}

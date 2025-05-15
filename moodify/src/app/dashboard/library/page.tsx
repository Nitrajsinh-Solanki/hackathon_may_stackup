// hackathon_may_stackup\moodify\src\app\dashboard\library\page.tsx.






"use client";

import { useState } from "react";
import { Heart, ListMusic, Disc, PlusCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import LikedMusicList from "@/app/components/LikedMusicList";
import SavedPlaylistsList from "@/app/components/SavedPlaylistsList";
import SavedAlbumsList from "@/app/components/SavedAlbumsList";
import CreatePlaylistForm from "@/app/components/CreatePlaylistForm";
import CreatedPlaylistsList from "@/app/components/CreatedPlaylistList";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("liked");
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const tabs = [
    { id: "liked", label: "Liked Music", icon: <Heart size={18} /> },
    { id: "saved-playlists", label: "Saved Playlists", icon: <ListMusic size={18} /> },
    { id: "saved-albums", label: "Saved Albums", icon: <Disc size={18} /> },
    { id: "created-playlists", label: "Created Playlists", icon: <ListMusic size={18} /> },
    { id: "create-playlist", label: "Create New Playlist", icon: <PlusCircle size={18} /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {/* horizontal navigation is implemented here */}
      <div className="mb-8 border-b border-gray-800 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? "text-purple-500 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* refresh button */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={forceRefresh}
          className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white bg-gray-800/50 px-3 py-1 rounded-full"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>
      
      {/* content Area */}
      <div className="mt-6">
        {activeTab === "liked" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Liked Music</h2>
            <LikedMusicList key={`liked-${refreshKey}`} />
          </div>
        )}
        
        {activeTab === "saved-playlists" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Saved Playlists</h2>
            <SavedPlaylistsList key={`playlists-${refreshKey}`} />
          </div>
        )}
        
        {activeTab === "saved-albums" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Saved Albums</h2>
            <SavedAlbumsList key={`albums-${refreshKey}`} />
          </div>
        )}
        
        {activeTab === "created-playlists" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Created Playlists</h2>
            <CreatedPlaylistsList key={`created-playlists-${refreshKey}`} />
          </div>
        )}
        
        {activeTab === "create-playlist" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create a New Playlist</h2>
            <CreatePlaylistForm onSuccess={() => {
              forceRefresh();
              setActiveTab("created-playlists");
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

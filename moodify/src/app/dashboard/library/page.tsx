// hackathon_may_stackup\moodify\src\app\dashboard\library\page.tsx.



"use client";

import { useState } from "react";
import { Heart, ListMusic, Disc, PlusCircle } from "lucide-react";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("liked");

  const tabs = [
    { id: "liked", label: "Liked Music", icon: <Heart size={18} /> },
    { id: "saved-playlists", label: "Saved Playlists", icon: <ListMusic size={18} /> },
    { id: "saved-albums", label: "Saved Albums", icon: <Disc size={18} /> },
    { id: "created-playlists", label: "Created Playlists", icon: <ListMusic size={18} /> },
    { id: "create-playlist", label: "Create New Playlist", icon: <PlusCircle size={18} /> },
  ];

  return (
    <div className="w-full">
      {/* Horizontal Navigation */}
      <div className="mb-8 border-b border-gray-800 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === "liked" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Liked Music</h2>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Your liked music will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "saved-playlists" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Saved Playlists</h2>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Your saved playlists will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "saved-albums" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Saved Albums</h2>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Your saved albums will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "created-playlists" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Created Playlists</h2>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Your created playlists will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "create-playlist" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Create a New Playlist</h2>
            <div className="bg-gray-800/50 rounded-lg p-8">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="playlist-name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter playlist name"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    id="playlist-description"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter playlist description"
                  ></textarea>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Create Playlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// hackathon_may_stackup\moodify\src\app\dashboard\library\saved-playlists\page.tsx


"use client";

import SavedPlaylistsList from "@/app/components/SavedPlaylistsList";

export default function SavedPlaylistsPage() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Your Saved Playlists</h2>
      <SavedPlaylistsList />
    </div>
  );
}

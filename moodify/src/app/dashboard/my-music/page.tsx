// moodify\src\app\dashboard\my-music\page.tsx



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Loader2, PlayCircle, PauseCircle } from 'lucide-react';

interface UploadedTrack {
  _id: string;
  title: string;
  artist?: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  genre?: string;
  mood?: string;
  uploadedAt: Date;
}

export default function MyMusic() {
  const router = useRouter();
  const [tracks, setTracks] = useState<UploadedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/my-music');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch tracks');
        }

        const data = await response.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load your music');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();

    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [router]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: Date): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePlay = (trackId: string, url: string) => {
    if (currentlyPlaying === trackId) {
      // Pause current track
      if (audioElement) {
        audioElement.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop current audio if any
      if (audioElement) {
        audioElement.pause();
      }

      // Play new track
      const audio = new Audio(url);
      audio.play();

      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });

      setAudioElement(audio);
      setCurrentlyPlaying(trackId);
    }
  };

  const goToUpload = () => {
    router.push('/dashboard/upload', { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Music</h1>
        <button
          onClick={goToUpload}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Upload New Track
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No tracks yet</h3>
          <p className="text-gray-500 mb-6">Upload your first track to get started</p>
          <button
            onClick={goToUpload}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Upload Music
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-gray-400 text-sm font-medium">
            <div className="col-span-6 md:col-span-5">Track</div>
            <div className="hidden md:block md:col-span-2">Duration</div>
            <div className="col-span-3 md:col-span-2">Genre</div>
            <div className="col-span-3 md:col-span-2">Uploaded</div>
            <div className="hidden md:block md:col-span-1">Play</div>
          </div>

          <div className="divide-y divide-gray-700">
            {tracks.map((track) => (
              <div
                key={track._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700/50 transition-colors items-center"
              >
                <div className="col-span-6 md:col-span-5 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                    {track.coverImage ? (
                      <img
                        src={track.coverImage}
                        alt={track.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{track.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  </div>
                <div className="hidden md:block md:col-span-2 text-gray-400">
                  {formatDuration(track.duration)}
                </div>
                <div className="col-span-3 md:col-span-2 text-gray-400 truncate">
                  {track.genre || 'Unknown'}
                </div>
                <div className="col-span-3 md:col-span-2 text-gray-400 text-sm">
                  {formatDate(track.uploadedAt)}
                </div>
                <div className="hidden md:flex md:col-span-1 justify-center">
                  <button
                    onClick={() => handlePlay(track._id, track.cloudinaryUrl)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    aria-label={currentlyPlaying === track._id ? "Pause" : "Play"}
                  >
                    {currentlyPlaying === track._id ? (
                      <PauseCircle className="h-6 w-6" />
                    ) : (
                      <PlayCircle className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Play Controls */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (audioElement) {
                    audioElement.pause();
                  }
                  setCurrentlyPlaying(null);
                }}
                className="text-purple-400"
              >
                <PauseCircle className="h-8 w-8" />
              </button>
              <div>
                <p className="text-white font-medium">
                  {tracks.find(t => t._id === currentlyPlaying)?.title}
                </p>
                <p className="text-gray-400 text-sm">
                  {tracks.find(t => t._id === currentlyPlaying)?.artist}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

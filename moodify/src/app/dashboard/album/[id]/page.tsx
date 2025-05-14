// hackathon_may_stackup\moodify\src\app\dashboard\album\[id]\page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Music,
  Calendar,
  User,
  Disc,
  Volume2,
  BookmarkPlus,
  Check,
  BookmarkMinus,
} from "lucide-react";
import {
  fetchAlbumById,
  fetchTracksByAlbumId,
  AudioDBAlbum,
  AudioDBTrack,
  formatDuration,
} from "@/lib/audiodb-api";
import { searchTracks, getStreamUrl } from "@/lib/audius-api";
import { toast } from "react-hot-toast";

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  const [album, setAlbum] = useState<AudioDBAlbum | null>(null);
  const [tracks, setTracks] = useState<AudioDBTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isSearchingAudio, setIsSearchingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaving, setIsUnsaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAlbumAndTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const albumData = await fetchAlbumById(albumId);
        if (!albumData) {
          throw new Error("Album not found");
        }
        setAlbum(albumData);
        const tracksData = await fetchTracksByAlbumId(albumId);
        setTracks(tracksData);
      } catch (err) {
        console.error("Error loading album:", err);
        setError("Failed to load album details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAlbumAndTracks();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [albumId]);

  useEffect(() => {
    const checkIfAlbumIsSaved = async () => {
      if (!album) return;

      try {
        const response = await fetch(`/api/albums/check?albumId=${albumId}`);
        const data = await response.json();

        if (response.ok) {
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error('Error checking if album is saved:', error);
      }
    };

    checkIfAlbumIsSaved();
  }, [album, albumId]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", handleTrackEnd);
      audioRef.current.addEventListener("error", () => {
        setAudioError("Could not play this track. Try another one.");
        setIsPlaying(false);
      });
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleTrackEnd);
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = audioSrc;
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
          setAudioError("Could not play this track. Try another one.");
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioSrc, isPlaying]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newPosition = (offsetX / rect.width) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newPosition;
      setCurrentTime(newPosition);
    }
  };

  const handleTrackEnd = () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      playTrack(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const findAudioForTrack = async (track: AudioDBTrack) => {
    setIsSearchingAudio(true);
    setAudioError(null);
    try {
      const searchQuery = `${track.strTrack} ${track.strArtist}`;
      const results = await searchTracks(searchQuery);
      if (results.length > 0) {
        const streamUrl = getStreamUrl(results[0].id);
        setAudioSrc(streamUrl);
        return true;
      } else {
        setAudioError("No audio found for this track");
        return false;
      }
    } catch (err) {
      console.error("Error finding audio:", err);
      setAudioError("Error finding audio for this track");
      return false;
    } finally {
      setIsSearchingAudio(false);
    }
  };

  const playTrack = async (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    const success = await findAudioForTrack(tracks[index]);
    if (!success) {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (currentTrackIndex === null && tracks.length > 0) {
      playTrack(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    }
  };

  const saveAlbum = async () => {
    if (!album) return;

    try {
      setIsSaving(true);

      const response = await fetch('/api/albums/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: album.idAlbum,
          title: album.strAlbum,
          artist: album.strArtist,
          coverImage: album.strAlbumThumb || '',
          year: album.intYearReleased,
          genre: album.strGenre,
          trackCount: tracks.length,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSaved(true);
        toast.success('Album saved to your library');
      } else {
        if (response.status === 409) {
          setIsSaved(true);
          toast.success('Album already in your library');
        } else if (response.status === 401) {
          toast.error('Please login to save albums');
          router.push('/login');
        } else {
          toast.error(data.message || 'Failed to save album');
        }
      }
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const unsaveAlbum = async () => {
    if (!album) return;

    try {
      setIsUnsaving(true);

      const response = await fetch('/api/albums/unsave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: album.idAlbum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSaved(false);
        toast.success('Album removed from your library');
      } else if (response.status === 401) {
        toast.error('Please login to manage your library');
        router.push('/login');
      } else {
        toast.error(data.message || 'Failed to remove album');
      }
    } catch (error) {
      console.error('Error unsaving album:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsUnsaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded-lg">
        {error || "Failed to load album details"}
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              {album.strAlbumThumb ? (
                <Image
                  src={album.strAlbumThumb}
                  alt={album.strAlbum}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Disc size={64} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {album.strAlbum}
                </h1>
                <div className="flex items-center text-gray-400 mb-4">
                  {album.strArtist && (
                    <div className="flex items-center mr-4">
                      <User size={16} className="mr-1" />
                      <span>{album.strArtist}</span>
                    </div>
                  )}
                  {album.intYearReleased && (
                    <div className="flex items-center mr-4">
                      <Calendar size={16} className="mr-1" />
                      <span>{album.intYearReleased}</span>
                    </div>
                  )}
                  {tracks.length > 0 && (
                    <div className="flex items-center mr-4">
                      <Music size={16} className="mr-1" />
                      <span>{tracks.length} tracks</span>
                    </div>
                  )}
                </div>
                {album.strGenre && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-purple-900/40 text-purple-200 text-xs px-2 py-1 rounded-full">
                      {album.strGenre}
                    </span>
                    {album.strStyle && album.strStyle !== album.strGenre && (
                      <span className="bg-purple-900/40 text-purple-200 text-xs px-2 py-1 rounded-full">
                        {album.strStyle}
                      </span>
                    )}
                  </div>
                )}
                {album.strDescriptionEN && (
                  <div className="text-gray-400 text-sm mb-4 line-clamp-4">
                    {album.strDescriptionEN}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => tracks.length > 0 && playTrack(0)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center"
                  disabled={tracks.length === 0 || isSearchingAudio}
                >
                  {isSearchingAudio ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play size={20} fill="white" className="mr-2" />
                  )}
                  Play Album
                </button>

                <button
                  onClick={isSaved ? unsaveAlbum : saveAlbum}
                  disabled={isSaving || isUnsaving}
                  className={`font-medium py-2 px-6 rounded-full flex items-center justify-center ${
                    isSaved
                      ? "bg-green-600/20 text-green-300 border border-green-600/30 hover:bg-red-600/20 hover:text-red-300 hover:border-red-600/30"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {isSaving || isUnsaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : isSaved ? (
                    <>
                      <BookmarkMinus size={20} className="mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={20} className="mr-2" />
                      Save Album
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentTrackIndex !== null && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
          <div className="container mx-auto">
            <div
              ref={progressBarRef}
              className="w-full h-1 bg-gray-700 rounded-full mb-3 cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{
                  width: `${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 relative mr-4 flex-shrink-0">
                {album.strAlbumThumb ? (
                  <Image
                    src={album.strAlbumThumb}
                    alt={album.strAlbum}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded">
                    <Music size={24} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 mr-4">
                <div className="text-white font-medium truncate">
                  {tracks[currentTrackIndex]?.strTrack || "Unknown Track"}
                </div>
                <div className="text-gray-400 text-sm truncate">
                  {tracks[currentTrackIndex]?.strArtist ||
                    album.strArtist ||
                    "Unknown Artist"}
                </div>
                {audioError && (
                  <div className="text-red-400 text-xs mt-1">{audioError}</div>
                )}
              </div>
              <div className="text-gray-400 text-sm mr-4 hidden md:block">
                {formatDuration(Math.floor(currentTime * 1000))} /{" "}
                {formatDuration(Math.floor(duration * 1000))}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={playPrevious}
                  disabled={currentTrackIndex === 0 || isSearchingAudio}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={togglePlayPause}
                  disabled={isSearchingAudio}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 flex items-center justify-center"
                >
                  {isSearchingAudio ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : isPlaying ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} fill="currentColor" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  disabled={
                    currentTrackIndex === tracks.length - 1 || isSearchingAudio
                  }
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <SkipForward size={24} />
                </button>
                <div className="text-gray-400 ml-4 flex items-center">
                  <Volume2 size={20} className="mr-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900/50 rounded-xl p-6 mb-24">
        <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
        {tracks.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {tracks.map((track, index) => (
              <div
                key={track.idTrack}
                className={`py-3 px-2 flex items-center hover:bg-gray-800/50 rounded cursor-pointer ${
                  currentTrackIndex === index ? "bg-purple-900/20" : ""
                }`}
                onClick={() => playTrack(index)}
              >
                <div className="w-8 text-center text-gray-500 mr-4">
                  {currentTrackIndex === index ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                      }}
                      disabled={isSearchingAudio}
                    >
                      {isSearchingAudio ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
                      ) : isPlaying ? (
                        <Pause size={18} className="text-purple-400" />
                      ) : (
                        <Play
                          size={18}
                          fill="currentColor"
                          className="text-purple-400"
                        />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                  )}
                </div>
                <div className="w-8 text-center text-gray-500 mr-4">
                  {track.intTrackNumber || index + 1}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      currentTrackIndex === index
                        ? "text-purple-400"
                        : "text-white"
                    }`}
                  >
                    {track.strTrack}
                  </div>
                  {track.strArtist && (
                    <div className="text-sm text-gray-400">
                      {track.strArtist}
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-sm">
                  {track.intDuration
                    ? formatDuration(parseInt(track.intDuration))
                    : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No tracks available for this album
          </div>
        )}
      </div>
    </div>
  );
}

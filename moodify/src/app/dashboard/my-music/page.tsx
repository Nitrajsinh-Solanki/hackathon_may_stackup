// hackathon_may_stackup\moodify\src\app\dashboard\my-music\page.tsx

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Music,
  Loader2,
  PlayCircle,
  PauseCircle,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Trash2,
  ListPlus,
  Heart,
} from "lucide-react";
import AudioVisualizer from "@/app/components/AudioVisualizer";
import LikeButton from "@/app/components/LikeButton";
import MyMusicPlaylistSelector from "@/app/components/MyMusicPlaylistSelector";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [playlistSelectorOpen, setPlaylistSelectorOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<UploadedTrack | null>(
    null
  );

  const handleDelete = async (trackId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(trackId);
        const response = await fetch(`/api/my-music/${trackId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete track");
        }
        setTracks(tracks.filter((track) => track._id !== trackId));
        if (currentlyPlaying === trackId) {
          setCurrentlyPlaying(null);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
        }
      } catch (err) {
        console.error("Error deleting track:", err);
        setError(err instanceof Error ? err.message : "Failed to delete track");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const openPlaylistSelector = (track: UploadedTrack) => {
    setSelectedTrack(track);
    setPlaylistSelectorOpen(true);
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/my-music");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch tracks");
        }
        const data = await response.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load your music"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
    // initializng the  audio element
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    });
    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });
    audio.addEventListener("pause", () => {
      setIsPlaying(false);
    });

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.removeEventListener("timeupdate", () => {});
        audio.removeEventListener("loadedmetadata", () => {});
        audio.removeEventListener("ended", () => {});
        audio.removeEventListener("play", () => {});
        audio.removeEventListener("pause", () => {});
      }
    };
  }, [router]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlay = (trackId: string, url: string) => {
    if (!audioRef.current) return;

    setError(null);

    if (currentlyPlaying === trackId) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
          setError(
            "Failed to play audio. Please check if the file format is supported."
          );
        });
      }
    } else {
      console.log("Attempting to play track from URL:", url);

      const handleAudioError = () => {
        console.error("Audio error event triggered:", audioRef.current?.error);
        setError(
          "Failed to load audio. The file may be missing or in an unsupported format."
        );
      };

      audioRef.current.addEventListener("error", handleAudioError);

      audioRef.current.src = url;
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = isMuted ? 0 : volume;

      audioRef.current.load();

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              console.log("Audio playing successfully");
            })
            .catch((err) => {
              console.error("Error playing audio after load:", err);
              setError(
                "Failed to play audio. Please try another track or check your connection."
              );
            });
        }
      }, 300);

      setCurrentlyPlaying(trackId);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const goToUpload = () => {
    router.push("/dashboard/upload", { scroll: false });
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

  const currentTrack = tracks.find((t) => t._id === currentlyPlaying);

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
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No tracks yet
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your first track to get started
          </p>
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
            <div className="col-span-5 md:col-span-5">Track</div>
            <div className="col-span-2 md:col-span-2">Duration</div>
            <div className="col-span-2 md:col-span-2">Genre</div>
            <div className="col-span-3 md:col-span-3 text-center">Actions</div>
          </div>
          <div className="divide-y divide-gray-700">
            {tracks.map((track) => (
              <div
                key={track._id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700/50 transition-colors items-center"
              >
                <div className="col-span-5 md:col-span-5 flex items-center space-x-3">
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
                    <h3 className="text-white font-medium truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2 text-gray-400">
                  {formatDuration(track.duration)}
                </div>
                <div className="col-span-2 md:col-span-2 text-gray-400 truncate">
                  {track.genre || "Unknown"}
                </div>
                <div className="col-span-3 md:col-span-3 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handlePlay(track._id, track.cloudinaryUrl)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    aria-label={
                      currentlyPlaying === track._id && isPlaying
                        ? "Pause"
                        : "Play"
                    }
                  >
                    {currentlyPlaying === track._id && isPlaying ? (
                      <PauseCircle className="h-8 w-8" />
                    ) : (
                      <PlayCircle className="h-8 w-8" />
                    )}
                  </button>

                  <LikeButton
                    trackId={track._id}
                    title={track.title}
                    artist={track.artist || "Unknown Artist"}
                    artwork={track.coverImage || "/placeholder-album.png"}
                    duration={track.duration}
                    genre={track.genre}
                    mood={track.mood}
                    cloudinaryUrl={track.cloudinaryUrl}
                    iconSize={30}
                  />

                  <button
                    onClick={() => openPlaylistSelector(track)}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                    aria-label="Add to playlist"
                  >
                    <ListPlus className="h-8 w-8" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(track._id);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Delete track"
                    disabled={isDeleting === track._id}
                  >
                    {isDeleting === track._id ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Trash2 className="h-8 w-8" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* audio player with visualizer is implemented here  */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 z-50">
          <div className="max-w-7xl mx-auto">
            {/* visualizer is implemented here  */}
            <div className="mb-4">
              <AudioVisualizer audioRef={audioRef} />
            </div>
            <div className="flex items-center justify-between">
              {/* track  Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  {currentTrack?.coverImage ? (
                    <img
                      src={currentTrack.coverImage}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Music className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-medium truncate max-w-[200px]">
                    {currentTrack?.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate max-w-[200px]">
                    {currentTrack?.artist}
                  </p>
                </div>
              </div>
              {/* player Controls */}
              <div className="flex flex-col items-center space-y-2 flex-1 max-w-xl mx-4">
                <div className="flex items-center space-x-4">
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                      }
                    }}
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                        } else {
                          audioRef.current
                            .play()
                            .catch((err) =>
                              console.error("Error playing audio:", err)
                            );
                        }
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
                  >
                    {isPlaying ? (
                      <PauseCircle size={20} />
                    ) : (
                      <PlayCircle size={20} />
                    )}
                  </button>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => {}}
                  >
                    <SkipBack size={20} className="rotate-180" />
                  </button>
                </div>
                <div className="w-full flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-10">
                    {formatDuration(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xs text-gray-400 w-10">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <button
                  onClick={() => {
                    setCurrentlyPlaying(null);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.src = "";
                    }
                  }}
                  className="ml-4 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current
                        .play()
                        .catch((err) =>
                          console.error("Error playing audio:", err)
                        );
                    }
                  }
                }}
                className="text-purple-400"
              >
                {isPlaying ? (
                  <PauseCircle className="h-8 w-8" />
                ) : (
                  <PlayCircle className="h-8 w-8" />
                )}
              </button>
              <div>
                <p className="text-white font-medium">{currentTrack?.title}</p>
                <p className="text-gray-400 text-sm">{currentTrack?.artist}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* adding like button here */}
              {currentTrack && (
                <LikeButton
                  trackId={currentTrack._id}
                  title={currentTrack.title}
                  artist={currentTrack.artist || "Unknown Artist"}
                  artwork={currentTrack.coverImage || "/placeholder-album.png"}
                  duration={currentTrack.duration}
                  genre={currentTrack.genre}
                  mood={currentTrack.mood}
                  cloudinaryUrl={currentTrack.cloudinaryUrl}
                />
              )}
              <button
                onClick={() => {
                  setCurrentlyPlaying(null);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                  }
                }}
                className="text-gray-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* playlist selector modal is implemented here  */}
      {selectedTrack && (
        <MyMusicPlaylistSelector
          isOpen={playlistSelectorOpen}
          onClose={() => setPlaylistSelectorOpen(false)}
          track={selectedTrack}
        />
      )}
    </div>
  );
}

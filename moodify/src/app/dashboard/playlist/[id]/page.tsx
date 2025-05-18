// hackathon_may_stackup\moodify\src\app\dashboard\playlist\[id]\page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  Music,
  User,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume,
  X,
} from "lucide-react";
import {
  fetchPlaylist,
  DeezerPlaylist,
  DeezerTrack,
  formatDuration,
} from "@/lib/deezer-api";
import { getPlayableTrackSource } from "@/lib/combined-api";
import TrackList from "@/app/components/TrackList";
import SavePlaylistButton from "@/app/components/SavePlaylistButton";

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params?.id as string;
  const [playlist, setPlaylist] = useState<DeezerPlaylist | null>(null);
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [playableTracks, setPlayableTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isLoadingPlayable, setIsLoadingPlayable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState<number | null>(null);
  // audio player states
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching playlist:", playlistId);
        const playlistData = await fetchPlaylist(playlistId);
        setPlaylist(playlistData);
        const trackData = playlistData.tracks?.data || [];
        setTracks(trackData);
        const displayTracks = trackData.map((track) => ({
          ...track,
          isPotentiallyPlayable: !!track.preview,
          source: track.preview ? "deezer" : null,
        }));
        setPlayableTracks(displayTracks);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading playlist:", err);
        setError("Failed to load playlist details. Please try again later.");
        setIsLoading(false);
      }
    };

    if (playlistId) loadPlaylist();
  }, [playlistId]);

  // audio player setup effect - only runs when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    setAudioError(null);
    console.log("Setting up audio with track:", currentTrack);
    console.log("Stream URL:", currentTrack.streamUrl);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
      setIsAudioLoading(false);
    };
    const handleEnded = () => {
      console.log("Audio playback ended");
      setIsPlaying(false);
      playNextTrack();
    };
    const handleError = () => {
      console.error("Audio error:", audio.error);
      console.error("Audio error code:", audio.error?.code);
      console.error("Audio error message:", audio.error?.message);
      setAudioError(
        "Failed to play this track. The audio may not be available."
      );
      setIsPlaying(false);
      setIsAudioLoading(false);
    };
    const handleCanPlay = () => {
      console.log("Audio can play now");
      setIsAudioLoading(false);
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
            setAudioError("Playback failed. This audio may not be available.");
          });
        }
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    // setting  the audio source
    if (currentTrack.streamUrl) {
      console.log("Setting audio source to:", currentTrack.streamUrl);
      setIsAudioLoading(true);
      audio.pause();
      audio.volume = isMuted ? 0 : volume;
      audio.src = currentTrack.streamUrl;
      audio.load();
    } else {
      console.error("No stream URL available for current track");
      setAudioError("No audio available for this track.");
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
    return () => {
      console.log("Cleaning up audio element");
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentTrack]);

  // handling  play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || isAudioLoading) return;
    if (isPlaying) {
      console.log("Attempting to play audio");
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully");
          })
          .catch((err) => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
            setAudioError("Playback failed. This audio may not be available.");
          });
      }
    } else {
      console.log("Pausing audio");
      audio.pause();
    }
  }, [isPlaying, isAudioLoading, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayAll = async () => {
    if (tracks.length === 0) return;
    // find the first track with a preview (potentially playable)
    const firstPlayableTrack = tracks.find((t) => t.preview);
    if (firstPlayableTrack) {
      handleTrackPlay(firstPlayableTrack.id);
    } else {
      setAudioError("No playable tracks found in this playlist.");
    }
  };

  const handleGoBack = () => {
    router.push("/dashboard/playlist-album");
  };

  const handleTrackPlay = async (trackId: number) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    if (currentTrack && currentTrack.id === trackId) {
      togglePlayPause();
      return;
    }
    setIsLoadingTrack(trackId);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      const playableSource = await getPlayableTrackSource(track);
      if (playableSource) {
        setCurrentTrack(playableSource);
        setIsPlayerVisible(true);
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
        // updating the track in the playableTracks list with its source
        setPlayableTracks((prev) =>
          prev.map((pt) =>
            pt.id === trackId ? { ...pt, source: playableSource.source } : pt
          )
        );
      } else {
        setAudioError(`No playable source found for "${track.title}"`);
      }
    } catch (error) {
      console.error("Error getting playable source:", error);
      setAudioError("Failed to play this track. Please try another.");
    } finally {
      setIsLoadingTrack(null);
    }
  };

  const handleClosePlayer = () => {
    setIsPlayerVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setAudioError(null);
  };

  const togglePlayPause = () => {
    if (!currentTrack || !currentTrack.streamUrl) {
      setAudioError("No audio available for this track.");
      return;
    }
    setIsPlaying((prevState) => !prevState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playNextTrack = () => {
    if (!currentTrack || playableTracks.length === 0) return;
    const playableOnly = playableTracks.filter(
      (pt) => pt.isPotentiallyPlayable
    );
    const currentIndex = playableOnly.findIndex(
      (pt) => pt.id === currentTrack.id
    );
    if (currentIndex === -1 || currentIndex === playableOnly.length - 1) return;
    handleTrackPlay(playableOnly[currentIndex + 1].id);
  };

  const playPreviousTrack = () => {
    if (!currentTrack || playableTracks.length === 0) return;
    const playableOnly = playableTracks.filter(
      (pt) => pt.isPotentiallyPlayable
    );
    const currentIndex = playableOnly.findIndex(
      (pt) => pt.id === currentTrack.id
    );
    if (currentIndex <= 0) return;
    handleTrackPlay(playableOnly[currentIndex - 1].id);
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
          Playlist not found
        </h2>
        <p className="text-gray-400">
          The playlist you're looking for doesn't exist or is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <button
      onClick={handleGoBack}
      className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6"/>
      </svg>
      Go Back to Playlists
    </button>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <div className="relative w-64 h-64 shadow-lg rounded-lg overflow-hidden">
            {playlist.picture_big ? (
              <Image
                src={playlist.picture_big}
                alt={playlist.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Music size={64} className="text-gray-600" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-gray-400 mb-4">{playlist.description}</p>
              )}
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <User size={16} />
                <span>{playlist.creator?.name || "Unknown Artist"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Music size={16} />
                <span>{playlist.nb_tracks || tracks.length} tracks</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handlePlayAll}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                <Play size={18} />
                Play All
              </button>
              <SavePlaylistButton
                playlistId={playlistId}
                title={playlist.title}
                description={playlist.description}
                coverImage={playlist.picture_big}
                trackCount={playlist.nb_tracks || tracks.length}
                creator={playlist.creator?.name}
              />
            </div>
          </div>
        </div>
      </div>

      <TrackList
        tracks={playableTracks}
        onTrackPlay={handleTrackPlay}
        currentlyPlayingId={currentTrack?.id}
        loadingTrackId={isLoadingTrack}
      />

      {isPlayerVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 relative w-12 h-12 rounded overflow-hidden">
                {currentTrack?.album?.cover_small ? (
                  <Image
                    src={currentTrack.album.cover_small}
                    alt={currentTrack.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Music size={16} className="text-gray-600" />
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <h4 className="text-white font-medium truncate">
                      {currentTrack?.title}
                    </h4>
                    <p className="text-gray-400 text-sm truncate">
                      {currentTrack?.artist?.name}
                    </p>
                  </div>
                  <button
                    onClick={handleClosePlayer}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-2">
                  {audioError ? (
                    <div className="text-red-500 text-sm mb-2">
                      {audioError}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-10">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-grow h-1 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                      <span className="text-xs text-gray-400 w-10">
                        {formatTime(duration)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={playPreviousTrack}
                  className="text-gray-400 hover:text-white"
                  disabled={isAudioLoading}
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={togglePlayPause}
                  disabled={isAudioLoading || !!audioError}
                  className={`p-2 rounded-full ${
                    isAudioLoading
                      ? "bg-gray-700 text-gray-500"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isAudioLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} />
                  )}
                </button>
                <button
                  onClick={playNextTrack}
                  className="text-gray-400 hover:text-white"
                  disabled={isAudioLoading}
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <Volume size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}

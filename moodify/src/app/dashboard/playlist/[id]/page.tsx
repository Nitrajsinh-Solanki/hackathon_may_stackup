// hackathon_may_stackup\moodify\src\app\dashboard\playlist\[id]\page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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

export default function PlaylistDetailPage() {
  const params = useParams();
  const playlistId = params?.id as string;
  const [playlist, setPlaylist] = useState<DeezerPlaylist | null>(null);
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [playableTracks, setPlayableTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (error || !playlist) {
    return (
      <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded-lg">
        {error || "Failed to load playlist"}
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-24">
      {/* hidden audio element */}
      <audio ref={audioRef} className="hidden" preload="metadata" />

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0 w-full md:w-64">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            {playlist.picture_big ? (
              <Image
                src={playlist.picture_big}
                alt={playlist.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Music size={64} className="text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* playlist Info */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-white mb-2">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-gray-400 mb-4">{playlist.description}</p>
          )}
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center">
              <User size={16} className="mr-1" />
              <span>By {playlist.creator?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center">
              <Music size={16} className="mr-1" />
              <span>{playlist.nb_tracks} tracks</span>
            </div>
            {playlist.duration > 0 && (
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{formatDuration(playlist.duration)}</span>
              </div>
            )}
            {playlist.fans > 0 && (
              <div className="flex items-center">
                <span>{playlist.fans.toLocaleString()} fans</span>
              </div>
            )}
          </div>
          <button
            onClick={handlePlayAll}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full flex items-center"
            disabled={!playableTracks.some((pt) => pt.isPotentiallyPlayable)}
          >
            <Play size={18} fill="white" className="mr-2" />
            Play All
          </button>

          {/* playble tracks stats */}
          <div className="mt-4 text-sm">
            <span className="text-gray-400">
              {playableTracks.filter((pt) => pt.isPotentiallyPlayable).length}{" "}
              of {tracks.length} tracks playable
            </span>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                🎧 Jamendo:{" "}
                {playableTracks.filter((pt) => pt.source === "jamendo").length}
              </span>
              <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs">
                🎵 Deezer:{" "}
                {playableTracks.filter((pt) => pt.source === "deezer").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* tracks */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
        {tracks.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            This playlist has no tracks.
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            playableTracks={playableTracks}
            onTrackPlay={handleTrackPlay}
            isLoading={isLoadingPlayable}
            loadingTrackId={isLoadingTrack}
            currentlyPlayingId={currentTrack?.id || null} 
          />
        )}
      </div>

      {/* custom Music Player */}
      {isPlayerVisible && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={currentTrack.image || "/placeholder-album.png"}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <h4 className="text-white font-medium truncate max-w-[200px]">
                    {currentTrack.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate max-w-[200px]">
                    {currentTrack.artist}
                  </p>
                  {audioError && (
                    <p className="text-red-400 text-xs mt-1">{audioError}</p>
                  )}
                  {isAudioLoading && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Loading audio...
                    </p>
                  )}
                  {currentTrack.source && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        currentTrack.source === "jamendo"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-purple-900/30 text-purple-400"
                      }`}
                    >
                      {currentTrack.source === "jamendo"
                        ? "🎧 Jamendo"
                        : "🎵 Deezer"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 flex-1 max-w-xl mx-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={playPreviousTrack}
                    className="text-gray-400 hover:text-white"
                    disabled={!currentTrack.streamUrl || isAudioLoading}
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className={`${
                      currentTrack.streamUrl && !isAudioLoading
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-600 cursor-not-allowed"
                    } text-white rounded-full p-2`}
                    disabled={!currentTrack.streamUrl || isAudioLoading}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={playNextTrack}
                    className="text-gray-400 hover:text-white"
                    disabled={!currentTrack.streamUrl || isAudioLoading}
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
                <div className="w-full flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-10">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isAudioLoading}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      backgroundSize: `${
                        (currentTime / (duration || 1)) * 100
                      }% 100%`,
                      backgroundImage: "linear-gradient(#9333ea, #9333ea)",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {formatTime(duration || 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMuted ? <Volume2 size={20} /> : <Volume size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      backgroundSize: `${volume * 100}% 100%`,
                      backgroundImage: "linear-gradient(#9333ea, #9333ea)",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
                <button
                  onClick={handleClosePlayer}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// hackathon_may_stackup\moodify\src\app\components\EnvironmentalRecommendations.tsx


"use client";
import { useState, useEffect, useRef } from "react";
import { getWeatherData, WeatherData } from "@/lib/weather-api";
import { Music, Cloud, Loader2 } from "lucide-react";
import CloudinaryMusicPlayer from "./CloudinaryMusicPlayer";

interface Song {
  title: string;
  artist: string;
  jamendoId?: string;
  imageUrl?: string;
  audioUrl?: string;
  found?: boolean;
}

interface CloudinaryTrack {
  _id: string;
  title: string;
  artist?: string;
  cloudinaryUrl: string;
  coverImage?: string;
  duration: number;
  genre?: string;
  mood?: string;
}

export default function EnvironmentalRecommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const playerRef = useRef<any>(null);

  // getting user's location and weather data
  useEffect(() => {
    async function getLocationAndWeather() {
      try {
        setLoading(true);
        // trying to get location using browser geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const weather = await getWeatherData(latitude, longitude);
              setWeatherData(weather);
              determineTimeOfDay();
              setLoading(false);
            },
            async (error) => {
              console.error("Geolocation error:", error);
              // fallback (in case browser don't support or access geolocation api ) to IP-based geolocation
              try {
                const response = await fetch("/api/geolocation");
                if (!response.ok) throw new Error("Failed to get IP location");
                const data = await response.json();
                const weather = await getWeatherData(
                  data.latitude,
                  data.longitude
                );
                setWeatherData(weather);
                determineTimeOfDay();
                setLoading(false);
              } catch (fallbackError) {
                setError(
                  "Could not determine your location. Please try again later."
                );
                setLoading(false);
              }
            }
          );
        } else {
          try {
            const response = await fetch("/api/geolocation");
            if (!response.ok) throw new Error("Failed to get IP location");
            const data = await response.json();
            const weather = await getWeatherData(data.latitude, data.longitude);
            setWeatherData(weather);
            determineTimeOfDay();
            setLoading(false);
          } catch (fallbackError) {
            setError(
              "Could not determine your location. Please try again later."
            );
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error getting location and weather:", err);
        setError("Failed to load environmental data. Please try again later.");
        setLoading(false);
      }
    }

    function determineTimeOfDay() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay("morning");
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay("afternoon");
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay("evening");
      } else {
        setTimeOfDay("night");
      }
    }

    getLocationAndWeather();
  }, []);
    
  // getting music recommendations when weather data is available
  useEffect(() => {
    async function getRecommendations() {
      if (!weatherData || !timeOfDay) return;
      try {
        setLoadingRecommendations(true);
        // getting recommendations from Gemini API
        const response = await fetch("/api/recommendations/environmental", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: weatherData.location,
            temperature: weatherData.temperature,
            weatherCondition: weatherData.condition,
            timeOfDay: timeOfDay,
          }),
        });
              
        if (!response.ok) {
          throw new Error("Failed to get recommendations");
        }
              
        const data = await response.json();
        const geminiRecommendations = data.recommendations;
              
        // using the batch-search endpoint to get all songs at once
        const jamendoResponse = await fetch("/api/jamendo/batch-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recommendations: geminiRecommendations,
          }),
        });
              
        if (!jamendoResponse.ok) {
          throw new Error("Failed to search Jamendo");
        }
              
        const jamendoData = await jamendoResponse.json();
              
        // filter out songs that weren't found on Jamendo api 
        const validResults = jamendoData.results.filter((song: { found: boolean }) => song.found);
        setRecommendations(validResults);
        setLoadingRecommendations(false);
      } catch (err) {
        console.error("Error getting recommendations:", err);
        setError(
          "Failed to get music recommendations. Please try again later."
        );
        setLoadingRecommendations(false);
      }
    }
      
    getRecommendations();
  }, [weatherData, timeOfDay]);

  const handlePlaySong = (index: number) => {
    setCurrentTrackIndex(index);
    setUserInteracted(true);
  };

  const handleClosePlayer = () => {
    setCurrentTrackIndex(null);
  };

  const handlePreviousSong = () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleNextSong = () => {
    if (currentTrackIndex !== null && currentTrackIndex < recommendations.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  // converting  Jamendo track to CloudinaryTrack format
  const convertToCloudinaryTrack = (song: Song): CloudinaryTrack => {
    return {
      _id: song.jamendoId || `jamendo-${Math.random().toString(36).substr(2, 9)}`,
      title: song.title,
      artist: song.artist,
      cloudinaryUrl: song.audioUrl || "",
      coverImage: song.imageUrl,
      duration: 0,
      genre: "",
      mood: "",
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400">Detecting your location and weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
        <h3 className="text-red-400 font-medium mb-2">Error</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
      {weatherData && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center">
          <div className="mb-2 sm:mb-0 sm:mr-4">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
              alt={weatherData.condition}
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              {weatherData.location}
            </h3>
            <p className="text-sm sm:text-base text-gray-300">
              {weatherData.temperature}°C, {weatherData.condition} •{" "}
              {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
            </p>
          </div>
        </div>
      )}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
          <Cloud className="mr-2 h-5 w-5 text-purple-400" />
          Music for your current environment
        </h3>
        {loadingRecommendations ? (
          <div className="flex flex-col items-center justify-center p-4 sm:p-8">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-purple-500 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-400 text-center">
              Finding the perfect songs for your mood...
            </p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recommendations.map((song, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-800 transition-all cursor-pointer"
                onClick={() => handlePlaySong(index)}
              >
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  {song.imageUrl ? (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
                      <Music className="h-8 w-8 sm:h-12 sm:w-12 text-purple-300/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="bg-purple-600 rounded-full p-2 sm:p-3 transform hover:scale-110 transition-transform">
                      <Music className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h4 className="font-medium text-white text-sm sm:text-base truncate">
                    {song.title}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {song.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-gray-400">
              No matching songs found for your current environment. Please try
              again later.
            </p>
          </div>
        )}
      </div>
      {currentTrackIndex !== null && recommendations[currentTrackIndex] && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <CloudinaryMusicPlayer
            ref={playerRef}
            track={convertToCloudinaryTrack(recommendations[currentTrackIndex])}
            onClose={handleClosePlayer}
            autoPlay={true}
            onPrevious={handlePreviousSong}
            onNext={handleNextSong}
            hasPrevious={currentTrackIndex > 0}
            hasNext={currentTrackIndex < recommendations.length - 1}
            userInteracted={userInteracted}
          />
        </div>
      )}
    </div>
  );
  
}

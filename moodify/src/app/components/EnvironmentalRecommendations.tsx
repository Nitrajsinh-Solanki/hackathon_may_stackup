// hackathon_may_stackup\moodify\src\app\components\EnvironmentalRecommendations.tsx



"use client";

import { useState, useEffect } from "react";
import { getWeatherData, WeatherData } from "@/lib/weather-api";
import { Music, Cloud, Loader2 } from "lucide-react";

interface Song {
  title: string;
  artist: string;
  jamendoId?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export default function EnvironmentalRecommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

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
        
        // using  the batch-search endpoint to get all songs at once
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
        const validResults = jamendoData.results.filter((song: { found: any; }) => song.found);
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
    <div className="space-y-6">
      {weatherData && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 flex items-center">
          <div className="mr-4">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
              alt={weatherData.condition}
              className="w-16 h-16"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {weatherData.location}
            </h3>
            <p className="text-gray-300">
              {weatherData.temperature}°C, {weatherData.condition} •{" "}
              {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Cloud className="mr-2 h-5 w-5 text-purple-400" />
          Music for your current environment
        </h3>

        {loadingRecommendations ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">
              Finding the perfect songs for your mood...
            </p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((song, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-800 transition-all"
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
                      <Music className="h-12 w-12 text-purple-300/50" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-white truncate">
                    {song.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                  </p>
                  {song.audioUrl && (
                    <div className="mt-3">
                      <audio
                        src={song.audioUrl}
                        controls
                        className="w-full h-8"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              No matching songs found for your current environment. Please try
              again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

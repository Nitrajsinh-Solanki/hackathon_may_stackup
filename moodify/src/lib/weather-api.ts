// hackathon_may_stackup\moodify\src\lib\weather-api.ts



export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    icon: string;
  }
  
  export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error("OpenWeather API key is not defined");
      }
  
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
  
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        location: data.name + ", " + data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }
  
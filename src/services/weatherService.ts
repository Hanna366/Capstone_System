import { notificationService } from './notificationService';

interface WeatherData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  location: string;
  description: string;
}

class WeatherService {
  private static instance: WeatherService;
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5/weather';

  private constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Weather API key not found. Using mock data.');
    }
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async getCurrentWeather(city: string = 'Manila,PH'): Promise<WeatherData | null> {
    if (!this.apiKey) {
      // Fallback to mock data if API key is not available
      return this.getMockWeatherData();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );

      if (response.status === 401) {
        console.warn('Weather API key is invalid or unauthorized. Falling back to mock data.');
        return this.getMockWeatherData();
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Convert OpenWeatherMap data to our format
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        uvIndex: this.estimateUVIndex(data.main.temp, data.weather[0].main), // Estimate UV index
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        location: data.name,
        description: data.weather[0].description
      };

      // Send notification about weather update
      notificationService.notify(
        'system_status',
        'Weather Data Updated',
        `Current weather in ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity`,
        'info',
        { weatherData }
      );

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Send notification about the error
      notificationService.notify(
        'system_status',
        'Weather Data Fetch Failed',
        'Could not retrieve current weather data. Using simulated values.',
        'warning'
      );

      // Return mock data as fallback
      return this.getMockWeatherData();
    }
  }

  // Estimate UV index based on temperature and weather conditions
  private estimateUVIndex(temperature: number, weatherMain: string): number {
    // Simplified estimation - in reality, UV index depends on ozone, sun angle, etc.
    let uvEstimate = 0;

    // Higher temperatures generally mean higher UV (during day)
    if (temperature > 30) uvEstimate += 2;
    else if (temperature > 25) uvEstimate += 1;

    // Clear skies mean higher UV
    if (weatherMain.toLowerCase().includes('clear')) uvEstimate += 3;
    else if (weatherMain.toLowerCase().includes('clouds')) uvEstimate += 1;

    // Cap at reasonable values
    return Math.min(11, Math.max(0, Math.round(uvEstimate)));
  }

  // Mock data function for fallback
  private getMockWeatherData(): WeatherData {
    return {
      temperature: Math.round(20 + Math.random() * 15), // 20-35°C
      humidity: Math.round(30 + Math.random() * 50),    // 30-80%
      uvIndex: Math.round(Math.random() * 8) + 2,       // 2-10
      windSpeed: Math.round(Math.random() * 25),        // 0-25 km/h
      location: 'Simulated Data',
      description: 'Simulated weather conditions'
    };
  }

  // Method to convert imperial units to metric if needed
  public convertImperialToMetric(imperialValue: number, conversionType: 'temperature' | 'windSpeed'): number {
    switch(conversionType) {
      case 'temperature':
        return Math.round((imperialValue - 32) * 5/9); // Fahrenheit to Celsius
      case 'windSpeed':
        return Math.round(imperialValue * 1.60934); // mph to km/h
      default:
        return imperialValue;
    }
  }
}

export const weatherService = WeatherService.getInstance();
export type { WeatherData };
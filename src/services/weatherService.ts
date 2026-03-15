import { notificationService } from './notificationService';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  description: string;
  rainProbability?: number; // Added optional rainProbability property
  location?: string; // Added optional location property
  rainIntensity?: number; // Added optional rainIntensity property
}

class WeatherService {
  private static instance: WeatherService;
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5/weather';

  private constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Weather API key not found or invalid. Please get a free API key from https://openweathermap.org/api and add it to your .env file as VITE_WEATHER_API_KEY=your_key_here');
    }
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async testApiKey(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'YOUR_WORKING_API_KEY_HERE') {
      console.error('❌ No valid API key found');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}?q=London&appid=${this.apiKey}&units=metric`);
      if (response.status === 401) {
        console.error('❌ API key is invalid or not activated');
        return false;
      }
      if (response.ok) {
        console.log('✅ API key is working correctly');
        return true;
      }
      console.error('❌ API test failed:', response.status, response.statusText);
      return false;
    } catch (error) {
      console.error('❌ API test error:', error);
      return false;
    }
  }

  public async getWeatherData(city: string = 'Malaybalay City, PH'): Promise<WeatherData | null> {
    try {
      // First, attempt to fetch sensor data
      const sensorData = await this.fetchSensorData();
      if (sensorData) {
        console.log('✅ Using sensor data:', sensorData);
        return sensorData;
      }

      // If sensor data is unavailable, fallback to weather forecast
      console.warn('⚠️ Sensor data unavailable. Falling back to weather forecast.');
      const forecastData = await this.getCurrentWeather(city);
      if (forecastData) {
        console.log('✅ Using weather forecast data:', forecastData);
        return forecastData;
      }

      console.error('❌ Both sensor data and weather forecast data are unavailable.');
      return null;
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      return null;
    }
  }

  public async getCurrentWeather(city: string = 'Malaybalay City, PH'): Promise<WeatherData | null> {
    console.log('🌤 Fetching weather data for:', city);
    console.log('🔑 API Key available:', !!this.apiKey);
    
    if (!this.apiKey) {
      console.warn('⚠️ Weather API key not found. Using mock data.');
      return this.getMockWeatherData();
    }

    try {
      // Enhanced API request with more parameters for accuracy
      const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lat=8.4833&lon=124.6409`;
      console.log('🌐 Fetching from URL:', url.replace(this.apiKey, '[API_KEY_HIDDEN]'));
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        console.warn('❌ Weather API key is invalid or unauthorized. Falling back to mock data.');
        return this.getMockWeatherData();
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Full API Response:', data);

      // Enhanced weather data processing for better accuracy
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp * 10) / 10, // More precise temperature
        humidity: Math.round(data.main.humidity),
        windSpeed: Math.round(data.wind.speed * 3.6 * 10) / 10, // More precise wind speed
        uvIndex: this.estimateUVIndex(data.main.temp, data.weather[0].main, data.clouds?.all || 0),
        location: data.name || 'Malaybalay City',
        description: data.weather[0].description
      };

      console.log('✅ Processed weather data:', weatherData);

      // Enhanced notification with more details
      notificationService.notify(
        'system_status',
        'Weather Data Updated',
        `Live weather in ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity, ${weatherData.windSpeed} km/h wind`,
        'info',
        { 
          weatherData,
          timestamp: new Date().toISOString(),
          source: 'OpenWeatherMap API'
        }
      );

      return weatherData;
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      
      // Enhanced error notification
      notificationService.notify(
        'system_status',
        'Weather Data Fetch Failed',
        'Could not retrieve current weather data. Using simulated values.',
        'warning',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      );

      // Return mock data as fallback
      return this.getMockWeatherData();
    }
  }

  public async getCurrentWeatherByLocation(lat: number, lon: number): Promise<WeatherData | null> {
    console.log('Fetching weather data for coordinates:', lat, lon);
    
    if (!this.apiKey) {
      console.warn('Weather API key not found. Using mock data.');
      return this.getMockWeatherData();
    }

    try {
      const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      console.log('Fetching from URL:', url.replace(this.apiKey, '[API_KEY_HIDDEN]'));
      
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.warn('Weather API key is invalid or unauthorized. Falling back to mock data.');
        return this.getMockWeatherData();
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Convert OpenWeatherMap data to our format
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp * 10) / 10, // More precise temperature
        humidity: Math.round(data.main.humidity),
        windSpeed: Math.round(data.wind.speed * 3.6 * 10) / 10, // More precise wind speed
        uvIndex: this.estimateUVIndex(data.main.temp, data.weather[0].main, data.clouds?.all || 0),
        location: data.name,
        description: data.weather[0].description
      };

      console.log('Processed weather data:', weatherData);

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
      
      // Send notification about error
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

  public async fetchLiveWeatherData(): Promise<WeatherData | null> {
    try {
      const data = await this.getCurrentWeather();
      return data;
    } catch (error) {
      console.error("Error fetching live weather data:", error);
      return null;
    }
  }

  public async fetchSensorData(): Promise<WeatherData | null> {
    try {
      // Since we removed Blynk, return null for sensor data
      // This will make the system fall back to weather API data
      console.log("Sensor data not available - using weather API fallback");
      return null;
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      return null; // Return null if the sensor is not connected or an error occurs
    }
  }

  // Estimate UV index based on temperature, weather conditions, and time of day
  private estimateUVIndex(temperature: number, weatherMain: string, clouds: number = 0): number {
    // More accurate UV estimation based on multiple factors
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 18;
    const isPeakSun = hour >= 10 && hour <= 15;
    
    let uvEstimate = 0;
    
    // Time-based UV estimation
    if (!isDaytime) {
      uvEstimate = 0; // No UV at night
    } else if (isPeakSun) {
      uvEstimate = 3; // Base UV during peak sun hours
    } else {
      uvEstimate = 1; // Lower UV during early/late day
    }
    
    // Temperature factor
    if (temperature > 35) uvEstimate += 3;
    else if (temperature > 30) uvEstimate += 2;
    else if (temperature > 25) uvEstimate += 1;
    
    // Weather condition factor
    const weatherLower = weatherMain.toLowerCase();
    if (weatherLower.includes('clear')) uvEstimate += 4;
    else if (weatherLower.includes('clouds')) {
      if (weatherLower.includes('few')) uvEstimate += 2;
      else if (weatherLower.includes('scattered')) uvEstimate += 1;
      else uvEstimate += 0; // Overcast clouds
    }
    else if (weatherLower.includes('rain') || weatherLower.includes('thunderstorm')) {
      uvEstimate = 0; // No UV during rain
    }
    else if (weatherLower.includes('mist') || weatherLower.includes('fog')) {
      uvEstimate = Math.max(0, uvEstimate - 1);
    }
    
    // Cap at realistic values (0-11 scale)
    return Math.min(11, Math.max(0, Math.round(uvEstimate)));
  }

  // Mock data function for fallback - more realistic values
  private getMockWeatherData(): WeatherData {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 18;
    
    // Generate more realistic mock data based on time of day
    let baseTemp = 25;
    if (!isDaytime) {
      baseTemp = 22; // Cooler at night
    } else if (hour >= 11 && hour <= 15) {
      baseTemp = 28; // Hotter during peak sun
    }
    
    // Add some randomness
    const temp = baseTemp + Math.round((Math.random() - 0.5) * 6);
    const humidity = 60 + Math.round((Math.random() - 0.5) * 30);
    const windSpeed = 5 + Math.round(Math.random() * 15);
    
    return {
      temperature: Math.max(18, Math.min(35, temp)), // Realistic temp range
      humidity: Math.max(30, Math.min(90, humidity)), // Realistic humidity range
      windSpeed: Math.min(30, windSpeed), // Max 30 km/h
      uvIndex: isDaytime ? Math.round(Math.random() * 8) + 2 : 0, // No UV at night
      location: 'Mock Data (API Unavailable)',
      description: isDaytime ? 'Partly cloudy' : 'Clear night'
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

export const fetchLiveWeatherData = async (): Promise<WeatherData | null> => {
  return WeatherService.getInstance().getCurrentWeather();
};

export const fetchSensorData = async (): Promise<WeatherData | null> => {
  // Since we removed Blynk, return null to use weather API fallback
  console.log("Sensor data not available - using weather API fallback");
  return null;
};
/**
 * Weather Service
 * Handles fetching weather data from Open-Meteo API (free, no API key required)
 */

export interface WeatherData {
  temperature: number; // Current temperature in Fahrenheit
  conditions: string; // Weather condition description
  humidity: number; // Humidity percentage
  windSpeed: number; // Wind speed in mph
  precipitation: number; // Precipitation in inches
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  error?: boolean;
  reason?: string;
}

class WeatherService {
  private static instance: WeatherService;
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  private constructor() {}

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Get weather description from WMO weather code
   * https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
   */
  private getWeatherDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    return weatherCodes[code] || 'Unknown conditions';
  }

  /**
   * Convert Celsius to Fahrenheit
   */
  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  /**
   * Convert km/h to mph
   */
  private kmhToMph(kmh: number): number {
    return kmh * 0.621371;
  }

  /**
   * Convert mm to inches
   */
  private mmToInches(mm: number): number {
    return mm * 0.0393701;
  }

  /**
   * Get current weather for location
   */
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const url = `${this.BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenMeteoResponse = await response.json();

      if (data.error || !data.current) {
        throw new Error(data.reason || 'Failed to fetch weather data');
      }

      return {
        temperature: data.current.temperature_2m,
        conditions: this.getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        precipitation: data.current.precipitation,
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  /**
   * Get weather information as spoken text for alarm
   */
  getWeatherSpeechText(weather: WeatherData): string {
    let speech = `Current weather: ${weather.conditions}. `;
    speech += `Temperature ${Math.round(weather.temperature)} degrees. `;

    if (weather.precipitation > 0) {
      speech += `Precipitation ${weather.precipitation.toFixed(1)} inches. `;
    }

    speech += `Humidity ${weather.humidity} percent. `;
    speech += `Wind speed ${Math.round(weather.windSpeed)} miles per hour.`;

    return speech;
  }
}

export default WeatherService;

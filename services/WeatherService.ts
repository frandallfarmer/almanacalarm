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
  highTemp: number; // Today's high temperature in Fahrenheit
  lowTemp: number; // Today's low temperature in Fahrenheit
  precipitationProbability: number; // Chance of precipitation (0-100%)
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily?: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
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
   * Get current weather and daily forecast for location
   */
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const url = `${this.BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`;

      console.log('[WeatherService] Fetching weather and forecast...');

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenMeteoResponse = await response.json();

      if (data.error || !data.current || !data.daily) {
        throw new Error(data.reason || 'Failed to fetch weather data');
      }

      console.log('[WeatherService] Weather data fetched successfully');

      return {
        temperature: data.current.temperature_2m,
        conditions: this.getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        precipitation: data.current.precipitation,
        highTemp: data.daily.temperature_2m_max[0],
        lowTemp: data.daily.temperature_2m_min[0],
        precipitationProbability: data.daily.precipitation_probability_max[0] || 0,
      };
    } catch (error) {
      console.error('[WeatherService] Error fetching weather:', error);
      throw error;
    }
  }

  /**
   * Get enhanced general weather description
   */
  private getGeneralConditions(code: number, precipProb: number): string {
    // Categorize weather into general descriptions
    if (code >= 95) {
      return 'stormy';
    } else if (code >= 80) {
      return 'rainy with showers';
    } else if (code >= 61 && code <= 65) {
      return 'rainy';
    } else if (code >= 51 && code <= 55) {
      return 'drizzly';
    } else if (code >= 71 && code <= 86) {
      return 'snowy';
    } else if (code === 45 || code === 48) {
      return 'foggy';
    } else if (code === 3) {
      return 'overcast';
    } else if (code === 2) {
      return 'partly cloudy';
    } else if (code === 1) {
      return 'mostly sunny';
    } else if (code === 0) {
      return 'sunny';
    }

    // Fallback based on precipitation probability
    if (precipProb > 70) {
      return 'likely rainy';
    } else if (precipProb > 30) {
      return 'possibly rainy';
    }

    return 'fair';
  }

  /**
   * Get weather information as spoken text for alarm
   */
  getWeatherSpeechText(weather: WeatherData): string {
    const generalConditions = this.getGeneralConditions(
      this.getCodeFromDescription(weather.conditions),
      weather.precipitationProbability
    );

    let speech = `Today's weather will be ${generalConditions}. `;
    speech += `Currently ${weather.conditions.toLowerCase()} with a temperature of ${Math.round(weather.temperature)} degrees. `;
    speech += `Today's high will be ${Math.round(weather.highTemp)} and low ${Math.round(weather.lowTemp)}. `;

    if (weather.precipitationProbability > 30) {
      speech += `${weather.precipitationProbability} percent chance of precipitation. `;
    }

    if (weather.precipitation > 0) {
      speech += `Current precipitation ${weather.precipitation.toFixed(1)} inches. `;
    }

    speech += `Humidity ${weather.humidity} percent. `;
    speech += `Wind speed ${Math.round(weather.windSpeed)} miles per hour.`;

    return speech;
  }

  /**
   * Helper to get weather code from description (for speech generation)
   */
  private getCodeFromDescription(description: string): number {
    const codeMap: { [key: string]: number } = {
      'Clear sky': 0,
      'Mainly clear': 1,
      'Partly cloudy': 2,
      'Overcast': 3,
      'Foggy': 45,
      'Depositing rime fog': 48,
      'Light drizzle': 51,
      'Moderate drizzle': 53,
      'Dense drizzle': 55,
      'Slight rain': 61,
      'Moderate rain': 63,
      'Heavy rain': 65,
      'Slight snow': 71,
      'Moderate snow': 73,
      'Heavy snow': 75,
      'Snow grains': 77,
      'Slight rain showers': 80,
      'Moderate rain showers': 81,
      'Violent rain showers': 82,
      'Slight snow showers': 85,
      'Heavy snow showers': 86,
      'Thunderstorm': 95,
      'Thunderstorm with slight hail': 96,
      'Thunderstorm with heavy hail': 99,
    };
    return codeMap[description] || 0;
  }
}

export default WeatherService;

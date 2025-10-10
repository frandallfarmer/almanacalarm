/**
 * Air Quality Service
 * Handles fetching air quality data from Open-Meteo Air Quality API (free, no API key required)
 */

export interface AirQualityData {
  aqi: number; // Air Quality Index (US EPA standard)
  category: string; // Quality category (Good, Moderate, etc.)
  pm25: number; // PM2.5 particulate matter
  pm10: number; // PM10 particulate matter
}

interface OpenMeteoAirQualityResponse {
  current?: {
    us_aqi: number;
    pm2_5: number;
    pm10: number;
  };
  error?: boolean;
  reason?: string;
}

class AirQualityService {
  private static instance: AirQualityService;
  private readonly BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

  private constructor() {}

  static getInstance(): AirQualityService {
    if (!AirQualityService.instance) {
      AirQualityService.instance = new AirQualityService();
    }
    return AirQualityService.instance;
  }

  /**
   * Get AQI category from index value
   */
  private getAQICategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Get air quality data for location
   */
  async getAirQuality(
    latitude: number,
    longitude: number,
  ): Promise<AirQualityData> {
    try {
      const url = `${this.BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenMeteoAirQualityResponse = await response.json();

      if (data.error || !data.current) {
        throw new Error(data.reason || 'Failed to fetch air quality data');
      }

      const aqi = data.current.us_aqi;

      return {
        aqi: aqi,
        category: this.getAQICategory(aqi),
        pm25: data.current.pm2_5,
        pm10: data.current.pm10,
      };
    } catch (error) {
      console.error('Error fetching air quality:', error);
      throw error;
    }
  }

  /**
   * Get air quality information as spoken text for alarm
   */
  getAirQualitySpeechText(airQuality: AirQualityData): string {
    return `Air quality is ${airQuality.category}, with an index of ${airQuality.aqi}.`;
  }
}

export default AirQualityService;

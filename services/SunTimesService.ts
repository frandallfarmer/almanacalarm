/**
 * Sun Times Service
 * Fetches sunrise and sunset times from Open-Meteo API
 */

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date; // Civil twilight start
  dusk: Date; // Civil twilight end
}

interface OpenMeteoSunResponse {
  daily?: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
  error?: boolean;
  reason?: string;
}

class SunTimesService {
  private static instance: SunTimesService;
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  private constructor() {}

  static getInstance(): SunTimesService {
    if (!SunTimesService.instance) {
      SunTimesService.instance = new SunTimesService();
    }
    return SunTimesService.instance;
  }

  /**
   * Get sun times for location from Open-Meteo API
   * Uses timezone=auto to get times in local timezone with DST handling
   */
  async getSunTimes(latitude: number, longitude: number): Promise<SunTimes> {
    try {
      // Request today's sunrise/sunset with automatic timezone detection
      const url = `${this.BASE_URL}?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=auto&forecast_days=1`;

      console.log('[SunTimesService] Fetching sun times from Open-Meteo API...');

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenMeteoSunResponse = await response.json();

      if (data.error || !data.daily || !data.daily.sunrise || !data.daily.sunset) {
        throw new Error(data.reason || 'Failed to fetch sun times');
      }

      // Parse ISO 8601 timestamps (already in local timezone from API)
      const sunrise = new Date(data.daily.sunrise[0]);
      const sunset = new Date(data.daily.sunset[0]);

      // Calculate approximate civil twilight times (±30 minutes from sunrise/sunset)
      const dawn = new Date(sunrise.getTime() - 30 * 60 * 1000);
      const dusk = new Date(sunset.getTime() + 30 * 60 * 1000);

      console.log('[SunTimesService] Sun times fetched successfully');
      console.log(`  Sunrise: ${sunrise.toLocaleTimeString()}`);
      console.log(`  Sunset: ${sunset.toLocaleTimeString()}`);

      return {
        sunrise,
        sunset,
        dawn,
        dusk,
      };
    } catch (error) {
      console.error('[SunTimesService] Error fetching sun times:', error);

      // Return current time as fallback
      const now = new Date();
      return {
        sunrise: now,
        sunset: now,
        dawn: now,
        dusk: now,
      };
    }
  }

  /**
   * Format time for speech
   */
  private formatTimeForSpeech(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  /**
   * Get sun times as spoken text for alarm
   */
  getSunTimesSpeechText(sunTimes: SunTimes): string {
    return `Sunrise at ${this.formatTimeForSpeech(sunTimes.sunrise)}, sunset at ${this.formatTimeForSpeech(sunTimes.sunset)}.`;
  }
}

export default SunTimesService;

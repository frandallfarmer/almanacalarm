/**
 * Sun Times Service
 * Calculates sunrise and sunset times using astronomical algorithms
 */

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date; // Civil twilight start
  dusk: Date; // Civil twilight end
}

class SunTimesService {
  private static instance: SunTimesService;

  private constructor() {}

  static getInstance(): SunTimesService {
    if (!SunTimesService.instance) {
      SunTimesService.instance = new SunTimesService();
    }
    return SunTimesService.instance;
  }

  /**
   * Calculate Julian date from Date object
   */
  private toJulian(date: Date): number {
    return date.getTime() / 86400000 + 2440587.5;
  }

  /**
   * Calculate sun position for given date and location
   * Uses simplified algorithm from NOAA Solar Calculator
   */
  private calculateSunTimes(
    latitude: number,
    longitude: number,
    date: Date,
    zenith: number,
    isSunrise: boolean,
  ): Date | null {
    const julianDay = this.toJulian(date);
    const julianCentury = (julianDay - 2451545.0) / 36525.0;

    // Sun's mean anomaly
    const sunMeanAnomaly =
      357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);

    // Sun's true longitude
    const sunEquationOfCenter =
      Math.sin((sunMeanAnomaly * Math.PI) / 180) *
        (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
      Math.sin((2 * sunMeanAnomaly * Math.PI) / 180) *
        (0.019993 - 0.000101 * julianCentury) +
      Math.sin((3 * sunMeanAnomaly * Math.PI) / 180) * 0.000289;

    const sunTrueLongitude =
      (357.52911 +
        julianCentury * (35999.05029 - 0.0001537 * julianCentury) +
        sunEquationOfCenter) %
      360;

    // Sun's declination
    const sunDeclination =
      (Math.asin(
        Math.sin((23.439 * Math.PI) / 180) *
          Math.sin((sunTrueLongitude * Math.PI) / 180),
      ) *
        180) /
      Math.PI;

    // Hour angle
    const cosHourAngle =
      (Math.cos((zenith * Math.PI) / 180) -
        Math.sin((latitude * Math.PI) / 180) *
          Math.sin((sunDeclination * Math.PI) / 180)) /
      (Math.cos((latitude * Math.PI) / 180) *
        Math.cos((sunDeclination * Math.PI) / 180));

    if (cosHourAngle > 1 || cosHourAngle < -1) {
      return null; // Sun never rises or sets
    }

    const hourAngle = (Math.acos(cosHourAngle) * 180) / Math.PI;

    // Calculate time
    const solarNoon =
      (720 - 4 * longitude - sunEquationOfCenter + date.getTimezoneOffset()) /
      1440;

    const sunriseTime = solarNoon - (hourAngle * 4) / 1440;
    const sunsetTime = solarNoon + (hourAngle * 4) / 1440;

    // Choose sunrise or sunset based on parameter
    const timeValue = isSunrise ? sunriseTime : sunsetTime;
    const hours = timeValue * 24;
    const result = new Date(date);
    result.setHours(Math.floor(hours));
    result.setMinutes(Math.round((hours % 1) * 60));
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  }

  /**
   * Get sun times for location and date
   */
  getSunTimes(latitude: number, longitude: number, date: Date = new Date()): SunTimes {
    // Zenith angles
    const SUNRISE_SUNSET_ZENITH = 90.833; // Official sunrise/sunset
    const CIVIL_TWILIGHT_ZENITH = 96; // Civil twilight

    const sunrise = this.calculateSunTimes(
      latitude,
      longitude,
      date,
      SUNRISE_SUNSET_ZENITH,
      true, // sunrise
    );
    const sunset = this.calculateSunTimes(
      latitude,
      longitude,
      date,
      SUNRISE_SUNSET_ZENITH,
      false, // sunset
    );
    const dawn = this.calculateSunTimes(
      latitude,
      longitude,
      date,
      CIVIL_TWILIGHT_ZENITH,
      true, // dawn (sunrise for twilight)
    );
    const dusk = this.calculateSunTimes(
      latitude,
      longitude,
      date,
      CIVIL_TWILIGHT_ZENITH,
      false, // dusk (sunset for twilight)
    );

    return {
      sunrise: sunrise || new Date(),
      sunset: sunset || new Date(),
      dawn: dawn || new Date(),
      dusk: dusk || new Date(),
    };
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

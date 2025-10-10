/**
 * Tide Service
 * Handles fetching tide predictions from NOAA API
 * Reused from MyTides project
 */

export interface TideEvent {
  type: 'H' | 'L' | 'C'; // H = High tide, L = Low tide, C = Current
  time: string; // ISO 8601 format
  height: number; // Height in feet
  formattedTime: string; // Human-readable time
  isCurrent?: boolean; // True if this is the current tide level
}

export interface TideStation {
  id: string;
  name: string;
  distance: number; // Distance from user in km
}

interface NOAATideResponse {
  predictions?: Array<{
    t: string; // Time
    v: string; // Height value
    type: string; // H or L
  }>;
  error?: {
    message: string;
  };
}

interface NOAAStationsResponse {
  stations?: Array<{
    id: string;
    name: string;
    lat: string;
    lng: string;
  }>;
}

class TideService {
  private static instance: TideService;
  private readonly BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
  private readonly STATIONS_URL =
    'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';

  private constructor() {}

  static getInstance(): TideService {
    if (!TideService.instance) {
      TideService.instance = new TideService();
    }
    return TideService.instance;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find nearest tide station to given coordinates
   */
  async findNearestStation(
    latitude: number,
    longitude: number,
  ): Promise<TideStation | null> {
    try {
      const response = await fetch(
        `${this.STATIONS_URL}?type=tidepredictions`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NOAAStationsResponse = await response.json();

      if (!data.stations || data.stations.length === 0) {
        return null;
      }

      // Find closest station
      let nearestStation: TideStation | null = null;
      let minDistance = Infinity;

      for (const station of data.stations) {
        const stationLat = parseFloat(station.lat);
        const stationLng = parseFloat(station.lng);

        const distance = this.calculateDistance(
          latitude,
          longitude,
          stationLat,
          stationLng,
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = {
            id: station.id,
            name: station.name,
            distance: distance,
          };
        }
      }

      return nearestStation;
    } catch (error) {
      console.error('Error finding nearest station:', error);
      return null;
    }
  }

  /**
   * Format time string to human-readable format
   */
  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  /**
   * Calculate current tide level by interpolating between surrounding tides
   */
  private calculateCurrentTide(allTides: TideEvent[]): TideEvent | null {
    const now = new Date();

    let beforeTide: TideEvent | null = null;
    let afterTide: TideEvent | null = null;

    for (let i = 0; i < allTides.length; i++) {
      const tideTime = new Date(allTides[i].time);

      if (tideTime <= now) {
        beforeTide = allTides[i];
      } else if (tideTime > now && !afterTide) {
        afterTide = allTides[i];
        break;
      }
    }

    if (!beforeTide || !afterTide) {
      return null;
    }

    const beforeTime = new Date(beforeTide.time).getTime();
    const afterTime = new Date(afterTide.time).getTime();
    const currentTime = now.getTime();

    const timeFraction = (currentTime - beforeTime) / (afterTime - beforeTime);
    const currentHeight = beforeTide.height + (afterTide.height - beforeTide.height) * timeFraction;

    return {
      type: 'C',
      time: now.toISOString(),
      height: currentHeight,
      formattedTime: 'Now',
      isCurrent: true,
    };
  }

  /**
   * Get tide predictions for next 24 hours
   */
  async getTidePredictions(
    latitude: number,
    longitude: number,
  ): Promise<TideEvent[]> {
    try {
      const station = await this.findNearestStation(latitude, longitude);

      if (!station) {
        throw new Error('No tide station found near your location');
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const beginDate = this.formatDateForAPI(now);
      const endDate = this.formatDateForAPI(tomorrow);

      const url = `${this.BASE_URL}?product=predictions&application=AlmanacAlarm&begin_date=${beginDate}&end_date=${endDate}&datum=MLLW&station=${station.id}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NOAATideResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.predictions || data.predictions.length === 0) {
        return [];
      }

      const allTides: TideEvent[] = data.predictions.map(prediction => ({
        type: prediction.type === 'H' ? 'H' : 'L',
        time: prediction.t,
        height: parseFloat(prediction.v),
        formattedTime: this.formatTime(prediction.t),
      }));

      const currentTide = this.calculateCurrentTide(allTides);

      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const futureTides = allTides.filter(tide => {
        const tideTime = new Date(tide.time);
        return tideTime >= now && tideTime <= twentyFourHoursFromNow;
      });

      const tideEvents: TideEvent[] = currentTide
        ? [currentTide, ...futureTides]
        : futureTides;

      return tideEvents;
    } catch (error) {
      console.error('Error fetching tide predictions:', error);
      throw error;
    }
  }

  /**
   * Get tide information as spoken text for alarm
   */
  getTidesSpeechText(tides: TideEvent[]): string {
    if (tides.length === 0) {
      return 'No tide information available.';
    }

    const current = tides.find(t => t.isCurrent);
    const future = tides.filter(t => !t.isCurrent);

    let speech = '';

    if (current) {
      speech += `Current tide is ${current.height.toFixed(1)} feet. `;
    }

    if (future.length > 0) {
      const next = future[0];
      const tideType = next.type === 'H' ? 'high tide' : 'low tide';
      speech += `Next ${tideType} at ${next.formattedTime}, ${next.height.toFixed(1)} feet.`;
    }

    return speech;
  }

  /**
   * Format date for NOAA API (YYYYMMDD)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

export default TideService;

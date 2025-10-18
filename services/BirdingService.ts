/**
 * Birding Service
 * Fetches notable bird sightings from eBird API
 */

export interface NotableBird {
  speciesCode: string;
  comName: string; // Common name like "Black-throated Gray Warbler"
  sciName: string; // Scientific name
  locName: string; // Location name
  obsDt: string; // Observation date/time
  howMany?: number; // Number of individuals
  lat: number;
  lng: number;
}

interface EBirdResponse {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany?: number;
  lat: number;
  lng: number;
}

class BirdingService {
  private static instance: BirdingService;
  private readonly EBIRD_API_KEY = 'pupiq6hbi7pq';
  private readonly BASE_URL = 'https://api.ebird.org/v2';
  private lastFetchTime: number = 0;
  private cachedBirds: NotableBird[] = [];
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  private constructor() {}

  static getInstance(): BirdingService {
    if (!BirdingService.instance) {
      BirdingService.instance = new BirdingService();
    }
    return BirdingService.instance;
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(
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
   * Convert kilometers to miles
   */
  private kmToMiles(km: number): number {
    return km * 0.621371;
  }

  /**
   * Format how long ago the observation was made
   */
  private getTimeAgo(obsDt: string): string {
    const obsDate = new Date(obsDt);
    const now = new Date();
    const diffMs = now.getTime() - obsDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'less than an hour ago';
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    }
  }

  /**
   * Fetch notable bird observations from eBird API
   */
  async getNotableObservations(
    latitude: number,
    longitude: number,
    radiusKm: number = 25,
    daysBack: number = 1,
  ): Promise<NotableBird[]> {
    // Return cached data if still fresh
    const now = Date.now();
    if (now - this.lastFetchTime < this.CACHE_DURATION && this.cachedBirds.length > 0) {
      console.log('[BirdingService] Returning cached notable birds');
      return this.cachedBirds;
    }

    try {
      console.log(`[BirdingService] Fetching notable birds within ${radiusKm}km from last ${daysBack} day(s)...`);

      const url = `${this.BASE_URL}/data/obs/geo/recent/notable?lat=${latitude}&lng=${longitude}&dist=${radiusKm}&back=${daysBack}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-eBirdApiToken': this.EBIRD_API_KEY,
        },
      });

      if (!response.ok) {
        console.error(`[BirdingService] API Error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data: EBirdResponse[] = await response.json();
      console.log(`[BirdingService] Found ${data.length} notable bird(s)`);

      // Convert to our interface and add distance information
      const birds: NotableBird[] = data.map(bird => ({
        speciesCode: bird.speciesCode,
        comName: bird.comName,
        sciName: bird.sciName,
        locName: bird.locName,
        obsDt: bird.obsDt,
        howMany: bird.howMany,
        lat: bird.lat,
        lng: bird.lng,
      }));

      // Cache the results
      this.cachedBirds = birds;
      this.lastFetchTime = now;

      return birds;
    } catch (error) {
      console.error('[BirdingService] Error fetching notable birds:', error);
      return [];
    }
  }

  /**
   * Format notable birds for speech (top 3 most recent)
   */
  getBirdingSpeechText(birds: NotableBird[], userLat: number, userLng: number): string {
    if (!birds || birds.length === 0) {
      return '';
    }

    // Take top 3 most recent
    const topBirds = birds.slice(0, 3);

    const birdDescriptions = topBirds.map(bird => {
      const timeAgo = this.getTimeAgo(bird.obsDt);
      const count = bird.howMany ? `${bird.howMany} ` : '';

      return `${count}${bird.comName} at ${bird.locName} ${timeAgo}`;
    });

    const intro = birds.length === 1 ? 'Notable bird sighting: ' : 'Notable bird sightings: ';
    return intro + birdDescriptions.join('. ') + '.';
  }
}

export default BirdingService;

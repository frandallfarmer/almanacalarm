/**
 * Geocoding Service
 * Handles reverse geocoding to get city names from coordinates
 */

export interface CityInfo {
  city: string;
  state?: string;
  country: string;
}

interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
  error?: string;
}

class GeocodingService {
  private static instance: GeocodingService;
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

  private constructor() {}

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  /**
   * Get city name from coordinates using OpenStreetMap Nominatim API
   */
  async getCityFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<CityInfo> {
    try {
      const url = `${this.BASE_URL}?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AlmanacAlarm/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NominatimResponse = await response.json();

      if (data.error || !data.address) {
        throw new Error(data.error || 'Unable to determine location');
      }

      const city =
        data.address.city || data.address.town || data.address.village || 'Unknown';

      return {
        city: city,
        state: data.address.state,
        country: data.address.country || 'Unknown',
      };
    } catch (error) {
      console.error('Error fetching city name:', error);
      throw error;
    }
  }

  /**
   * Format city info for display
   */
  formatCityInfo(cityInfo: CityInfo): string {
    if (cityInfo.state) {
      return `${cityInfo.city}, ${cityInfo.state}`;
    }
    return `${cityInfo.city}, ${cityInfo.country}`;
  }
}

export default GeocodingService;

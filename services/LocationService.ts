/**
 * Location Service
 * Handles geolocation requests with proper permissions handling
 */

import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationData | null = null;
  private readonly CACHE_MAX_AGE_MS = 3600000; // 1 hour

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get cached location if available and not too old
   */
  private getCachedLocation(): LocationData | null {
    if (!this.cachedLocation) {
      return null;
    }

    const age = Date.now() - this.cachedLocation.timestamp;
    if (age > this.CACHE_MAX_AGE_MS) {
      console.log('[LocationService] Cached location expired');
      return null;
    }

    console.log('[LocationService] Using cached location');
    return this.cachedLocation;
  }

  /**
   * Save location to cache
   */
  private cacheLocation(location: LocationData): void {
    this.cachedLocation = location;
    console.log('[LocationService] Location cached');
  }

  /**
   * Request location permissions on Android
   */
  private async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS permissions are handled through Info.plist
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Almanac Alarm needs access to your location to show weather, tide, and air quality information for your area.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  /**
   * Get current location
   * Falls back to cached location if fresh location unavailable (e.g., in Doze mode)
   */
  async getCurrentLocation(): Promise<LocationData | LocationError> {
    try {
      const hasPermission = await this.requestLocationPermission();

      if (!hasPermission) {
        // Try cached location if permission denied but we have cache
        const cached = this.getCachedLocation();
        if (cached) {
          console.log('[LocationService] Permission denied, using cached location');
          return cached;
        }
        return {
          code: 1,
          message: 'Location permission denied',
        };
      }

      // Try to get fresh location
      const location = await new Promise<LocationData>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          },
          error => {
            reject({
              code: error.code,
              message: error.message,
            });
          },
          {
            enableHighAccuracy: false, // Use false for better battery in background
            timeout: 10000, // Shorter timeout for background
            maximumAge: 300000, // Accept 5-minute-old location
          },
        );
      });

      // Cache the fresh location
      this.cacheLocation(location);
      return location;
    } catch (error: any) {
      // If fresh location fails, try cached location
      const cached = this.getCachedLocation();
      if (cached) {
        console.log('[LocationService] Fresh location failed, using cached location');
        return cached;
      }

      // No cache available, return error
      console.error('[LocationService] Location failed and no cache available:', error);
      return {
        code: error.code || 999,
        message: error.message || 'Unable to get location',
      };
    }
  }

  /**
   * Show user-friendly error alert
   */
  static showLocationErrorAlert(error: LocationError): void {
    let title = 'Location Error';
    let message = 'Unable to get your location.';

    switch (error.code) {
      case 1:
        title = 'Permission Denied';
        message = 'Please enable location permissions in your device settings to use this feature.';
        break;
      case 2:
        title = 'Position Unavailable';
        message = 'Your location is currently unavailable. Please check your GPS settings.';
        break;
      case 3:
        title = 'Timeout';
        message = 'Location request timed out. Please try again.';
        break;
      default:
        message = error.message || 'An unknown error occurred.';
    }

    Alert.alert(title, message);
  }
}

export default LocationService;

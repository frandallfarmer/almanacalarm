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

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if location permission is already granted (doesn't show dialog)
   */
  private async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } catch (err) {
      console.warn('[LocationService] Error checking permission:', err);
      return false;
    }
  }

  /**
   * Request location permissions on Android
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
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
      console.warn('[LocationService] Location permission error:', err);
      return false;
    }
  }

  /**
   * Request background location permission (Android 10+)
   */
  async requestBackgroundLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    // Only needed on Android 10+ (API 29+)
    if (Platform.Version < 29) {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION as any,
        {
          title: 'Background Location Permission',
          message: 'Almanac Alarm needs background location access to get weather, tide, and air quality data when alarms fire.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[LocationService] Background location permission error:', err);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | LocationError> {
    // First check if we already have permission (works in background)
    let hasPermission = await this.checkLocationPermission();

    // If not, try to request it (only works when app is in foreground)
    if (!hasPermission) {
      hasPermission = await this.requestLocationPermission();

      // Also request background location on Android 10+
      if (hasPermission) {
        await this.requestBackgroundLocationPermission();
      }
    }

    if (!hasPermission) {
      return {
        code: 1,
        message: 'Location permission denied',
      };
    }

    return new Promise((resolve, reject) => {
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
          enableHighAccuracy: false, // Use network location for faster results in background
          timeout: 30000, // 30 seconds - more time for location when phone is asleep
          maximumAge: 300000, // Accept cached location up to 5 minutes old
        },
      );
    });
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

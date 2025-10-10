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
   */
  async getCurrentLocation(): Promise<LocationData | LocationError> {
    const hasPermission = await this.requestLocationPermission();

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
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
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

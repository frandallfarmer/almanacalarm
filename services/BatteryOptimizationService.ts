/**
 * Battery Optimization Service
 * Requests exemption from battery optimization to ensure alarms work reliably
 */

import {NativeModules, Platform, Linking} from 'react-native';

class BatteryOptimizationService {
  private static instance: BatteryOptimizationService;

  private constructor() {}

  static getInstance(): BatteryOptimizationService {
    if (!BatteryOptimizationService.instance) {
      BatteryOptimizationService.instance = new BatteryOptimizationService();
    }
    return BatteryOptimizationService.instance;
  }

  /**
   * Check if battery optimization is disabled for this app
   * Note: This requires native module implementation
   */
  async isBatteryOptimizationDisabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    // For now, assume we need to request it
    return false;
  }

  /**
   * Request to disable battery optimization
   * Opens system settings for user to manually disable
   */
  async requestBatteryOptimizationExemption(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Open battery optimization settings
      await Linking.openSettings();
      console.log('[BatteryOptimization] Opened settings for battery optimization');
    } catch (error) {
      console.error('[BatteryOptimization] Failed to open settings:', error);
    }
  }
}

export default BatteryOptimizationService;

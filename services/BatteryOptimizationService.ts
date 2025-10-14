/**
 * Battery Optimization Service
 * Requests exemption from battery optimization to ensure network access during Doze mode
 */

import {NativeModules, Platform} from 'react-native';

const {PowerManagerHelper} = NativeModules;

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
   */
  async isBatteryOptimizationDisabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (PowerManagerHelper && PowerManagerHelper.isIgnoringBatteryOptimizations) {
        const isIgnoring = await PowerManagerHelper.isIgnoringBatteryOptimizations();
        console.log('[BatteryOptimization] Is ignoring battery optimizations:', isIgnoring);
        return isIgnoring;
      }
      console.warn('[BatteryOptimization] PowerManagerHelper not available');
      return false;
    } catch (error) {
      console.error('[BatteryOptimization] Error checking battery optimization:', error);
      return false;
    }
  }

  /**
   * Request to disable battery optimization
   * This allows network access and location during Doze mode
   * Returns true if permission was granted or already granted
   */
  async requestBatteryOptimizationExemption(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const isAlreadyDisabled = await this.isBatteryOptimizationDisabled();
      if (isAlreadyDisabled) {
        console.log('[BatteryOptimization] Battery optimization already disabled');
        return true;
      }

      console.log('[BatteryOptimization] Requesting battery optimization exemption...');
      if (PowerManagerHelper && PowerManagerHelper.requestIgnoreBatteryOptimizations) {
        await PowerManagerHelper.requestIgnoreBatteryOptimizations();
        console.log('[BatteryOptimization] Request dialog shown');
        return true;
      } else {
        console.warn('[BatteryOptimization] PowerManagerHelper not available');
        return false;
      }
    } catch (error) {
      console.error('[BatteryOptimization] Failed to request battery optimization exemption:', error);
      return false;
    }
  }
}

export default BatteryOptimizationService;

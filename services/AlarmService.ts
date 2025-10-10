/**
 * Alarm Service
 * Manages alarm scheduling and triggering
 */

import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';

export interface AlarmData {
  id: string;
  time: Date;
  enabled: boolean;
  repeatDays?: number[]; // 0-6, Sunday = 0
  label?: string;
}

class AlarmService {
  private static instance: AlarmService;
  private alarms: Map<string, AlarmData> = new Map();
  private channelId: string = 'almanac-alarm-channel';

  private constructor() {}

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  /**
   * Initialize notification channel (Android only)
   */
  async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Almanac Alarm',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }

    // Request permissions
    await notifee.requestPermission();
  }

  /**
   * Schedule an alarm
   */
  async scheduleAlarm(alarm: AlarmData): Promise<void> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: alarm.time.getTime(),
      };

      if (alarm.repeatDays && alarm.repeatDays.length > 0) {
        // For repeating alarms, schedule daily and check day in handler
        trigger.repeatFrequency = RepeatFrequency.DAILY;
      }

      await notifee.createTriggerNotification(
        {
          id: alarm.id,
          title: 'Almanac Alarm',
          body: alarm.label || 'Time to wake up!',
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
            category: 'alarm',
            autoCancel: false,
            ongoing: true,
            fullScreenAction: {
              id: 'alarm_fullscreen',
              launchActivity: 'default',
            },
          },
          ios: {
            sound: 'default',
            critical: true,
            criticalVolume: 1.0,
          },
        },
        trigger,
      );

      this.alarms.set(alarm.id, alarm);
      console.log('Alarm scheduled:', alarm);
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      throw error;
    }
  }

  /**
   * Cancel an alarm
   */
  async cancelAlarm(alarmId: string): Promise<void> {
    try {
      await notifee.cancelNotification(alarmId);
      this.alarms.delete(alarmId);
      console.log('Alarm cancelled:', alarmId);
    } catch (error) {
      console.error('Error cancelling alarm:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled alarms
   */
  async getAllAlarms(): Promise<AlarmData[]> {
    return Array.from(this.alarms.values());
  }

  /**
   * Update alarm enabled status
   */
  async toggleAlarm(alarmId: string, enabled: boolean): Promise<void> {
    const alarm = this.alarms.get(alarmId);
    if (!alarm) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    if (enabled) {
      await this.scheduleAlarm({ ...alarm, enabled: true });
    } else {
      await this.cancelAlarm(alarmId);
      this.alarms.set(alarmId, { ...alarm, enabled: false });
    }
  }

  /**
   * Delete an alarm
   */
  async deleteAlarm(alarmId: string): Promise<void> {
    await this.cancelAlarm(alarmId);
    this.alarms.delete(alarmId);
  }

  /**
   * Get next alarm time
   */
  getNextAlarm(): AlarmData | null {
    const enabledAlarms = Array.from(this.alarms.values()).filter(
      a => a.enabled,
    );

    if (enabledAlarms.length === 0) {
      return null;
    }

    return enabledAlarms.reduce((next, current) => {
      if (!next || current.time < next.time) {
        return current;
      }
      return next;
    });
  }

  /**
   * Check if alarm should trigger based on repeat settings
   */
  shouldAlarmTrigger(alarm: AlarmData): boolean {
    if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
      return true; // One-time alarm
    }

    const currentDay = new Date().getDay();
    return alarm.repeatDays.includes(currentDay);
  }
}

export default AlarmService;

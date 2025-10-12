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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AlarmData {
  id: string;
  time: Date;
  enabled: boolean;
  repeat: boolean; // If true, alarm repeats daily at same time
  repeatDays?: number[]; // 0-6, Sunday = 0 (for future weekly repeat feature)
  label?: string;
}

class AlarmService {
  private static instance: AlarmService;
  private alarms: Map<string, AlarmData> = new Map();
  private channelId: string = 'almanac-alarm-channel';
  private readonly STORAGE_KEY = '@AlmanacAlarm:alarms';

  private constructor() {}

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  /**
   * Initialize notification channel (Android only) and load saved alarms
   */
  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Almanac Alarm',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });
        console.log('Notification channel created');
      }

      // Request permissions
      const settings = await notifee.requestPermission();
      console.log('Notification permission status:', settings);

      // Check for exact alarm permission on Android 12+
      if (Platform.OS === 'android') {
        const canScheduleExactAlarms = await notifee.canScheduleExactAlarms();
        console.log('Can schedule exact alarms:', canScheduleExactAlarms);

        if (!canScheduleExactAlarms) {
          console.warn('Exact alarm permission not granted');
          // Request exact alarm permission
          await notifee.openAlarmPermissionSettings();
        }
      }

      // Load saved alarms
      await this.loadAlarms();
    } catch (error) {
      console.error('Error initializing AlarmService:', error);
      throw error;
    }
  }

  /**
   * Save alarms to AsyncStorage
   */
  private async saveAlarms(): Promise<void> {
    try {
      const alarmsArray = Array.from(this.alarms.values()).map(alarm => ({
        ...alarm,
        time: alarm.time.toISOString(),
      }));
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(alarmsArray));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  }

  /**
   * Load alarms from AsyncStorage
   */
  private async loadAlarms(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const alarmsArray = JSON.parse(stored);
        this.alarms.clear();
        for (const alarm of alarmsArray) {
          this.alarms.set(alarm.id, {
            ...alarm,
            time: new Date(alarm.time),
          });
        }
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  }

  /**
   * Schedule an alarm
   */
  async scheduleAlarm(alarm: AlarmData): Promise<void> {
    try {
      // If time is in the past, adjust to tomorrow (or next occurrence for repeating)
      const now = new Date();
      const alarmTime = new Date(alarm.time);

      if (alarmTime <= now) {
        // Time is in the past - schedule for tomorrow at this time
        alarmTime.setDate(alarmTime.getDate() + 1);
        alarm.time = alarmTime;
        console.log('Time was in past, adjusted to tomorrow');
      }

      console.log('Scheduling alarm for:', alarm.time.toLocaleString());
      console.log('Current time:', now.toLocaleString());
      console.log('Repeat:', alarm.repeat);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: alarmTime.getTime(),
      };

      if (alarm.repeat) {
        // For repeating alarms, schedule daily
        trigger.repeatFrequency = RepeatFrequency.DAILY;
        console.log('Alarm set to repeat daily');
      }

      console.log('Creating trigger notification with:', {
        id: alarm.id,
        timestamp: trigger.timestamp,
        title: 'Almanac Alarm',
        body: alarm.label || 'Time to wake up!',
      });

      await notifee.createTriggerNotification(
        {
          id: alarm.id,
          title: 'Almanac Alarm',
          body: alarm.label || 'Time to wake up!',
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
          },
        },
        trigger,
      );

      this.alarms.set(alarm.id, alarm);
      await this.saveAlarms();
      console.log('Alarm scheduled successfully:', alarm);
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to schedule alarm: ${errorMessage}`);
    }
  }

  /**
   * Cancel an alarm
   */
  async cancelAlarm(alarmId: string): Promise<void> {
    try {
      await notifee.cancelNotification(alarmId);
      this.alarms.delete(alarmId);
      await this.saveAlarms();
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
      await this.saveAlarms();
    }
  }

  /**
   * Delete an alarm
   */
  async deleteAlarm(alarmId: string): Promise<void> {
    await this.cancelAlarm(alarmId);
    this.alarms.delete(alarmId);
    await this.saveAlarms();
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

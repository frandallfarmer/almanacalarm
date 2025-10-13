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
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Setup notifee (non-blocking - errors won't prevent alarm loading)
    try {
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Almanac Alarm',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });
      }

      await notifee.requestPermission();

      if (Platform.OS === 'android') {
        const canScheduleExactAlarms = await notifee.canScheduleExactAlarms();
        if (!canScheduleExactAlarms) {
          await notifee.openAlarmPermissionSettings();
        }
      }
    } catch (error) {
      console.error('Notifee setup error:', error);
    }

    // Load saved alarms (critical - must work)
    await this.loadAlarms();

    // Re-schedule all enabled alarms that were loaded from storage
    const allAlarms = Array.from(this.alarms.values());
    for (const alarm of allAlarms) {
      if (alarm.enabled) {
        try {
          await this.scheduleAlarmWithoutSaving(alarm);
        } catch (error) {
          console.error(`Failed to reschedule alarm ${alarm.id}:`, error);
        }
      }
    }
  }

  /**
   * Save alarms to AsyncStorage
   */
  private async saveAlarms(): Promise<void> {
    const alarmsArray = Array.from(this.alarms.values()).map(alarm => ({
      ...alarm,
      time: alarm.time.toISOString(),
    }));
    const json = JSON.stringify(alarmsArray);
    await AsyncStorage.setItem(this.STORAGE_KEY, json);
  }

  /**
   * Load alarms from AsyncStorage
   */
  private async loadAlarms(): Promise<void> {
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
  }

  /**
   * Schedule an alarm with Notifee without saving to AsyncStorage
   */
  private async scheduleAlarmWithoutSaving(alarm: AlarmData): Promise<void> {
    const now = new Date();
    const alarmTime = new Date(alarm.time);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: alarmTime.getTime(),
    };

    if (alarm.repeat) {
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
  }

  /**
   * Schedule an alarm
   */
  async scheduleAlarm(alarm: AlarmData): Promise<void> {
    const now = new Date();
    const alarmTime = new Date(alarm.time);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
      alarm.time = alarmTime;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: alarmTime.getTime(),
    };

    if (alarm.repeat) {
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
  }

  /**
   * Cancel an alarm - removes from Notifee and from storage
   */
  async cancelAlarm(alarmId: string): Promise<void> {
    await notifee.cancelNotification(alarmId);
    this.alarms.delete(alarmId);
    await this.saveAlarms();
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
   * Delete an alarm (same as cancelAlarm - removes from Notifee and storage)
   */
  async deleteAlarm(alarmId: string): Promise<void> {
    await this.cancelAlarm(alarmId);
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

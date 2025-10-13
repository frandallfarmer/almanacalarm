/**
 * Alarm Service
 * Manages alarm scheduling and triggering
 * Uses Notifee as the single source of truth - no separate database
 */

import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  RepeatFrequency,
  TriggerNotification,
} from '@notifee/react-native';
import { Platform } from 'react-native';

export interface AlarmData {
  id: string;
  time: Date;
  enabled: boolean;
  repeat: boolean;
  label?: string;
}

class AlarmService {
  private static instance: AlarmService;
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
    // Setup notifee
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

    // Log what alarms are actually scheduled in the OS
    const scheduled = await notifee.getTriggerNotifications();
    console.log(`[AlarmService] Found ${scheduled.length} alarms scheduled in OS`);
  }

  /**
   * Convert TriggerNotification to AlarmData
   */
  private triggerToAlarm(trigger: TriggerNotification): AlarmData {
    const notification = trigger.notification;
    const triggerData = trigger.trigger as TimestampTrigger;

    // Extract repeat flag from notification data
    const repeat = notification.data?.repeat === 'true';

    return {
      id: notification.id!,
      time: new Date(triggerData.timestamp),
      enabled: true,
      repeat: repeat,
      label: notification.body || undefined,
    };
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
        data: {
          repeat: alarm.repeat ? 'true' : 'false',
        },
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          autoCancel: false,
          ongoing: true,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          fullScreenAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      },
      trigger,
    );

    console.log('[AlarmService] Alarm scheduled:', alarm.id, 'repeat:', alarm.repeat);
  }

  /**
   * Cancel an alarm
   */
  async cancelAlarm(alarmId: string): Promise<void> {
    await notifee.cancelNotification(alarmId);
    console.log('[AlarmService] Alarm cancelled:', alarmId);
  }

  /**
   * Get all scheduled alarms from Notifee (single source of truth)
   */
  async getAllAlarms(): Promise<AlarmData[]> {
    const triggers = await notifee.getTriggerNotifications();
    return triggers.map(t => this.triggerToAlarm(t));
  }

  /**
   * Delete an alarm
   */
  async deleteAlarm(alarmId: string): Promise<void> {
    await this.cancelAlarm(alarmId);
  }

  /**
   * Get next alarm time
   */
  async getNextAlarm(): Promise<AlarmData | null> {
    const alarms = await this.getAllAlarms();

    if (alarms.length === 0) {
      return null;
    }

    return alarms.reduce((next, current) => {
      if (!next || current.time < next.time) {
        return current;
      }
      return next;
    });
  }

  /**
   * Cancel ALL alarms (useful for cleanup)
   */
  async cancelAllAlarms(): Promise<void> {
    const triggers = await notifee.getTriggerNotifications();
    console.log(`[AlarmService] Cancelling ${triggers.length} alarms...`);
    for (const trigger of triggers) {
      if (trigger.notification.id) {
        await notifee.cancelNotification(trigger.notification.id);
      }
    }
    console.log('[AlarmService] All alarms cancelled');
  }
}

export default AlarmService;

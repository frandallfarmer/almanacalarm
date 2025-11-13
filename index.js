/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';

/**
 * Background event handler - MUST be registered at root level BEFORE app registration
 * This is the ONLY way to handle events when app is completely closed
 */
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('[index.js] Background event:', type);

  if (type === EventType.DELIVERED) {
    console.log('[index.js] Alarm DELIVERED in background!');

    // Dynamically import services
    const AlarmService = require('./services/AlarmService').default;
    const {speakAlmanac} = require('./utils/AlmanacSpeaker');

    // Initialize AlarmService
    try {
      console.log('[index.js] Initializing AlarmService...');
      await AlarmService.getInstance().initialize();
      console.log('[index.js] AlarmService initialized');
    } catch (error) {
      console.error('[index.js] AlarmService initialization failed:', error);
      return; // Can't continue without alarm service
    }

    // Speak almanac (TTS will lazy-initialize when needed)
    try {
      console.log('[index.js] Speaking almanac...');
      await speakAlmanac();
      console.log('[index.js] Almanac speech completed');

      // Dismiss the notification after speaking is done
      if (detail.notification?.id) {
        console.log('[index.js] Dismissing notification:', detail.notification.id);
        await notifee.cancelNotification(detail.notification.id);
      }
    } catch (error) {
      console.error('[index.js] Error speaking almanac:', error);
      // Error already logged, notification will remain visible for user
    }

    // Handle alarm cleanup (delete non-repeating alarms from schedule)
    try {
      if (detail.notification?.id) {
        const alarmService = AlarmService.getInstance();
        const allAlarms = await alarmService.getAllAlarms();
        const alarm = allAlarms.find(a => a.id === detail.notification.id);

        if (alarm && !alarm.repeat) {
          console.log('[index.js] Deleting non-repeating alarm from schedule:', alarm.id);
          await alarmService.deleteAlarm(alarm.id);
        }
      }
    } catch (error) {
      console.error('[index.js] Error cleaning up alarm:', error);
      // Don't speak this one, not critical
    }
  }
});

AppRegistry.registerComponent(appName, () => App);

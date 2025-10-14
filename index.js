/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';
import {speakAlmanac} from './utils/AlmanacSpeaker';
import AlarmService from './services/AlarmService';

/**
 * Background event handler - MUST be registered at root level
 * This handles alarms when app is closed/background
 */
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('[index.js] Background notification event:', type);

  if (type === EventType.DELIVERED) {
    console.log('[index.js] Alarm DELIVERED in background! Starting almanac speech...');

    // Speak the almanac
    await speakAlmanac();

    // Handle alarm cleanup (delete non-repeating)
    if (detail.notification?.id) {
      const alarmService = AlarmService.getInstance();
      const allAlarms = await alarmService.getAllAlarms();
      const alarm = allAlarms.find(a => a.id === detail.notification.id);

      if (alarm && !alarm.repeat) {
        console.log('[index.js] Deleting non-repeating alarm:', alarm.id);
        await alarmService.deleteAlarm(alarm.id);
      }
    }
  }
});

AppRegistry.registerComponent(appName, () => App);

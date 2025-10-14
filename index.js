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

    // Dynamically import services and initialize them
    const TTSService = require('./services/TTSService').default;
    const AlarmService = require('./services/AlarmService').default;
    const {speakAlmanac} = require('./utils/AlmanacSpeaker');

    try {
      console.log('[index.js] Initializing TTS...');
      await TTSService.getInstance().initialize();
      console.log('[index.js] TTS initialized');

      // Test speech to confirm handler is being called
      const tts = TTSService.getInstance();
      await tts.speak('Background handler called.');
      console.log('[index.js] Test speech completed');
    } catch (error) {
      console.error('[index.js] TTS initialization failed:', error);
      // Speak the error so user knows what happened
      const tts = TTSService.getInstance();
      await tts.speak('TTS initialization failed: ' + error.message);
    }

    try {
      console.log('[index.js] Initializing AlarmService...');
      await AlarmService.getInstance().initialize();
      console.log('[index.js] AlarmService initialized');
    } catch (error) {
      console.error('[index.js] AlarmService initialization failed:', error);
      const tts = TTSService.getInstance();
      await tts.speak('Alarm service initialization failed: ' + error.message);
      return; // Can't continue without alarm service
    }

    try {
      console.log('[index.js] Speaking almanac...');
      await speakAlmanac();
      console.log('[index.js] Almanac speech completed');
    } catch (error) {
      console.error('[index.js] Error speaking almanac:', error);
      // Speak the error so user knows what happened
      const tts = TTSService.getInstance();
      await tts.speak('Error speaking almanac: ' + error.message);
    }

    // Handle alarm cleanup
    try {
      if (detail.notification?.id) {
        const alarmService = AlarmService.getInstance();
        const allAlarms = await alarmService.getAllAlarms();
        const alarm = allAlarms.find(a => a.id === detail.notification.id);

        if (alarm && !alarm.repeat) {
          console.log('[index.js] Deleting non-repeating alarm:', alarm.id);
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

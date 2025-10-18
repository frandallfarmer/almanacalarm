/**
 * Almanac Alarm
 * A bespoke alarm clock that speaks the time, weather, tides, air quality, and sun times
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import notifee, {EventType} from '@notifee/react-native';
import HomeScreen from './screens/HomeScreen';
import AlarmsScreen from './screens/AlarmsScreen';
import TTSService from './services/TTSService';
import AlarmService from './services/AlarmService';
import LocationService from './services/LocationService';
import BatteryOptimizationService from './services/BatteryOptimizationService';
import {speakAlmanac} from './utils/AlmanacSpeaker';

export type RootStackParamList = {
  Home: undefined;
  Alarms: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Handle alarm after it fires - either delete non-repeating alarms or keep repeating ones
 */
async function handleAlarmFired(alarmId: string): Promise<void> {
  try {
    console.log('[handleAlarmFired] Handling alarm:', alarmId);
    const alarmService = AlarmService.getInstance();
    const allAlarms = await alarmService.getAllAlarms();
    console.log('[handleAlarmFired] Current alarms in service:', allAlarms.length);
    const alarm = allAlarms.find(a => a.id === alarmId);

    if (!alarm) {
      console.log('[handleAlarmFired] Alarm not found:', alarmId);
      return;
    }

    console.log('[handleAlarmFired] Alarm details:', JSON.stringify(alarm));
    console.log('[handleAlarmFired] Repeat enabled:', alarm.repeat);

    if (!alarm.repeat) {
      // Non-repeating alarm - delete it
      console.log('[handleAlarmFired] Deleting non-repeating alarm:', alarmId);
      await alarmService.deleteAlarm(alarmId);
    } else {
      // Repeating alarm - keep it in storage
      // Notifee's RepeatFrequency.DAILY will automatically reschedule it
      console.log('[handleAlarmFired] Keeping repeating alarm in storage:', alarmId);
    }
  } catch (error) {
    console.error('[handleAlarmFired] Error handling fired alarm:', error);
  }
}

function App(): React.JSX.Element {
  // Initialize services on app start
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize TTS first (don't block on failure)
      try {
        await TTSService.getInstance().initialize();
      } catch (error) {
        console.error('TTS initialization failed (non-fatal):', error);
      }

      // Request battery optimization exemption first for network access during Doze mode
      try {
        await BatteryOptimizationService.getInstance().requestBatteryOptimizationExemption();
      } catch (error) {
        console.error('Battery optimization request failed (non-fatal):', error);
      }

      // Request all location permissions
      try {
        const locationService = LocationService.getInstance();

        // Request fine location first
        const hasLocation = await locationService.requestLocationPermission();

        if (hasLocation) {
          // Then request background location (Android 10+ will show "Allow all the time" option)
          await locationService.requestBackgroundLocationPermission();
        }
      } catch (error) {
        console.error('Location permission request failed (non-fatal):', error);
      }

      // Initialize AlarmService (critical)
      await AlarmService.getInstance().initialize();

      // Check if we were launched by an alarm notification
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log('App launched by notification:', initialNotification);
        // Handle alarm cleanup if it was an alarm
        if (initialNotification.notification?.id) {
          await handleAlarmFired(initialNotification.notification.id);
        }
      }

      // Don't auto-speak on launch - only speak when alarm fires in background
    };

    initializeServices().catch(error => {
      console.error('FATAL: Error initializing services:', error);
      alert(`Initialization Error: ${error}`);
    });

    // Set up foreground event handler (background handler is in index.js)
    const unsubscribeForeground = notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('[App.tsx] Foreground notification event:', type, detail);

      if (type === EventType.DELIVERED) {
        console.log('[App.tsx] Alarm DELIVERED in foreground');
        // Speak almanac
        await speakAlmanac();
        // Handle alarm cleanup (delete non-repeating)
        if (detail.notification?.id) {
          await handleAlarmFired(detail.notification.id);
        }
      } else if (type === EventType.PRESS) {
        console.log('[App.tsx] User pressed notification - speaking almanac');
        // User pressed the notification - speak it
        await speakAlmanac();
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Alarms" component={AlarmsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

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
import {speakAlmanac} from './utils/AlmanacSpeaker';

export type RootStackParamList = {
  Home: undefined;
  Alarms: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  // Initialize services on app start
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await TTSService.getInstance().initialize();
        await AlarmService.getInstance().initialize();
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    // Set up notification event handler for when alarm is triggered
    const unsubscribeForeground = notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('Foreground notification event:', type, detail);

      if (type === EventType.DELIVERED || type === EventType.PRESS) {
        console.log('Alarm triggered! Starting almanac speech...');
        // Trigger the almanac speech
        await speakAlmanac();
      }
    });

    // Set up background event handler
    notifee.onBackgroundEvent(async ({type, detail}) => {
      console.log('Background notification event:', type, detail);

      if (type === EventType.DELIVERED || type === EventType.PRESS) {
        console.log('Alarm triggered in background! Starting almanac speech...');
        // Trigger the almanac speech
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

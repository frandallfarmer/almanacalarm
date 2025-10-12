/**
 * Home Screen
 * Displays almanac information and provides navigation to alarms
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import LocationService, {
  LocationData,
  LocationError,
} from '../services/LocationService';
import WeatherService, {WeatherData} from '../services/WeatherService';
import TideService, {TideEvent} from '../services/TideService';
import AirQualityService, {AirQualityData} from '../services/AirQualityService';
import SunTimesService, {SunTimes} from '../services/SunTimesService';
import GeocodingService, {CityInfo} from '../services/GeocodingService';
import TTSService from '../services/TTSService';
import BibleService, {BibleVerse} from '../services/BibleService';

type RootStackParamList = {
  Home: undefined;
  Alarms: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

function HomeScreen({navigation}: HomeScreenProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  // Data state
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tides, setTides] = useState<TideEvent[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [bibleVerse, setBibleVerse] = useState<BibleVerse | null>(null);

  // Loading states
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    flex: 1,
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Fetch all data when location changes
  useEffect(() => {
    if (location) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const result = await LocationService.getInstance().getCurrentLocation();
      if ('code' in result) {
        setLocationError(result as LocationError);
        LocationService.showLocationErrorAlert(result as LocationError);
      } else {
        setLocation(result as LocationData);
      }
    } catch (error) {
      const err = error as LocationError;
      setLocationError(err);
      LocationService.showLocationErrorAlert(err);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!location) {
      return;
    }

    setDataLoading(true);

    try {
      const [cityData, weatherData, tidesData, airQualityData, sunTimesData, verseData] =
        await Promise.allSettled([
          GeocodingService.getInstance().getCityFromCoordinates(
            location.latitude,
            location.longitude,
          ),
          WeatherService.getInstance().getWeather(
            location.latitude,
            location.longitude,
          ),
          TideService.getInstance().getTidePredictions(
            location.latitude,
            location.longitude,
          ),
          AirQualityService.getInstance().getAirQuality(
            location.latitude,
            location.longitude,
          ),
          Promise.resolve(
            SunTimesService.getInstance().getSunTimes(
              location.latitude,
              location.longitude,
            ),
          ),
          BibleService.getInstance().getVerseOfTheDay(),
        ]);

      if (cityData.status === 'fulfilled') {
        setCityInfo(cityData.value);
      }
      if (weatherData.status === 'fulfilled') {
        setWeather(weatherData.value);
      }
      if (tidesData.status === 'fulfilled') {
        setTides(tidesData.value);
      }
      if (airQualityData.status === 'fulfilled') {
        setAirQuality(airQualityData.value);
      }
      if (sunTimesData.status === 'fulfilled') {
        setSunTimes(sunTimesData.value);
      }
      if (verseData.status === 'fulfilled') {
        setBibleVerse(verseData.value);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getGreeting = (hour: number): string => {
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  const speakAlmanac = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const greeting = getGreeting(hour);

      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      let speech = `${greeting}. It is ${timeString}, ${dateString}. `;

      if (cityInfo) {
        speech += `Your location is ${GeocodingService.getInstance().formatCityInfo(cityInfo)}. `;
      }

      if (weather) {
        speech += WeatherService.getInstance().getWeatherSpeechText(weather) + ' ';
      }

      if (sunTimes) {
        speech += SunTimesService.getInstance().getSunTimesSpeechText(sunTimes) + ' ';
      }

      if (tides.length > 0) {
        speech += TideService.getInstance().getTidesSpeechText(tides) + ' ';
      }

      if (airQuality) {
        speech += AirQualityService.getInstance().getAirQualitySpeechText(airQuality) + ' ';
      }

      if (bibleVerse) {
        speech += BibleService.getInstance().getVerseSpeechText(bibleVerse);
      }

      await TTSService.getInstance().speak(speech);
    } catch (error) {
      console.error('Error speaking almanac:', error);
      Alert.alert('Error', 'Failed to speak almanac information');
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, textStyle]}>Almanac Alarm</Text>
          <Text style={[styles.subtitle, textStyle]}>
            Your Personal Morning Briefing
          </Text>

          {/* Location Status */}
          {locationLoading && (
            <View style={styles.locationContainer}>
              <ActivityIndicator
                size="small"
                color={isDarkMode ? '#ffffff' : '#000000'}
              />
              <Text style={[styles.locationText, textStyle]}>
                Getting location...
              </Text>
            </View>
          )}

          {location && !locationLoading && cityInfo && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={[styles.cityText, textStyle]}>
                {GeocodingService.getInstance().formatCityInfo(cityInfo)}
              </Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content}>
          {dataLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? '#ffffff' : '#000000'}
              />
              <Text style={[styles.loadingText, textStyle]}>
                Loading almanac data...
              </Text>
            </View>
          )}

          {!dataLoading && location && (
            <>
              {/* Current Time */}
              <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                <Text style={[styles.cardTitle, textStyle]}>Current Time</Text>
                <Text style={[styles.timeText, textStyle]}>
                  {new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
                <Text style={[styles.dateText, textStyle]}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {/* Weather */}
              {weather && (
                <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                  <Text style={[styles.cardTitle, textStyle]}>Weather</Text>
                  <Text style={[styles.weatherTemp, textStyle]}>
                    {Math.round(weather.temperature)}°F
                  </Text>
                  <Text style={[styles.weatherCondition, textStyle]}>
                    {weather.conditions}
                  </Text>
                  <Text style={[styles.weatherDetail, textStyle]}>
                    Humidity: {weather.humidity}% | Wind: {Math.round(weather.windSpeed)} mph
                  </Text>
                </View>
              )}

              {/* Sun Times */}
              {sunTimes && (
                <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                  <Text style={[styles.cardTitle, textStyle]}>Sun Times</Text>
                  <View style={styles.sunTimesRow}>
                    <View style={styles.sunTimeItem}>
                      <Text style={[styles.sunTimeLabel, textStyle]}>Sunrise</Text>
                      <Text style={[styles.sunTimeValue, textStyle]}>
                        {sunTimes.sunrise.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.sunTimeItem}>
                      <Text style={[styles.sunTimeLabel, textStyle]}>Sunset</Text>
                      <Text style={[styles.sunTimeValue, textStyle]}>
                        {sunTimes.sunset.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Air Quality */}
              {airQuality && (
                <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                  <Text style={[styles.cardTitle, textStyle]}>Air Quality</Text>
                  <Text style={[styles.aqiValue, textStyle]}>{airQuality.aqi}</Text>
                  <Text style={[styles.aqiCategory, textStyle]}>
                    {airQuality.category}
                  </Text>
                </View>
              )}

              {/* Tides */}
              {tides.length > 0 && (
                <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                  <Text style={[styles.cardTitle, textStyle]}>Tides (Next 24h)</Text>
                  {tides.slice(0, 4).map((tide, index) => (
                    <View key={index} style={styles.tideRow}>
                      <Text style={[styles.tideTime, textStyle]}>
                        {tide.formattedTime}
                      </Text>
                      <Text style={[styles.tideType, textStyle]}>
                        {tide.type === 'C' ? 'Current' : tide.type === 'H' ? 'High' : 'Low'}
                      </Text>
                      <Text style={[styles.tideHeight, textStyle]}>
                        {tide.height.toFixed(1)} ft
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Bible Verse of the Day */}
              {bibleVerse && (
                <View style={[styles.card, {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'}]}>
                  <Text style={[styles.cardTitle, textStyle]}>Verse of the Day</Text>
                  <Text style={[styles.verseReference, textStyle]}>
                    {bibleVerse.reference}
                  </Text>
                  <Text style={[styles.verseText, textStyle]}>
                    {bibleVerse.text}
                  </Text>
                  <Text style={[styles.verseTranslation, textStyle]}>
                    — {bibleVerse.translation}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.speakButton, {backgroundColor: '#007AFF'}]}
                onPress={speakAlmanac}>
                <Text style={styles.speakButtonText}>Speak Almanac</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alarmButton, {backgroundColor: '#34C759'}]}
                onPress={() => navigation.navigate('Alarms')}>
                <Text style={styles.speakButtonText}>Alarms</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  locationContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 8,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weatherCondition: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  weatherDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  sunTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sunTimeItem: {
    alignItems: 'center',
  },
  sunTimeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  sunTimeValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  aqiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aqiCategory: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  tideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  tideTime: {
    fontSize: 14,
    flex: 1,
  },
  tideType: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  tideHeight: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  speakButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  alarmButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  speakButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  verseTranslation: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default HomeScreen;

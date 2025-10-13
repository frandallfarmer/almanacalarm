/**
 * Almanac Speaker Utility
 * Fetches all data and speaks the almanac briefing
 */

import LocationService from '../services/LocationService';
import WeatherService from '../services/WeatherService';
import TideService from '../services/TideService';
import AirQualityService from '../services/AirQualityService';
import SunTimesService from '../services/SunTimesService';
import GeocodingService from '../services/GeocodingService';
import BibleService from '../services/BibleService';
import TTSService from '../services/TTSService';

export const getGreeting = (hour: number): string => {
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

export const speakAlmanac = async (): Promise<void> => {
  try {
    console.log('Starting almanac speech...');

    // Ensure TTS is initialized
    const tts = TTSService.getInstance();
    await tts.initialize();

    // Get location
    const locationResult = await LocationService.getInstance().getCurrentLocation();
    if ('code' in locationResult) {
      console.error('Location error:', locationResult);
      await tts.speak('Unable to get location. Please check your location permissions.');
      return;
    }

    const location = locationResult;
    console.log('Location obtained:', location.latitude, location.longitude);

    // Fetch all data in parallel
    const [cityInfo, weather, tides, airQuality, sunTimes, bibleVerse] = await Promise.allSettled([
      GeocodingService.getInstance().getCityFromCoordinates(location.latitude, location.longitude),
      WeatherService.getInstance().getWeather(location.latitude, location.longitude),
      TideService.getInstance().getTidePredictions(location.latitude, location.longitude),
      AirQualityService.getInstance().getAirQuality(location.latitude, location.longitude),
      Promise.resolve(SunTimesService.getInstance().getSunTimes(location.latitude, location.longitude)),
      BibleService.getInstance().getVerseOfTheDay(),
    ]);

    // Build speech text
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

    if (cityInfo.status === 'fulfilled' && cityInfo.value) {
      speech += `Your location is ${GeocodingService.getInstance().formatCityInfo(cityInfo.value)}. `;
    }

    if (weather.status === 'fulfilled' && weather.value) {
      speech += WeatherService.getInstance().getWeatherSpeechText(weather.value) + ' ';
    }

    if (sunTimes.status === 'fulfilled' && sunTimes.value) {
      speech += SunTimesService.getInstance().getSunTimesSpeechText(sunTimes.value) + ' ';
    }

    if (tides.status === 'fulfilled' && tides.value.length > 0) {
      speech += TideService.getInstance().getTidesSpeechText(tides.value) + ' ';
    }

    if (airQuality.status === 'fulfilled' && airQuality.value) {
      speech += AirQualityService.getInstance().getAirQualitySpeechText(airQuality.value) + ' ';
    }

    if (bibleVerse.status === 'fulfilled' && bibleVerse.value) {
      speech += BibleService.getInstance().getVerseSpeechText(bibleVerse.value);
    }

    console.log('Speaking almanac...');
    await tts.speak(speech);
    console.log('Almanac speech completed');
  } catch (error) {
    console.error('Error in speakAlmanac:', error);
    alert(`Almanac error: ${error}`);
  }
};

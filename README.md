# Almanac Alarm

A bespoke alarm clock for Android that speaks your morning briefing in a human voice. Instead of playing music or alarm sounds, Almanac Alarm reads aloud:

- Current time and date
- Location (nearest city)
- Weather conditions (temperature, conditions, humidity, wind)
- Sunrise and sunset times
- Tide information for the next 24 hours (current tide and upcoming high/low tides)
- Air quality index and category

## Features

- **Voice Announcements**: Uses text-to-speech to speak all almanac information
- **Location-Based**: Automatically gets your location and nearest city
- **Weather Data**: Real-time weather from Open-Meteo API (free, no API key required)
- **Tide Information**: Tide predictions from NOAA for coastal areas
- **Air Quality**: Current air quality index from Open-Meteo
- **Sun Times**: Calculates sunrise and sunset times for your location
- **Alarm Scheduling**: Set alarms that trigger the almanac announcement

## Technology Stack

- **React Native 0.81** with TypeScript
- **Service-based architecture** (similar to MyTides project)
- **APIs Used**:
  - Open-Meteo (weather and air quality - free, no API key)
  - NOAA Tides & Currents (tide predictions)
  - OpenStreetMap Nominatim (geocoding)
- **Native Libraries**:
  - react-native-geolocation-service (location)
  - react-native-tts (text-to-speech)
  - @notifee/react-native (alarm notifications)

## Installation

1. Install dependencies:
```bash
npm install
```

2. For Android, ensure you have Android SDK installed and configured.

3. Run the app:
```bash
npm run android
```

## Development

### Project Structure

```
almanacalarm/
├── services/
│   ├── LocationService.ts      # Handles geolocation
│   ├── WeatherService.ts       # Fetches weather data
│   ├── TideService.ts          # Fetches tide predictions
│   ├── AirQualityService.ts    # Fetches air quality data
│   ├── SunTimesService.ts      # Calculates sunrise/sunset
│   ├── GeocodingService.ts     # Reverse geocoding for city names
│   ├── TTSService.ts           # Text-to-speech functionality
│   └── AlarmService.ts         # Alarm scheduling and management
├── App.tsx                     # Main application component
└── package.json
```

### Services

All services follow the singleton pattern and are initialized on app start:

- **LocationService**: Requests permissions and gets current GPS coordinates
- **WeatherService**: Fetches current weather conditions
- **TideService**: Finds nearest tide station and gets predictions
- **AirQualityService**: Gets current air quality index
- **SunTimesService**: Calculates astronomical times
- **TTSService**: Manages text-to-speech engine
- **AlarmService**: Schedules and manages alarms

## Permissions

The app requires the following Android permissions:

- `ACCESS_FINE_LOCATION` - For getting your location
- `SCHEDULE_EXACT_ALARM` - For setting precise alarm times
- `POST_NOTIFICATIONS` - For alarm notifications
- `INTERNET` - For fetching weather, tide, and air quality data

## Future Enhancements

- [ ] Custom voice recording (use your own voice)
- [ ] Configurable alarm content (choose which data to announce)
- [ ] Multiple alarms with different schedules
- [ ] Snooze functionality
- [ ] Historical data tracking
- [ ] Widget support
- [ ] iOS support

## License

MIT

## Author

Randy Farmer (frandallfarmer)

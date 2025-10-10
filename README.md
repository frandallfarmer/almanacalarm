# Almanac Alarm

A bespoke alarm clock for Android that speaks your morning briefing in a human voice. Instead of playing music or alarm sounds, Almanac Alarm reads aloud:

- Current time and date with dynamic greetings
- Location (nearest city)
- Weather conditions (temperature, conditions, humidity, wind, precipitation)
- Sunrise and sunset times with civil twilight
- Tide information for the next 24 hours (current tide and upcoming high/low tides)
- Air quality index and category (PM2.5, PM10)
- Daily Bible verse (KJV)

## Features

### Implemented Features

- **Voice Announcements**: Uses text-to-speech to speak all almanac information
- **Dynamic Greetings**: Time-appropriate greetings (Good morning/afternoon/evening/night)
- **Location-Based**: Automatically gets your location and nearest city
- **Weather Data**: Real-time weather from Open-Meteo API (free, no API key required)
- **Tide Information**: Tide predictions from NOAA for coastal areas
- **Air Quality**: Current air quality index and particulate levels from Open-Meteo
- **Sun Times**: Calculates sunrise and sunset times using astronomical algorithms
- **Daily Bible Verse**: 31 curated verses rotating daily (KJV)
- **Dark/Light Mode**: Adaptive UI theme support

### In Development

> **Note**: The alarm scheduling feature is not yet fully functional. Currently, the app provides a manual "Speak Almanac" button to trigger announcements. Automatic alarm triggering is planned for a future release.

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

### Prerequisites

- Node.js and npm
- Android SDK
- Java Development Kit (JDK 11 or higher)
- React Native development environment configured

### Setup

1. Clone the repository:
```bash
git clone https://github.com/frandallfarmer/almanacalarm.git
cd almanacalarm
```

2. Install dependencies:
```bash
npm install
```

3. For Android, ensure Android SDK is installed and `ANDROID_HOME` environment variable is set.

### Building the App

The project includes an automated build script for creating both debug and release APKs:

```bash
./build-and-deploy.sh
```

This script will:
1. Clean previous builds
2. Build debug APK (~99 MB)
3. Build release APK (~47 MB, recommended for installation)
4. Copy both APKs to `~/Dropbox` with timestamps
5. Log all output to `build.log` for monitoring

**Manual Build Commands:**

```bash
# Debug build
cd android && ./gradlew assembleDebug

# Release build
cd android && ./gradlew assembleRelease
```

**Build Output Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Installing on Android Device

1. Locate the APK in your Dropbox folder:
   - Recommended: `AlmanacAlarm_release_YYYYMMDD_HHMMSS.apk`
   - Debug: `AlmanacAlarm_debug_YYYYMMDD_HHMMSS.apk`

2. Transfer the APK to your Android device (via Dropbox app, USB, etc.)

3. Open the APK file on your device

4. If prompted, enable "Install from Unknown Sources" for your file manager

5. Complete the installation

### Running in Development

For development with hot reload:
```bash
npm run android
```

Or start Metro bundler separately:
```bash
npm start
# In another terminal:
npx react-native run-android
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
- **WeatherService**: Fetches current weather conditions from Open-Meteo API
- **TideService**: Finds nearest NOAA tide station and gets 24-hour predictions
- **AirQualityService**: Gets current air quality index and particulate levels
- **SunTimesService**: Calculates astronomical times using NOAA Solar Calculator algorithms
- **GeocodingService**: Reverse geocodes coordinates to city names via OpenStreetMap Nominatim
- **BibleService**: Fetches daily Bible verses from bible-api.com with 31-verse rotation
- **TTSService**: Manages text-to-speech engine configuration and playback
- **AlarmService**: Schedules and manages alarms (in development)

### Time-Based Greetings

The app automatically adjusts greetings based on the current time:

- **5:00 AM - 11:59 AM**: "Good morning"
- **12:00 PM - 4:59 PM**: "Good afternoon"
- **5:00 PM - 8:59 PM**: "Good evening"
- **9:00 PM - 4:59 AM**: "Good night"

### Bible Verse Rotation

The daily Bible verse feature includes 31 carefully curated verses that rotate based on a deterministic algorithm:
- Cycles through verses based on day of year
- Includes year offset for long-term variation
- Same verse appears on the same calendar date each year (with offset)
- Sources from bible-api.com using KJV translation

## Usage

### Current Functionality

Once installed, the app provides:

1. **Manual Trigger**: Tap the "Speak Almanac" button to hear the complete briefing
2. **Information Display**: View all data on the main screen
3. **Dark/Light Mode**: The interface adapts to your system theme

**Sample Announcement:**

> "Good morning. It is 8:30 AM, Friday, October 10th, 2025. You are in Portland. The temperature is 62 degrees Fahrenheit with partly cloudy skies. Humidity is 75%. Wind speed is 8 miles per hour. Sunrise at 7:12 AM, sunset at 6:45 PM. Current tide is 4.3 feet. Next high tide at 2:15 PM, 7.8 feet. Air quality is good with an index of 42. Today's verse: For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. John 3:16."

### Permissions

The app requires the following Android permissions:

- `ACCESS_FINE_LOCATION` - For getting your location
- `SCHEDULE_EXACT_ALARM` - For setting precise alarm times (future use)
- `POST_NOTIFICATIONS` - For alarm notifications (future use)
- `INTERNET` - For fetching weather, tide, air quality, and Bible verse data

## Future Enhancements

> **Note**: Custom voice recording is a planned feature. Currently, the app uses standard text-to-speech synthesis. Future versions will allow users to record their own voice for personalized announcements.

- [ ] **Alarm Triggering**: Automatic alarm scheduling and wake-up functionality
- [ ] **Custom Voice Recording**: Record and use your own voice instead of TTS
- [ ] **Configurable Content**: Choose which data to announce
- [ ] **Multiple Alarms**: Different schedules with unique content
- [ ] **Snooze Functionality**: Configurable snooze options
- [ ] **Historical Data**: Track weather, tides, and air quality over time
- [ ] **Widget Support**: Home screen widgets for quick info
- [ ] **iOS Support**: iPhone and iPad compatibility

## Known Issues

- **Alarm Scheduling**: Automatic alarm triggering not yet implemented
- **Deprecation Warnings**: Some React Native native modules use deprecated APIs (onCatalystInstanceDestroy)
- **iOS Support**: Not yet available for iOS devices

## Version History

### v0.0.1 (2025-10-10) - Initial Release

**Implemented Features:**
- Core voice announcement system with TTS
- Dynamic time-based greetings (morning/afternoon/evening/night)
- Location service with GPS and reverse geocoding
- Weather data integration (Open-Meteo API)
- Tide predictions (NOAA API)
- Air quality monitoring (Open-Meteo Air Quality API)
- Sunrise/sunset calculations using astronomical algorithms
- Daily Bible verse rotation (31 curated verses, KJV)
- Custom app icon
- Automated build and deployment script
- Dark/light mode UI support

**Bug Fixes:**
- Fixed sunrise/sunset calculation returning identical times
- Fixed reversed sunrise/sunset values
- Fixed hard-coded "Good morning" greeting

**Known Limitations:**
- Manual trigger only (no automatic alarms yet)
- Android only
- Standard TTS voice (custom voice recording not implemented)

## Contributing

This is a private project. For issues or suggestions, contact the author.

## License

Private - All Rights Reserved

## Author

Randy Farmer (frandallfarmer)
- GitHub: https://github.com/frandallfarmer
- Repository: https://github.com/frandallfarmer/almanacalarm

## Acknowledgments

- Based on the MyTides project architecture
- Weather and air quality data provided by Open-Meteo.com
- Tide predictions from NOAA Tides & Currents
- Geocoding via OpenStreetMap Nominatim
- Bible verses from bible-api.com
- Astronomical calculations based on NOAA Solar Calculator algorithms

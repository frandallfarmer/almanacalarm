# Almanac Alarm

A bespoke alarm clock for Android that speaks your morning briefing in a human voice. Instead of playing music or alarm sounds, Almanac Alarm reads aloud:

- Current time and date with dynamic greetings
- Location (nearest city)
- Weather conditions (temperature, conditions, humidity, wind, precipitation)
- Sunrise and sunset times with civil twilight
- Tide information for the next 24 hours (current tide and upcoming high/low tides)
- Air quality index and category (PM2.5, PM10)
- Notable bird sightings (rare/unusual birds in your area from eBird)
- Daily Bible verse (KJV)

## Features

- **Voice Announcements**: Uses text-to-speech to speak all almanac information
- **Background Alarms**: Alarms fire and speak almanac without launching the app UI
- **Dynamic Greetings**: Time-appropriate greetings (Good morning/afternoon/evening/night)
- **Location-Based**: Automatically gets your location and nearest city
- **Background Location**: Full support for location access when app is closed or phone is sleeping
- **Weather Data**: Real-time weather from Open-Meteo API (free, no API key required)
- **Tide Information**: Tide predictions from NOAA for coastal areas
- **Air Quality**: Current air quality index and particulate levels from Open-Meteo
- **Sun Times**: Calculates sunrise and sunset times using astronomical algorithms
- **Bird Sightings**: Notable rare bird sightings in 25km radius from eBird API
- **Daily Bible Verse**: 31 curated verses rotating daily (KJV)
- **Dark/Light Mode**: Adaptive UI theme support
- **Repeating Alarms**: Support for one-time and daily repeating alarms
- **Battery Optimization**: Automatic request for battery exemption to ensure network access during sleep
- **Auto-Dismiss**: Notifications automatically dismiss after almanac completes

## Technology Stack

- **React Native 0.81** with TypeScript
- **Service-based architecture** (similar to MyTides project)
- **APIs Used**:
  - Open-Meteo (weather and air quality - free, no API key)
  - NOAA Tides & Currents (tide predictions)
  - OpenStreetMap Nominatim (geocoding)
  - eBird API 2.0 (notable bird observations)
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
│   ├── BirdingService.ts       # Fetches notable bird sightings from eBird
│   ├── TTSService.ts           # Text-to-speech functionality
│   └── AlarmService.ts         # Alarm scheduling and management
├── App.tsx                     # Main application component
└── package.json
```

### Services

All services follow the singleton pattern and are initialized on app start:

- **LocationService**: Requests permissions (including background location) and gets current GPS coordinates
- **WeatherService**: Fetches current weather conditions from Open-Meteo API
- **TideService**: Finds nearest NOAA tide station and gets 24-hour predictions
- **AirQualityService**: Gets current air quality index and particulate levels
- **SunTimesService**: Calculates astronomical times using NOAA Solar Calculator algorithms
- **GeocodingService**: Reverse geocodes coordinates to city names via OpenStreetMap Nominatim
- **BirdingService**: Fetches notable/rare bird sightings from eBird API within 25km radius from last 24 hours
- **BibleService**: Fetches daily Bible verses from bible-api.com with 31-verse rotation
- **TTSService**: Manages text-to-speech engine configuration and playback
- **AlarmService**: Schedules and manages alarms using Notifee
- **BatteryOptimizationService**: Requests battery optimization exemption for reliable background operation

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

### Setting Up Alarms

Once installed:

1. **First Launch**: Grant location permissions when prompted, and allow battery optimization exemption for reliable background operation
2. **Manage Alarms**: Tap "Manage Alarms" on the home screen
3. **Create Alarm**: Set time, label, and choose one-time or repeating
4. **Background Operation**: Alarms will fire and speak the almanac even when your phone is asleep, without launching the app

### Manual Trigger

You can also manually trigger the almanac announcement:
1. Tap the "Speak Almanac" button on the home screen
2. The app will fetch all current data and speak it aloud

**Sample Announcement:**

> "Good morning. It is 8:30 AM, Friday, October 18th, 2025. Your location is Point Reyes, California. The temperature is 58 degrees Fahrenheit with clear sky. Humidity is 82%. Wind speed is 7 miles per hour. Sunrise at 7:24 AM, sunset at 6:22 PM. Current tide is 3.2 feet. Next high tide at 11:45 AM, 5.8 feet. Air quality is good with an index of 35. Notable bird sightings: Black-throated Gray Warbler at Point Reyes National Seashore yesterday. Peregrine Falcon at Bolinas Lagoon 5 hours ago. Today's verse: For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. John 3:16."

### Permissions

The app requires the following Android permissions:

- `ACCESS_FINE_LOCATION` - For getting your location
- `ACCESS_BACKGROUND_LOCATION` - For location access when app is closed (Android 10+)
- `SCHEDULE_EXACT_ALARM` - For setting precise alarm times
- `POST_NOTIFICATIONS` - For alarm notifications
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` - For reliable background operation and network access during sleep
- `INTERNET` - For fetching weather, tide, air quality, and Bible verse data
- `DISABLE_KEYGUARD` - For alarms to work when phone is locked

## Future Enhancements

> **Note**: Custom voice recording is a planned feature. Currently, the app uses standard text-to-speech synthesis. Future versions will allow users to record their own voice for personalized announcements.

- [ ] **Phase of Moon**: Current moon phase (new, waxing crescent, full, etc.)
- [ ] **Days Until End of Year**: Countdown to year-end
- [ ] **Daily Temperature Forecast**: Predicted high/low temperatures for the day
- [ ] **General Weather Conditions**: Enhanced weather descriptions (rainy, overcast, sunny, etc.)
- [ ] **Custom Voice Recording**: Record and use your own voice instead of TTS
- [ ] **Configurable Content**: Choose which data to announce
- [ ] **Snooze Functionality**: Configurable snooze options
- [ ] **Historical Data**: Track weather, tides, and air quality over time
- [ ] **Widget Support**: Home screen widgets for quick info
- [ ] **iOS Support**: iPhone and iPad compatibility
- [ ] **Custom Alarm Sounds**: Option to play a sound before/after the almanac announcement

## Known Issues

- **Deprecation Warnings**: Some React Native native modules use deprecated APIs (onCatalystInstanceDestroy) - these are non-breaking warnings
- **iOS Support**: Not yet available for iOS devices

## Version History

### v1.1.0 (2025-10-18) - Bird Sightings Feature

**New Features:**
- ✅ **Notable Bird Sightings** - Integration with eBird API 2.0 to announce rare/unusual bird sightings
  - Fetches notable birds within 25km radius from last 24 hours
  - Announces top 3 most recent sightings with location names and time
  - Displays on home screen with "Notable Birds 🦅" card
  - 6-hour caching to reduce API calls
  - Example: "Black-throated Gray Warbler at Point Reyes National Seashore yesterday"

**Technical Changes:**
- Added `BirdingService.ts` with eBird API integration
- Updated `AlmanacSpeaker.ts` to include birding in alarm announcements
- Updated `HomeScreen.tsx` to fetch and display notable birds
- Location names displayed instead of distances for better context

**API Integration:**
- eBird API 2.0 `/data/obs/geo/recent/notable` endpoint
- Uses existing eBird API key from bird-photo-tagger project

### v1.0.0 (2025-10-14) - First Stable Release

**Major Features:**
- ✅ **Fully functional background alarm system** - Alarms fire and speak almanac without launching app
- ✅ **Background location support** - Automatic request for background location permission (Android 10+)
- ✅ **Battery optimization exemption** - Native module to request unrestricted background access for network and location during Doze mode
- ✅ **Auto-dismiss notifications** - Notifications automatically clear after almanac completes
- ✅ **Repeating alarms** - Support for one-time and daily repeating alarms
- ✅ **Voice error reporting** - Errors spoken aloud via TTS for debugging background issues

**Core Features:**
- Voice announcement system with TTS
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

**Technical Improvements:**
- Background event handler registered at root level (index.js) for proper closed-app handling
- Dynamic service initialization in background context
- Custom native Kotlin module for PowerManager integration
- Comprehensive error handling with audible feedback

**Bug Fixes:**
- Fixed background alarm handler not being called when app is closed
- Fixed location timeout issues in background with proper permission flow
- Fixed network access during Android Doze mode
- Fixed silent failures with proper TTS error reporting

### v0.0.1 (2025-10-10) - Initial Development Release

**Implemented Features:**
- Core voice announcement system with TTS
- Dynamic time-based greetings
- Location service with GPS and reverse geocoding
- Weather, tide, air quality, and Bible verse integration
- Automated build script
- Dark/light mode UI

**Known Limitations:**
- Manual trigger only (no automatic alarms)
- Android only
- Standard TTS voice

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
- Notable bird observations from eBird API 2.0
- Bible verses from bible-api.com
- Astronomical calculations based on NOAA Solar Calculator algorithms

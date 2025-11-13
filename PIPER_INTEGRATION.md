# Piper TTS Integration Guide

## Overview

The Almanac Alarm app now uses a custom Piper TTS voice model (Randy Farmer's voice) for offline text-to-speech synthesis. This provides a personalized, high-quality voice experience without relying on system TTS engines.

## Architecture

### Components

1. **PiperTTSService** (`services/PiperTTSService.ts`)
   - Wraps `react-native-sherpa-onnx-offline-tts` library
   - Handles voice model initialization and file management
   - Provides high-level TTS interface

2. **TTSService** (`services/TTSService.ts`)
   - Updated to use PiperTTSService instead of `react-native-tts`
   - Maintains same API for backwards compatibility
   - Handles speech rate conversion

3. **Voice Model Files** (bundled in app)
   - `voice-profile-randy-farmer.onnx` (61MB) - The neural voice model
   - `voice-profile-randy-farmer-tokens.txt` - Phoneme token mappings
   - `espeak-ng-data/` - eSpeak-NG phonemization data

## File Structure

```
almanacalarm/
├── android/app/src/main/assets/voice_profiles/
│   ├── voice-profile-randy-farmer.onnx
│   ├── voice-profile-randy-farmer-tokens.txt
│   └── espeak-ng-data/
│       └── [espeak data files]
├── services/
│   ├── PiperTTSService.ts (NEW)
│   └── TTSService.ts (UPDATED)
└── voice_profiles/ (source files, not bundled)
    ├── voice-profile-randy-farmer.onnx
    ├── voice-profile-randy-farmer-tokens.txt
    └── espeak-ng-data/
```

## Dependencies

### New Dependencies
- **react-native-sherpa-onnx-offline-tts** - Offline TTS engine for React Native
- Uses existing **react-native-fs** for file operations

### Install Dependencies
```bash
npm install react-native-sherpa-onnx-offline-tts
```

## Building the App

### 1. Clean Build (Recommended)

Since native modules were added, perform a clean build:

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild the app
npm run android
```

### 2. Auto-linking

React Native 0.81 will automatically link the native modules:
- `react-native-sherpa-onnx-offline-tts`
- `react-native-fs`

### 3. Asset Bundling

The voice model files in `android/app/src/main/assets/voice_profiles/` will be automatically bundled into the APK during build.

**Note:** The APK size will increase by ~70MB due to the voice model.

## How It Works

### Initialization Flow

1. **App Launch** → `App.tsx` initializes TTSService
2. **TTSService.initialize()** → calls PiperTTSService.initialize()
3. **PiperTTS.initialize()** →
   - Copies voice model files from assets to device storage
   - Initializes sherpa-onnx with model configuration
4. **Ready to speak** → Using custom Piper voice

### Speech Generation Flow

1. **AlmanacSpeaker** generates speech text
2. **TTSService.speak(text)** → calls PiperTTSService.speak()
3. **PiperTTS.speak()** →
   - Converts text to phonemes (via espeak-ng)
   - Generates audio using ONNX model inference
   - Plays audio through device speaker
4. **Audio playback** via native audio engine

## Configuration

### Speech Rate

The speech rate can be adjusted using `TTSService.setRate(rate)`:
- Input: 0.01 to 0.99 (react-native-tts compatible)
- Maps to Piper speed: 0.5 (slow) to 2.0 (fast)
- Default: 1.0 (normal speed)

### Voice Model

Currently uses single voice model:
- **ID:** `piper-randy-farmer`
- **Name:** Randy Farmer (Piper)
- **Language:** en-US
- **Quality:** v2 (423 epochs training)

## Testing

### Test Basic TTS

You can test the integration by triggering an alarm or by adding a test button in the app:

```typescript
import TTSService from './services/TTSService';

// Test speech
const testTTS = async () => {
  const tts = TTSService.getInstance();
  await tts.initialize();
  await tts.speak('Good morning. It is seven thirty AM. The current temperature is 72 degrees.');
};
```

### Debug Logging

Look for these log messages in logcat:
- `[TTSService] Initializing Piper TTS...`
- `[PiperTTS] Copying voice model files to device...`
- `[PiperTTS] Initialized successfully`
- `[TTSService] Speaking with Piper voice...`

## Troubleshooting

### Common Issues

1. **"Failed to initialize Piper TTS"**
   - Check that voice model files exist in assets
   - Verify file permissions on device
   - Check logcat for detailed error messages

2. **"Cannot copy assets"**
   - Ensure files are in correct assets directory
   - Rebuild the app (`./gradlew clean && npm run android`)

3. **Audio doesn't play**
   - Check device volume settings
   - Verify audio permissions in AndroidManifest.xml
   - Check if another app is using audio

4. **App crashes on launch**
   - Check native module linking: `cd android && ./gradlew app:dependencies`
   - Verify sherpa-onnx native library is included

### Logs

View React Native logs:
```bash
npx react-native log-android
```

View native logs:
```bash
adb logcat | grep -E "TTSService|PiperTTS|sherpa"
```

## Future Improvements

1. **Voice Model Upgrades**
   - Replace with v3 model when training completes
   - Simply update files in `android/app/src/main/assets/voice_profiles/`

2. **Multiple Voices**
   - Add support for different voices
   - Implement voice selection in settings

3. **Performance**
   - Cache generated audio for repeated phrases
   - Implement streaming for long text

4. **Quality**
   - Fine-tune speech rate and pauses
   - Add SSML support for better prosody

## References

- [Piper TTS](https://github.com/rhasspy/piper) - Original Piper project
- [sherpa-onnx](https://k2-fsa.github.io/sherpa/onnx/) - ONNX Runtime for TTS
- [react-native-sherpa-onnx-offline-tts](https://github.com/kislay99/react-native-sherpa-onnx-offline-tts) - React Native wrapper
- [Voice Training Status](VOICE_TRAINING_STATUS.md) - Model training details

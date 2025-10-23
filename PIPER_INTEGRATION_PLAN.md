# Piper TTS Integration Plan for Almanac Alarm

## Overview

Integrate your custom Piper TTS voice model into Almanac Alarm for completely offline, personalized voice announcements.

## Integration Approach

### Option 1: Sherpa-ONNX React Native (Recommended)

**Package**: `react-native-sherpa-onnx-offline-tts`
- **Repository**: https://github.com/kislay99/react-native-sherpa-onnx-offline-tts
- **Platform Support**: Android 5.0+ (API 21), iOS 11+
- **Model Support**: Piper ONNX models (what you'll train)
- **Performance**: Real-time generation on modern phones
- **Size Impact**: ~20-50MB (model) + ~5-10MB (runtime)

## Prerequisites

After training your Piper model, you'll have:
- ✅ `your_voice.onnx` - The trained model (~20-50MB)
- ✅ `your_voice.onnx.json` - Model configuration
- ✅ `tokens.txt` - Phoneme tokens (from Piper)
- ✅ `espeak-ng-data/` - Pronunciation data directory (from Piper)

## Step-by-Step Integration

### 1. Install Dependencies

```bash
cd /home/randy/almanacalarm
npm install react-native-sherpa-onnx-offline-tts
```

### 2. Bundle Model Files with APK

Place trained model files in Android assets:

```
android/app/src/main/assets/piper/
├── your_voice.onnx
├── your_voice.onnx.json
├── tokens.txt
└── espeak-ng-data/
    └── (espeak data files)
```

**Note**: This increases APK size by ~30-60MB total

### 3. Create PiperTTSService

Create new service: `services/PiperTTSService.ts`

```typescript
import Tts from 'react-native-sherpa-onnx-offline-tts';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

class PiperTTSService {
  private static instance: PiperTTSService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): PiperTTSService {
    if (!PiperTTSService.instance) {
      PiperTTSService.instance = new PiperTTSService();
    }
    return PiperTTSService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Path to bundled assets
      const assetPath = Platform.OS === 'android'
        ? 'asset:///piper'
        : `${RNFS.MainBundlePath}/piper`;

      await Tts.init({
        modelPath: `${assetPath}/your_voice.onnx`,
        tokensPath: `${assetPath}/tokens.txt`,
        dataPath: `${assetPath}/espeak-ng-data`,
        numThreads: 2, // Adjust based on device
      });

      this.initialized = true;
      console.log('[PiperTTS] Initialized successfully');
    } catch (error) {
      console.error('[PiperTTS] Initialization failed:', error);
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('[PiperTTS] Speaking:', text);
      await Tts.speak(text);
    } catch (error) {
      console.error('[PiperTTS] Speech failed:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('[PiperTTS] Stop failed:', error);
    }
  }

  async isSpeaking(): Promise<boolean> {
    try {
      return await Tts.isSpeaking();
    } catch (error) {
      return false;
    }
  }
}

export default PiperTTSService;
```

### 4. Update AlmanacSpeaker to Use Piper

Modify `utils/AlmanacSpeaker.ts`:

```typescript
// Replace TTSService import
// import TTSService from '../services/TTSService';
import PiperTTSService from '../services/PiperTTSService';

export const speakAlmanac = async (): Promise<void> => {
  try {
    console.log('Starting almanac speech...');

    // Use Piper instead of system TTS
    const tts = PiperTTSService.getInstance();
    await tts.initialize();

    // ... rest of almanac logic stays the same ...

    console.log('Speaking almanac...');
    await tts.speak(speech);
    console.log('Almanac speech completed');
  } catch (error) {
    console.error('Error in speakAlmanac:', error);
    // Fallback to system TTS if Piper fails
    const systemTts = TTSService.getInstance();
    await systemTts.speak('Error with custom voice: ' + (error as Error).message);
  }
};
```

### 5. Update AndroidManifest.xml (if needed)

Ensure proper permissions for audio playback:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 6. Build Configuration

Update `android/app/build.gradle` to bundle assets:

```gradle
android {
    // ... existing config ...

    sourceSets {
        main {
            assets.srcDirs = ['src/main/assets']
        }
    }
}
```

## Testing Plan

### Phase 1: Local Testing
1. ✅ Test model with Piper CLI locally
2. ✅ Verify audio quality
3. ✅ Test various sentences

### Phase 2: Integration Testing
1. ✅ Install package
2. ✅ Bundle model files
3. ✅ Test initialization
4. ✅ Test simple speech
5. ✅ Test full almanac

### Phase 3: Performance Testing
1. ✅ Measure initialization time
2. ✅ Measure speech generation latency
3. ✅ Test on low-end Android device
4. ✅ Monitor memory usage
5. ✅ Test background alarm scenarios

## Fallback Strategy

Keep existing TTSService as fallback:

```typescript
class HybridTTSService {
  async speak(text: string): Promise<void> {
    try {
      // Try Piper first
      await PiperTTSService.getInstance().speak(text);
    } catch (error) {
      console.warn('[HybridTTS] Piper failed, using system TTS', error);
      // Fallback to system TTS
      await TTSService.getInstance().speak(text);
    }
  }
}
```

## Performance Expectations

### Initialization
- **First time**: 1-3 seconds (loading model)
- **Subsequent**: <100ms (already loaded)

### Speech Generation
- **Modern phone** (2020+): Real-time or faster
- **Older phone** (2017-2019): 1-2x slower than real-time
- **Low-end phone**: May struggle, use fallback

### Memory
- **Model in memory**: ~50-100MB
- **During inference**: +20-50MB
- **Total impact**: ~70-150MB RAM

## App Size Impact

- **Current APK**: ~56MB (release)
- **With Piper model**: ~86-106MB (release)
- **Increase**: ~30-50MB

**Optimization options**:
- Use `medium` quality model (smaller)
- Enable app splitting by ABI
- Use Play Asset Delivery (for large models)

## Alternative: Hybrid Approach

If full Piper integration proves too heavy:

**Option**: Keep system TTS, add custom recordings for key phrases
- Record 50-100 key phrases as MP3/WAV files
- Play recordings for greetings, key transitions
- Use system TTS for variable data (numbers, cities, etc.)
- Much smaller app size impact (~5-10MB)
- Easier to implement
- Gives personality to most important parts

## Next Steps

1. **Complete voice recording** (30-60 minutes)
2. **Train model on Google Colab** (6-12 hours)
3. **Test model locally** with Piper CLI
4. **Implement integration** (4-8 hours dev time)
5. **Test on device**
6. **Optimize if needed**
7. **Release as v1.3.0**

## Estimated Timeline

- **Recording**: 1-2 hours (your time)
- **Training**: 6-12 hours (automated, overnight)
- **Testing**: 1 hour
- **Integration**: 4-8 hours (development)
- **Testing/QA**: 2-4 hours
- **Total**: ~2-3 days of calendar time

## Questions to Consider

1. **Is 30-50MB APK increase acceptable?**
2. **Should we support fallback to system TTS?**
3. **Target minimum Android version?** (Currently API 24, Piper needs API 21+)
4. **Performance vs quality trade-off?** (medium vs high quality model)

---

Ready to start? Begin with the voice recording using `VOICE_RECORDING_GUIDE.md`!

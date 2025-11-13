# Voice Profiles

This directory contains production-ready Piper TTS voice models for the Almanac Alarm application.

## Current Voices

### Randy Farmer (v3) - ACTIVE
- **Files**: `voice-profile-randy-farmer.onnx` + `voice-profile-randy-farmer.onnx.json`
- **Training**: 3541 epochs (epoch 0→3541, ~850 epochs beyond v2)
- **Sample Rate**: 22050 Hz
- **Language**: en-us
- **Quality**: Improved quality from extended training
- **Status**: ✅ Production-ready, fully integrated with metadata

## Usage

```javascript
import { PiperVoice } from 'piper-tts';

const voice = await PiperVoice.load('voice_profiles/voice-profile-randy-farmer.onnx');
const audio = await voice.synthesize("Your text here");
```

## Training History

- **v1** (106 epochs): Initial training, poor quality
- **v2** (423 epochs, epoch 2270→2693): 4x extended training, good quality
- **v2.5** (experimental): Test checkpoint
- **v3** (3541 epochs, epoch 0→3541): ✅ **ACTIVE** - Extended training for improved quality

## Integration Notes

### Critical Fixes Applied (Nov 2025)
The following fixes are REQUIRED for Piper TTS to work with sherpa-onnx:

1. **Metadata Embedding**
   - ONNX model must have embedded metadata (sample_rate, voice, n_speakers)
   - Use `voice_profiles/add_metadata.py` to embed metadata from JSON config
   - Without this: "sample_rate does not exist in the metadata" error

2. **Tokens File Format**
   - Must be `token ID` format (e.g., `_ 0`, `^ 1`)
   - NOT just token names alone
   - Generated from `phoneme_id_map` in JSON config

3. **Native Module Fix**
   - Modified `react-native-sherpa-onnx-offline-tts` to avoid text splitting
   - Prevents pthread_mutex crash (sherpa-onnx bug #943)
   - Single generate() call per speech request

## File Naming Convention

Production voice files use the format:
- Model: `voice-profile-{name}.onnx`
- Config: `voice-profile-{name}.onnx.json`

Training artifacts remain in `voice_training/` directory.

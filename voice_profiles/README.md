# Voice Profiles

This directory contains production-ready Piper TTS voice models for the Almanac Alarm application.

## Current Voices

### Randy Farmer (v2)
- **Files**: `voice-profile-randy-farmer.onnx` + `voice-profile-randy-farmer.onnx.json`
- **Training**: 423 epochs (epoch 2270→2693)
- **Sample Rate**: 22050 Hz
- **Language**: en-us
- **Quality**: Good, slight metallic artifacts

## Usage

```javascript
import { PiperVoice } from 'piper-tts';

const voice = await PiperVoice.load('voice_profiles/voice-profile-randy-farmer.onnx');
const audio = await voice.synthesize("Your text here");
```

## Training History

- **v1** (106 epochs): Initial training, poor quality
- **v2** (423 epochs): 4x extended training, good quality
- **v3** (in progress): Target 848 more epochs to reduce metallic artifacts

## File Naming Convention

Production voice files use the format:
- Model: `voice-profile-{name}.onnx`
- Config: `voice-profile-{name}.onnx.json`

Training artifacts remain in `voice_training/` directory.

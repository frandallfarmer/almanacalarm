# Voice Training Status

## Current State (as of 2025-11-12)

### Production Voice Model (Ready for Integration)
- **Location**: `voice_profiles/voice-profile-randy-farmer.onnx` + `.json`
- **Version**: v2 (423 epochs training)
- **Quality**: Good, slight metallic artifacts
- **Status**: Ready to integrate into Almanac Alarm app

### Training in Progress
- **Version**: v3
- **Goal**: Reduce metallic quality
- **Training**: epoch 2693 → 3541 (848 more epochs, 2x v2 duration)
- **Checkpoints**: Saving to Google Drive at `/content/drive/MyDrive/piper_training/lightning_logs/`
- **Google Colab Credits**: 93 units remaining (out of 100 purchased)
- **Command**: See `voice_training/retrain_command.sh`

## Training History

| Version | Epochs | Start | End | Quality |
|---------|--------|-------|-----|---------|
| v1 | 106 | 2164 | 2270 | Poor |
| v2 | 423 | 2270 | 2693 | Good (metallic) |
| v3 | 848 (in progress) | 2693 | 3541 | TBD |

## Audio Samples

Training audio segments (42 total):
- `voice_training/audio/speedchat-01.wav` through `speedchat-32.wav` (32 files)
- `voice_training/audio/Almanac-01.wav` through `Almanac-10.wav` (10 files)
- Metadata: `voice_training/metadata.csv`

Test outputs:
- `voice_training/test_v2.wav` - Short greeting with v2 model
- `voice_training/test_almanac_v2.wav` - Almanac-style text with v2 model

## Integration Notes

### Using the Voice in Your App

```javascript
// Example usage (adjust for your framework)
import piper from 'piper-tts';

const voice = await piper.load('voice_profiles/voice-profile-randy-farmer.onnx');
const audio = await voice.synthesize("Good morning. It is seven thirty AM.");
```

### Command-line Testing

```bash
echo "Your text here" | piper \
  --model voice_profiles/voice-profile-randy-farmer.onnx \
  --output_file output.wav
```

### When v3 Training Completes

1. Export checkpoint to ONNX:
```bash
!python3 -m piper.train.export_onnx \
  --checkpoint /content/drive/MyDrive/piper_training/checkpoints/epoch=3541-step=XXXX.ckpt \
  --output-file /content/drive/MyDrive/piper_training/randy_farmer_v3.onnx
```

2. Download both `randy_farmer_v3.onnx` and `randy_farmer_v3.onnx.json` from Google Drive

3. Replace production voice:
```bash
cp randy_farmer_v3.onnx voice_profiles/voice-profile-randy-farmer.onnx
cp randy_farmer_v3.onnx.json voice_profiles/voice-profile-randy-farmer.onnx.json
```

## File Organization

```
almanacalarm/
├── voice_profiles/              # Production voice models (tracked in git)
│   ├── voice-profile-randy-farmer.onnx (61MB, v2)
│   ├── voice-profile-randy-farmer.onnx.json
│   └── README.md
└── voice_training/              # Training data & artifacts
    ├── audio/                   # 42 segmented wav files
    ├── transcripts/             # Source transcripts
    ├── metadata.csv             # Training metadata
    ├── generate_metadata.py     # Script to regenerate metadata
    ├── retrain_command.sh       # Current training command
    ├── test_v2.wav             # Test outputs
    └── test_almanac_v2.wav
```

## Next Steps for App Integration

1. Set up Piper TTS in your React Native app
2. Load `voice_profiles/voice-profile-randy-farmer.onnx`
3. Test with sample Almanac text
4. Implement audio playback for generated speech
5. When v3 completes, swap in the improved model

# Piper TTS Voice Recording & Training Guide

This guide will help you create a custom TTS voice model for Almanac Alarm using Piper TTS and free Google Colab GPU training.

## Overview

**Goal**: Train a Piper TTS model with your voice that runs completely offline on Android
**Cost**: $0 (uses free Google Colab GPU)
**Time**:
- Recording: 1-2 hours
- Training: 6-12 hours (automated on Colab)
- Integration: 2-4 hours development

## Step 1: Prepare Recording Environment

### Equipment Needed
- **Microphone**: Built-in laptop mic works, but USB mic is better
- **Quiet room**: Minimal background noise
- **Audio software**: Audacity (free) or your phone's voice recorder

### Recording Settings
- **Format**: WAV or FLAC (lossless)
- **Sample Rate**: 22050 Hz (Piper standard)
- **Channels**: Mono
- **Bit Depth**: 16-bit

## Step 2: Recording Script

You need **30-60 minutes** of varied speech. Piper works best with diverse sentence structures, so read from varied sources.

### Recommended Recording Content

1. **News articles** (10 minutes) - Varied vocabulary
2. **Book chapters** (15 minutes) - Natural narrative flow
3. **Almanac samples** (15 minutes) - Domain-specific language
4. **Numbers & dates** (10 minutes) - Important for your use case
5. **Weather terms** (10 minutes) - Specific to your app

### Sample Almanac Recording Script

Record yourself reading these varied almanac-style announcements:

```
Good morning. It is seven thirty AM, Monday, January fifteenth, twenty twenty-five.
Your location is San Francisco, California.

Today's weather will be partly cloudy. Currently clear sky with a temperature of
fifty-eight degrees. Today's high will be sixty-eight and low fifty-two.

The temperature is forty-two degrees Fahrenheit with clear sky.
Humidity is seventy-five percent. Wind speed is eight miles per hour.

Sunrise at seven twenty-four AM, sunset at six twenty-two PM.

Current tide is three point two feet. Next high tide at eleven forty-five AM,
seven point eight feet. Next low tide at five thirty PM, one point one feet.

Air quality is good with an index of thirty-five.

Notable bird sightings: American Robin at Golden Gate Park yesterday.
Black-throated Gray Warbler at Point Reyes National Seashore two days ago.

Today's verse: For God so loved the world, that he gave his only begotten Son,
that whosoever believeth in him should not perish, but have everlasting life.
John three sixteen.

Good afternoon. It is two fifteen PM, Tuesday, March eighth.
Good evening. It is seven forty-five PM, Friday, October tenth.
Good night. It is eleven thirty PM, Saturday, December twentieth.

The temperature ranges from twenty degrees to ninety degrees Fahrenheit.
Wind speeds vary from zero to fifty miles per hour.
Humidity levels range from ten to one hundred percent.

Weather conditions include sunny, partly cloudy, overcast, foggy, rainy,
stormy, snowy, drizzly, and clear sky.

Numbers: zero, one, two, three, four, five, six, seven, eight, nine, ten,
eleven, twelve, thirteen, fourteen, fifteen, twenty, twenty-five, thirty,
forty, fifty, sixty, seventy, eighty, ninety, one hundred.

Times: twelve AM, one AM, two AM, three AM, four AM, five AM, six AM,
seven AM, eight AM, nine AM, ten AM, eleven AM, twelve PM, one PM, two PM,
three PM, four PM, five PM, six PM, seven PM, eight PM, nine PM, ten PM, eleven PM.

Tide heights: zero point five feet, one foot, two feet, three feet, four feet,
five feet, six feet, seven feet, eight feet, nine feet, ten feet.

Air quality index: zero, ten, twenty, fifty, one hundred, one hundred fifty,
two hundred, three hundred.
```

### Additional Reading Material Sources

1. **Project Gutenberg** - Public domain books: https://www.gutenberg.org/
2. **News sites** - Recent articles
3. **Wikipedia** - Varied topics
4. **LJ Speech Dataset prompts** - Common TTS training phrases

## Step 3: Recording Best Practices

### Do's
- ✅ Speak at your natural pace
- ✅ Use your natural voice (don't "perform")
- ✅ Maintain consistent distance from mic (6-12 inches)
- ✅ Take breaks every 10-15 minutes
- ✅ Re-record any mistakes immediately
- ✅ Record in 5-10 minute segments (easier to manage)

### Don'ts
- ❌ Rush through the text
- ❌ Overenunciate or use a "radio voice"
- ❌ Record when tired or hoarse
- ❌ Record with background noise (AC, traffic, fans)
- ❌ Move around while recording
- ❌ Eat/drink (except water) during session

## Step 4: Audio Processing

After recording, process your audio files:

### Using Audacity (Free)

1. **Open audio file**
2. **Normalize**: Effect > Normalize (keep default -1.0 dB)
3. **Noise Reduction** (if needed):
   - Select silent portion with room noise
   - Effect > Noise Reduction > Get Noise Profile
   - Select all (Ctrl+A)
   - Effect > Noise Reduction > OK
4. **Export as WAV**:
   - File > Export > Export Audio
   - Format: WAV (Microsoft)
   - Encoding: Signed 16-bit PCM
   - Sample Rate: 22050 Hz

### Segment Your Audio

Piper training works best with individual sentence recordings:

1. **Split into sentences** (1-15 seconds each)
2. **Name files**: `line_0001.wav`, `line_0002.wav`, etc.
3. **Create metadata file**: `metadata.csv` with transcriptions

**metadata.csv format:**
```csv
line_0001.wav|Good morning. It is seven thirty AM, Monday, January fifteenth.
line_0002.wav|Your location is San Francisco, California.
line_0003.wav|Today's weather will be partly cloudy.
```

## Step 5: Google Colab Training

### Access the Notebook

1. Go to: https://colab.research.google.com/github/rmcpantoja/piper/blob/master/notebooks/piper_multilingual_training_notebook.ipynb
2. **Sign in** with Google account
3. **Make a copy**: File > Save a copy in Drive

### Prepare Your Data

1. **Create a folder** in Google Drive: `piper_training`
2. **Upload your files**:
   - All WAV files (`line_0001.wav`, `line_0002.wav`, etc.)
   - `metadata.csv` file
3. **Organize**:
   ```
   piper_training/
   ├── wavs/
   │   ├── line_0001.wav
   │   ├── line_0002.wav
   │   └── ...
   └── metadata.csv
   ```

### Training Process

1. **Connect to GPU runtime**:
   - Runtime > Change runtime type
   - Hardware accelerator: GPU (T4 or better)
   - Click Save

2. **Mount Google Drive**:
   - Run the first cell to mount your Drive
   - Authorize access

3. **Configure training**:
   - Set path to your `piper_training` folder
   - Choose language: `en_US`
   - Set quality: `medium` (good balance of quality/speed)

4. **Start training**:
   - Run training cells sequentially
   - Training will take 6-12 hours
   - Colab will show progress

5. **Monitor progress**:
   - Loss should decrease over time
   - Check sample outputs periodically

6. **Export model**:
   - After training completes, run export cells
   - Downloads `.onnx` model file (~20-50MB)
   - Downloads `.onnx.json` config file

## Step 6: Test Your Model

Before integrating into the app, test your model:

### Local Testing (Optional)

1. **Install Piper**:
   ```bash
   pip install piper-tts
   ```

2. **Test model**:
   ```bash
   echo "Good morning. It is seven thirty AM." | piper \
     --model your_voice.onnx \
     --output_file test.wav
   ```

3. **Listen to output**: Open `test.wav`

## Step 7: Integration Planning

Once you have your trained model, integration into Almanac Alarm requires:

1. **Bundle model with APK** (~20-50MB increase in app size)
2. **Add Piper runtime** to React Native:
   - Native module to run ONNX inference
   - Audio playback integration
3. **Replace TTSService** to use Piper instead of system TTS
4. **Test on device** to ensure acceptable performance

**Estimated development time**: 4-8 hours

## Troubleshooting

### Poor Quality Output
- Record more data (aim for 45-60 minutes)
- Ensure consistent recording environment
- Check for background noise in recordings
- Verify microphone quality

### Training Timeout on Colab
- Colab free tier limits sessions to ~12 hours
- Train with smaller dataset initially
- Use `medium` quality instead of `high`
- Resume training from checkpoint if interrupted

### Model Too Large
- Reduce quality setting (`low` or `medium`)
- Quantize model after training (reduces size)

## Next Steps

After reading this guide:

1. ✅ Set up recording environment
2. ✅ Record 30-60 minutes of speech
3. ✅ Process and segment audio
4. ✅ Upload to Google Drive
5. ✅ Run Colab training notebook
6. ✅ Test model locally
7. ✅ Request integration help

---

## Resources

- **Piper GitHub**: https://github.com/rhasspy/piper
- **Colab Notebook**: https://colab.research.google.com/github/rmcpantoja/piper/blob/master/notebooks/piper_multilingual_training_notebook.ipynb
- **Audacity**: https://www.audacityteam.org/
- **Training Guide**: https://github.com/ZachB100/Piper-Training-Guide-with-Screen-Reader

## Questions?

Feel free to ask for help with any step of this process!

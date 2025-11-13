# Voice Training Data

This directory contains audio recordings and transcripts for training a custom Piper TTS voice model.

## Directory Structure

```
voice_training/
├── README.md              # This file
├── metadata.csv           # Training data index (filename|transcription)
├── audio/                 # Processed WAV files ready for training
│   ├── line_0001.wav
│   ├── line_0002.wav
│   └── ...
├── transcripts/           # Source text files
│   ├── blog_post_speedchat.txt
│   ├── sample_sentences.txt
│   └── ...
└── raw/                   # Raw unprocessed recordings (not uploaded to training)
    └── ...
```

## Training Samples

### 1. Blog Post: "The Untold History of Toontown's SpeedChat"
- **Source**: https://habitatchronicles.com/2007/03/the-untold-history-of-toontowns-speedchat-or-blockchattm-from-disney-finally-arrives/
- **Transcript**: `transcripts/blog_post_speedchat.txt`
- **Audio**: From podcast episode (link to be added)
- **Duration**: TBD
- **Purpose**: Natural narrative speech, varied vocabulary

### 2. Sample Sentences for Almanac
- **Source**: VOICE_RECORDING_GUIDE.md sample script
- **Transcript**: `transcripts/sample_sentences.txt`
- **Audio**: To be recorded
- **Purpose**: Domain-specific language (weather, dates, times, locations)

## metadata.csv Format

The metadata.csv file uses pipe-delimited format:
```
filename.wav|Transcription text here.
line_0001.wav|Good morning. It is seven thirty AM, Monday, January fifteenth.
line_0002.wav|Your location is San Francisco, California.
```

**Important:**
- One line per audio file
- No header row
- Pipe separator (|)
- Exact transcription matching audio
- Files must be in audio/ directory

## Audio Specifications

All audio files must meet these requirements:
- **Format**: WAV (Microsoft)
- **Sample Rate**: 22050 Hz
- **Channels**: Mono
- **Bit Depth**: 16-bit PCM
- **Duration**: 1-15 seconds per segment
- **Normalized**: -1.0 dB

## Processing Workflow

1. **Record** raw audio in quiet environment
2. **Save** to `raw/` directory
3. **Process** in Audacity:
   - Normalize to -1.0 dB
   - Apply noise reduction if needed
   - Export as 22050 Hz, 16-bit PCM, Mono WAV
4. **Segment** into individual sentences (1-15 seconds each)
5. **Save** processed files to `audio/` with sequential naming
6. **Update** `metadata.csv` with filename and exact transcription
7. **Verify** alignment and quality

## Training Preparation

Once all files are ready:
1. Verify all audio files are in `audio/` directory
2. Confirm `metadata.csv` has entries for all files
3. Check total recording time (target: 30-60 minutes)
4. Upload to Google Drive for Colab training
5. Follow training instructions in PIPER_INTEGRATION_PLAN.md

## Status

- [ ] Blog post transcript created
- [ ] Blog post audio obtained and processed
- [ ] Sample sentences transcript created
- [ ] Sample sentences recorded and processed
- [ ] metadata.csv populated
- [ ] Ready for training

---

For detailed recording and processing instructions, see: `/VOICE_RECORDING_GUIDE.md`
For integration instructions after training, see: `/PIPER_INTEGRATION_PLAN.md`
For workflow strategy, see: `/VOICE_CUSTOMIZATION_WORKFLOW.md`

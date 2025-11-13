# Voice Training Data Collection Status

Last updated: 2025-11-11

## Overview

This document tracks the progress of voice training data collection for the custom Piper TTS model.

**Target**: 30-60 minutes of varied speech
**Current Total**: ~13-17 minutes (2 samples complete)

---

## Training Sample #1: Blog Post - "Toontown's SpeedChat"

**Status**: ✅ Complete - Ready for training

**Details**:
- **Source URL**: https://habitatchronicles.com/2007/03/the-untold-history-of-toontowns-speedchat-or-blockchattm-from-disney-finally-arrives/
- **Transcript File**: `transcripts/blog_post_speedchat.txt` ✅
- **Audio Source**: Podcast episode S01E08 - "Disney's HercWorld, ToonTown, and BlockChat™"
- **Audio URL**: https://socialmediaclarity.net/podcasts/138068-disney-s-hercworld-toontown-and-blockchat-tm-s01e08.mp3
- **Audio File**: `audio/speedchat.wav` ✅
- **Processing**: Normalized, noise reduced, intro/outro trimmed ✅
- **Format**: WAV, 22050 Hz, Mono, 16-bit PCM ✅
- **Segmentation**: Using single file approach (Piper supports longer samples)
- **Duration**: ~8-12 minutes
- **Text Length**: ~1,350 words
- **metadata.csv**: Entry added ✅

**Completed Steps**:
1. ✅ Transcript complete
2. ✅ Downloaded podcast audio file locally
3. ✅ Extracted relevant segment from podcast (trimmed intro/outro music and preamble)
4. ✅ Processed audio in Audacity (normalize, noise reduction)
5. ✅ Saved as single file (speedchat.wav) - auto-segmentation not needed
6. ✅ Added entry to metadata.csv

**Purpose**: Natural narrative speech with varied vocabulary, storytelling tone

---

## Training Sample #2: Almanac Sample Sentences

**Status**: ✅ Complete - Ready for training

**Details**:
- **Source**: VOICE_RECORDING_GUIDE.md sample script
- **Transcript File**: `transcripts/sample_sentences.txt` ✅
- **Audio File**: `audio/almanac.wav` ✅
- **Processing**: Normalized, noise reduced ✅
- **Format**: WAV, 22050 Hz, Mono, 16-bit PCM ✅
- **Segmentation**: Using single file approach (Piper supports longer samples)
- **Duration**: ~5 minutes
- **metadata.csv**: Entry added ✅

**Completed Steps**:
1. ✅ Set up recording environment
2. ✅ Recorded sample sentences following transcript
3. ✅ Processed audio in Audacity (normalize, noise reduction)
4. ✅ Saved as single file (almanac.wav) - auto-segmentation not needed
5. ✅ Added entry to metadata.csv

**Purpose**: Domain-specific language (weather, dates, times, locations, bird names, Bible verses)

---

## Training Sample #3: Additional Content (Future)

**Ideas for additional training data**:
- More podcast episodes
- Reading news articles
- Reading book chapters
- Weather reports
- Bible verses
- Bird descriptions

**Status**: 🔵 Planning

---

## Data Quality Checklist

### Audio Requirements
- [ ] All files are WAV format
- [ ] Sample rate: 22050 Hz
- [ ] Bit depth: 16-bit PCM
- [ ] Channels: Mono
- [ ] Normalized to -1.0 dB
- [ ] No background noise
- [ ] Each segment: 1-15 seconds
- [ ] Clear, natural speech

### Metadata Requirements
- [ ] All audio files have metadata entries
- [ ] Transcriptions are exact (including numbers spoken as words)
- [ ] Pipe delimiter (|) used correctly
- [ ] No header row in metadata.csv
- [ ] File paths match audio directory structure

---

## Recording Environment Setup

**Required Equipment**:
- ✅ USB microphone (recommended) or built-in mic
- ✅ Quiet room
- ✅ Computer with Audacity installed

**Optimal Conditions**:
- No background noise (AC, traffic, fans)
- Consistent microphone distance (6-12 inches)
- Good time of day (not tired or hoarse)
- Water available (no other food/drink)

---

## Next Actions

### Immediate (Today)
1. **Obtain blog post transcript** - User will provide text starting with "In 1992"
2. **Get podcast audio link** - User will share after transcript

### Near-term (This Week)
3. **Record sample sentences** - Using transcripts/sample_sentences.txt
4. **Process audio files** - Audacity workflow
5. **Create metadata.csv entries** - For all processed audio

### Future (Next Week)
6. **Review total duration** - Aim for 30-60 minutes total
7. **Identify gaps** - What additional content is needed?
8. **Record additional content** - If needed to reach time target
9. **Prepare for Google Colab training** - Upload to Google Drive

---

## Training Data Statistics

| Sample | Status | Duration | Segments | Notes |
|--------|--------|----------|----------|-------|
| Blog Post | ✅ Complete | ~8-12 min | 1 | Single file approach |
| Sample Sentences | ✅ Complete | ~5 min | 1 | Single file approach |
| **TOTAL** | **~30%** | **~13-17 min** | **2** | **Target: 30-60 min** |

---

## Training Readiness

**Current Status**: 🟡 Minimum Viable - Can Start Training

**Requirements for Training**:
- [x] Total audio duration: 13-17 minutes (minimum viable, more recommended)
- [x] All audio files processed and in audio/ directory
- [x] metadata.csv complete and accurate
- [x] Audio quality verified
- [ ] Google Drive folder created
- [ ] All files uploaded to Google Drive
- [ ] Colab notebook prepared

**Note**: Current duration (13-17 min) is below the recommended 30-60 minutes, but sufficient for initial training. Model quality will improve with more data.

**Next Step**: Upload files to Google Drive and begin Colab training, or record additional samples for better quality.

---

## Resources

- **Recording Guide**: `/VOICE_RECORDING_GUIDE.md`
- **Integration Plan**: `/PIPER_INTEGRATION_PLAN.md`
- **Workflow Strategy**: `/VOICE_CUSTOMIZATION_WORKFLOW.md`
- **Training Notebook**: https://colab.research.google.com/github/rmcpantoja/piper/blob/master/notebooks/piper_multilingual_training_notebook.ipynb
- **Piper GitHub**: https://github.com/rhasspy/piper
- **Audacity Download**: https://www.audacityteam.org/download/

---

## Notes & Observations

### 2025-11-11 (Initial Setup)
- Created voice_training directory structure
- Set up metadata.csv template
- Created transcript placeholders for both training samples
- Added complete blog post transcript (1,350 words)
- Documented podcast audio URL
- Sample sentences ready for recording
- Using podcast audio for blog post sample (efficient reuse of existing recording)
- Plan to separately record sample sentences for domain-specific vocabulary

### 2025-11-11 (Sample #1 Processing Complete)
- User processed speedchat.wav in Audacity (CLI)
- Normalized and noise reduced audio
- Trimmed intro/outro music and preamble
- Exported as WAV 22050 Hz, Mono, 16-bit PCM
- Decided against auto-segmentation (Piper supports longer samples)
- Created metadata.csv entry for single file training approach
- Sample #1 complete: ~8-12 minutes of natural narrative speech
- Ready to proceed with Sample #2 (domain-specific sentences)

### 2025-11-11 (Sample #2 Complete - Training Ready!)
- User recorded almanac sample sentences (CLI)
- Processed almanac.wav in Audacity
- Normalized and noise reduced audio
- Exported as WAV 22050 Hz, Mono, 16-bit PCM
- Used single file approach (no segmentation)
- Created metadata.csv entry for almanac.wav
- Sample #2 complete: ~5 minutes of domain-specific vocabulary
- Total training data: ~13-17 minutes across 2 samples
- Minimum viable dataset ready - can begin training or add more samples for better quality

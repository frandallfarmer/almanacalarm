# Voice Training Data Collection Status

Last updated: 2025-11-11

## Overview

This document tracks the progress of voice training data collection for the custom Piper TTS model.

**Target**: 30-60 minutes of varied speech
**Current Total**: 0 minutes

---

## Training Sample #1: Blog Post - "Toontown's SpeedChat"

**Status**: 🔴 In Progress - Awaiting transcript and audio

**Details**:
- **Source URL**: https://habitatchronicles.com/2007/03/the-untold-history-of-toontowns-speedchat-or-blockchattm-from-disney-finally-arrives/
- **Transcript File**: `transcripts/blog_post_speedchat.txt`
- **Audio Source**: Podcast episode
- **Audio File**: [Link pending]
- **Estimated Duration**: Unknown
- **Text starts with**: "In 1992..."

**Next Steps**:
1. ⏳ Paste blog post text into transcript file
2. ⏳ Obtain podcast audio file
3. ⏳ Extract relevant segment from podcast
4. ⏳ Process audio in Audacity
5. ⏳ Segment into sentences
6. ⏳ Add entries to metadata.csv

**Purpose**: Natural narrative speech with varied vocabulary

---

## Training Sample #2: Almanac Sample Sentences

**Status**: 🔴 Not Started - To be recorded

**Details**:
- **Source**: VOICE_RECORDING_GUIDE.md sample script
- **Transcript File**: `transcripts/sample_sentences.txt` ✅
- **Audio Source**: New recording (to be made)
- **Estimated Duration**: ~5-10 minutes
- **Number of Sentences**: ~25 distinct phrases

**Next Steps**:
1. ⏳ Set up recording environment (quiet room, USB mic)
2. ⏳ Record sample sentences following transcript
3. ⏳ Process audio in Audacity
4. ⏳ Segment into individual sentences
5. ⏳ Name files: line_0001.wav, line_0002.wav, etc.
6. ⏳ Add entries to metadata.csv

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
| Blog Post | 🔴 Pending | ? min | ? | Awaiting transcript & audio |
| Sample Sentences | 🔴 Not Started | ~5-10 min | ~25 | Ready to record |
| **TOTAL** | **0%** | **0 min** | **0** | **Target: 30-60 min** |

---

## Training Readiness

**Current Status**: 🔴 Not Ready

**Requirements for Training**:
- [ ] Total audio duration: 30+ minutes
- [ ] All audio files processed and in audio/ directory
- [ ] metadata.csv complete and accurate
- [ ] Audio quality verified
- [ ] Google Drive folder created
- [ ] All files uploaded to Google Drive
- [ ] Colab notebook prepared

**Estimated Time to Training Ready**: 1-2 weeks (depending on recording schedule)

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

### 2025-11-11
- Created voice_training directory structure
- Set up metadata.csv template
- Created transcript placeholders for both training samples
- Blog post transcript awaiting user input
- Sample sentences ready for recording
- Using podcast audio for blog post sample (efficient reuse of existing recording)
- Plan to separately record sample sentences for domain-specific vocabulary

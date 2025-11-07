# Podcast Training Data Processing - Archive

**Date:** 2025-10-30
**Status:** ABANDONED - Forced alignment tools too complex for this environment

## Summary

Attempted to extract Randy's voice segments from multi-speaker podcast audio files to create Piper TTS training data. The approach required forced alignment to accurately match transcript text to audio timestamps, but all available tools had dependency issues.

## Problem Statement

- **Goal:** Extract only Randy's voice segments from multi-speaker podcast episodes
- **Source:** 28 MP3 podcast files with HTML transcripts (speaker-labeled)
- **Desired output:** WAV files (22050Hz mono 16-bit) + metadata.csv for Piper TTS training
- **Key challenge:** Multi-speaker audio requires precise alignment to avoid mixing voices

## Approach Taken

### 1. Initial Script Development

Created `scripts/prepare_podcast_training_data.py` to:
- Download podcasts from remote server (`scripts/download_podcasts.sh`)
- Parse HTML transcripts to extract speaker-labeled segments
- Match audio files to transcripts using `<source>` tags in HTML
- Filter to only extract Randy's segments
- Convert audio to Piper-compatible format

**Issues encountered:**
- Word-count-based timing estimation completely failed
- Without precise alignment, extracted audio didn't match transcript text
- Utterance 11 test played wrong audio segment (waitress story instead of calendar apps text)

### 2. Forced Alignment Attempts

Tried multiple forced alignment tools:

#### Montreal Forced Aligner (MFA)
- **Status:** Installation failed
- **Problem:** Requires `kalpy` C++ bindings which need `cmake` and `espeak` libraries
- **Blocker:** No sudo access to install system dependencies
- Installed MFA but hit `ModuleNotFoundError: No module named '_kalpy'`
- Requires conda for proper installation (not pip)

#### aeneas
- **Status:** Installation failed
- **Problem:** Requires `espeak` library (`-lespeak` during compilation)
- **Blocker:** No sudo access to install `libespeak-dev`

#### whisper-timestamped
- **Status:** Started installing but abandoned
- **Problem:** ~4GB installation size, too large for available disk space
- User requested removal due to disk space constraints

### 3. Decision to Abandon

All forced alignment tools have system-level dependencies requiring sudo access:
- MFA needs cmake, Kaldi libraries
- aeneas needs espeak development libraries
- Whisper needs massive disk space
- Even pyannote-audio would require significant resources

Without forced alignment, word-count estimation produces incorrect audio segments that don't match the transcript text, making the training data unusable.

## Scripts Developed

### `scripts/download_podcasts.sh`
Downloads MP3 and HTML files from remote droplet server.

```bash
REMOTE_AUDIO_DIR="/opt/web-server/public/podcasts/"
REMOTE_TRANSCRIPT_DIR="/opt/web-server/public/episodes/"
LOCAL_DIR="/home/randy/almanacalarm/podcast_source"
```

Successfully downloaded 28 episodes (~210MB).

### `scripts/prepare_podcast_training_data.py`
Main processing script (512 lines) that:
- Extracts speaker segments from HTML (`<p class="MsoNormal"><strong>Speaker</strong>: text`)
- Matches audio to transcripts via HTML `<source>` tags
- Filters to target speaker (Randy)
- Estimates timing based on word count (FAILED - inaccurate)
- Exports WAV chunks with metadata.csv

**Key functions:**
- `get_audio_filename_from_html()`: Matches transcripts to audio files
- `extract_speaker_segments()`: Parses speaker-labeled HTML
- `estimate_speaker_time()`: Word-based timing (doesn't work for multi-speaker)
- `split_audio_by_speaker_segments()`: Extracts audio chunks

### `scripts/simple_audio_alignment.py`
Attempted silence-based speech detection using pydub.
- Found 147 segments in test audio
- Too granular, doesn't separate speakers
- Not viable for multi-speaker extraction

### `scripts/setup_training_deps.sh`
Automated dependency installation (updated for pip3 on WSL/Debian).

### `scripts/README_TRAINING_DATA.md`
Documentation for the podcast processing workflow.

## Test Results

**Episode 1 extraction test (limit=1):**
- Successfully matched audio to transcript
- Extracted 7 utterances attributed to Randy
- **Problem:** Audio didn't match text (utterance 11 played wrong segment)
- Root cause: Word-count timing estimation failed for multi-speaker conversations

## Lessons Learned

1. **Forced alignment is essential** for multi-speaker audio segmentation
2. **Word-count estimation fails** when speakers don't talk in sequential blocks
3. **System dependencies** (espeak, cmake, Kaldi) require sudo access
4. **Conda vs pip:** Complex audio tools often require conda for proper installation
5. **Disk space matters:** Whisper-based solutions can be 4GB+

## Alternative Approaches (Not Pursued)

1. **Manual recording:** Record 30-60 minutes of custom voice samples
   - Follow `VOICE_RECORDING_GUIDE.md`
   - More control over content and quality
   - No speaker separation needed

2. **API-based solutions:** AssemblyAI, Rev.ai for speaker diarization
   - Costs money
   - Requires uploading podcast files
   - May work better than local tools

3. **Conda environment:** Install MFA properly via conda-forge
   - Requires conda setup
   - Larger disk space footprint
   - More reliable than pip for audio tools

## Cleanup Performed

- Removed `podcast_source/` directory (~210MB)
- Removed `piper_training_data_test/` directory
- Uninstalled MFA and dependencies
- Cleared pip cache (88 files)
- Removed test scripts

## Files to Keep

- `scripts/prepare_podcast_training_data.py` (archive reference)
- `scripts/download_podcasts.sh` (archive reference)
- `scripts/simple_audio_alignment.py` (archive reference)
- This archive document

## Recommendation

**Use manual voice recording** following `VOICE_RECORDING_GUIDE.md` instead of podcast extraction. It's simpler, produces better quality training data, and avoids the forced alignment complexity.

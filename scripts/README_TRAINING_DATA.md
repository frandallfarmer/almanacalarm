# Podcast to Piper Training Data - Processing Guide

This guide walks through converting your existing podcast audio and transcripts into training data for Piper TTS.

## Overview

You have podcast episodes with:
- **Audio**: MP3 files on remote server `droplet:/opt/web-server/public/`
- **Transcripts**: HTML files with speaker labels (`<strong>Randy</strong>:`, etc.)

**Key Feature**: The script automatically extracts **ONLY your voice** (Randy's segments), filtering out other speakers like Scott, Marc, and Bryce.

We'll process these into:
- **WAV files**: Individual sentences at 22050Hz mono (Piper format) - **Randy's voice only**
- **metadata.csv**: Sentence text aligned with audio files

## Prerequisites

### Quick Setup (Recommended)

Run the automated setup script:

```bash
./scripts/setup_training_deps.sh
```

This will install:
- ffmpeg (audio processing)
- Python packages: pydub, beautifulsoup4, lxml, nltk
- NLTK punkt tokenizer data

### Manual Setup (Alternative)

If you prefer to install manually:

```bash
# 1. Install system packages
sudo apt update
sudo apt install ffmpeg python3-pip

# 2. Install Python dependencies
pip3 install pydub beautifulsoup4 lxml nltk

# 3. Download NLTK data
python3 -c "import nltk; nltk.download('punkt')"
```

### SSH Access to Droplet

Ensure you can SSH to your droplet server:
```bash
ssh droplet
```

## Step 1: Download Podcast Files

Download all MP3 and HTML files from your remote server:

```bash
cd /home/randy/almanacalarm
./scripts/download_podcasts.sh
```

This will:
- Create `podcast_source/` directory
- Download all `.mp3` files
- Download all `.html` and `.htm` files
- Display summary of downloaded files

**Expected location**: `/home/randy/almanacalarm/podcast_source/`

## Step 2: Process Podcasts into Training Data

Run the processing script to extract **only Randy's voice**:

```bash
python scripts/prepare_podcast_training_data.py \
  --audio-dir ./podcast_source \
  --transcript-dir ./podcast_source \
  --output-dir ./piper_training_data \
  --speaker Randy
```

**Note**: The `--speaker Randy` parameter tells the script to extract only segments where Randy is speaking, automatically filtering out Scott, Marc, Bryce, and other speakers.

### What This Does

For each podcast episode:

1. **Parse HTML transcript** → Extract speaker-labeled segments
2. **Identify speakers** → Detect Randy, Scott, Marc, Bryce, etc.
3. **Filter to target speaker** → Keep only Randy's segments
4. **Estimate timing** → Calculate when Randy is speaking based on word count
5. **Extract audio** → Pull only Randy's voice from the MP3
6. **Split into sentences** → Using NLTK sentence tokenizer
7. **Clean sentences** → Remove URLs, emails, special chars
8. **Filter quality** → Keep 3-30 word sentences
9. **Convert format** → WAV 22050Hz mono 16-bit
10. **Generate metadata** → Create `metadata.csv`

**Output**: You'll see detailed logging showing:
- Total segments found per speaker
- Which segments are being extracted (Randy ← TARGET)
- Number of audio chunks generated

### Processing Parameters

The script automatically:
- Estimates sentence timing based on word count (150 WPM)
- Scales timing to match actual audio duration
- Adds 200ms buffer before/after each sentence
- Numbers files sequentially: `line_0001.wav`, `line_0002.wav`, etc.

### Output Structure

```
piper_training_data/
├── wavs/
│   ├── line_0001.wav
│   ├── line_0002.wav
│   ├── line_0003.wav
│   └── ...
└── metadata.csv
```

**metadata.csv format**:
```csv
line_0001.wav|Good morning. It is seven thirty AM, Monday, January fifteenth.
line_0002.wav|Your location is San Francisco, California.
line_0003.wav|Today's weather will be partly cloudy.
```

## Step 3: Review & Quality Check

### Check Total Duration

```bash
# Count WAV files
ls piper_training_data/wavs/*.wav | wc -l

# Check total size
du -sh piper_training_data/
```

**Target**: 30-60 minutes of audio (aim for 500-2000 sentences)

### Sample Audio Quality

Listen to a few samples to verify quality:

```bash
# Play random samples
for i in {1..5}; do
  file=$(ls piper_training_data/wavs/*.wav | shuf -n 1)
  echo "Playing: $file"
  aplay "$file"  # or use `paplay` on some systems
done
```

### Review metadata.csv

```bash
# Show first 10 lines
head -10 piper_training_data/metadata.csv

# Count total lines
wc -l piper_training_data/metadata.csv
```

### Check for Issues

```bash
# Find very short sentences (< 5 words - may indicate problems)
python -c "
import csv
with open('piper_training_data/metadata.csv', 'r') as f:
    reader = csv.reader(f, delimiter='|')
    for row in reader:
        if len(row[1].split()) < 5:
            print(f'{row[0]}: {row[1]}')
" | head -20
```

## Step 4: Upload to Google Drive

For Colab training, upload your prepared data:

1. **Create folder** in Google Drive: `piper_training`
2. **Upload folder** `piper_training_data/` to Drive
3. **Verify structure**:
   ```
   Google Drive/piper_training/
   ├── wavs/
   │   └── (all .wav files)
   └── metadata.csv
   ```

## Advanced Options

### Process Specific Podcasts

```bash
# Process only specific files
python scripts/prepare_podcast_training_data.py \
  --audio-dir ./podcast_source \
  --transcript-dir ./podcast_source \
  --output-dir ./piper_training_data \
  --audio-ext .mp3 \
  --transcript-ext .html
```

### Adjust Sentence Length Filters

Edit `prepare_podcast_training_data.py`, line ~82:

```python
def is_valid_sentence(self, sentence: str, min_words: int = 3, max_words: int = 30):
```

Change `min_words` and `max_words` to adjust filtering:
- **Stricter** (5-25 words): Better quality, less data
- **Looser** (2-40 words): More data, variable quality

### Different Transcript Format

If your HTML has specific structure, you can customize extraction in `extract_text_from_html()` method.

## Troubleshooting

### No sentences extracted

**Problem**: HTML parsing didn't find text

**Solution**: Check HTML structure manually:
```bash
head -50 podcast_source/your_podcast.html
```

Update `extract_text_from_html()` to target specific HTML tags (e.g., `<p>`, `<div class="transcript">`).

### Audio timing is off

**Problem**: Sentences don't align with audio chunks

**Solution**: Adjust speaking rate estimate:
```python
# Line ~100 in script
def estimate_sentence_duration(self, sentence: str, words_per_minute: float = 150):
```

Try values: 120-180 WPM depending on your speaking pace.

### Files too large

**Problem**: Generated data > 10GB

**Solution**:
- Process fewer podcasts (keep best quality ones)
- Tighten sentence filters (5-20 words)
- Target 30-45 minutes total audio instead of 60

### Different audio/transcript names

**Problem**: MP3 and HTML don't have matching basenames

**Solution**: Rename files to match, or modify the script at line ~240:
```python
transcript_file = transcript_path / audio_file.with_suffix(transcript_ext).name
```

## Expected Results

From typical podcast processing:
- **Input**: 5-10 podcast episodes (30-90 min total)
- **Output**: 500-2000 sentence chunks
- **Size**: 2-5 GB of WAV files
- **Quality**: Clean, sentence-level audio with accurate transcriptions

## Next Steps

After generating training data:

1. ✅ Upload to Google Drive
2. ✅ Follow `VOICE_RECORDING_GUIDE.md` Step 5 (Google Colab Training)
3. ✅ Train model (6-12 hours automated)
4. ✅ Test model with Piper CLI
5. ✅ Follow `PIPER_INTEGRATION_PLAN.md` for app integration

## Questions?

If you encounter issues processing your podcasts, check:
- HTML structure of transcripts
- Audio quality of MP3s
- Filename matching between audio and transcripts

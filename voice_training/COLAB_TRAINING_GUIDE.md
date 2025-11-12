# Google Colab Training Guide - First Time User

This guide walks you through training your custom Piper TTS voice model using Google Colab (completely free!).

## ⚠️ CRITICAL: Audio Segmentation Required

**IMPORTANT**: The audio files in this repo (speedchat.wav, almanac.wav) are **TOO LONG** for training on free Colab GPUs. You **MUST** segment them into **5-15 second clips** before training, or you will encounter "CUDA out of memory" errors.

**Do NOT attempt to train with the current long files.** See "Audio Preparation Requirements" section below.

## What is Google Colab?

Google Colab is a free cloud-based coding environment that runs in your web browser. It gives you access to powerful GPU computers for training machine learning models without needing any special hardware.

**Think of it like**: Google Docs, but for running code instead of writing documents.

## What You'll Do

1. **Segment audio files** into 5-15 second clips (REQUIRED)
2. Upload segmented audio files to Google Drive
3. Open a pre-made training notebook
4. Configure and run training cells
5. Wait 6-12 hours while it trains
6. Download your trained voice model

## Prerequisites

- ✅ Google account (Gmail)
- ✅ ~500MB free space in Google Drive (for segmented files)
- ✅ Audio segmentation tool (Audacity, FFmpeg, or Python script)
- ✅ Training files prepared:
  - Multiple WAV files (5-15 seconds each)
  - metadata.csv with entries for each segment

**Note**: Current files (speedchat.wav, almanac.wav) need segmentation before use.

---

## Step 1: Prepare Your Google Drive (5 minutes)

### 1.1 Create Folder Structure

1. Go to https://drive.google.com
2. Click **"New"** → **"New folder"**
3. Name it: `piper_training`
4. Open the folder
5. Inside `piper_training`, create a subfolder named `wavs`

**Your structure should look like:**
```
Google Drive/
└── piper_training/
    ├── wavs/           (you'll upload audio files here)
    └── metadata.csv    (you'll upload this here)
```

### 1.2 Upload Your Files

From your local machine (`almanacalarm/voice_training/`):

**Upload to `piper_training/wavs/`:**
- speedchat.wav
- almanac.wav

**Upload to `piper_training/` (main folder):**
- metadata.csv

**How to upload:**
- Drag and drop files into Google Drive folders
- Or click **"New"** → **"File upload"**

---

## Step 1.5: Audio Preparation Requirements ⚠️ CRITICAL

**Before uploading to Google Drive, you MUST segment your audio files.**

### Why Segmentation is Required

Free Colab GPUs (T4) have ~15GB memory, but long audio files consume too much GPU RAM during training:
- **5+ minute files**: Will fail with "CUDA out of memory" even at batch_size=1
- **1-2 minute files**: May work but risky
- **5-15 second files**: Optimal for free GPU training

### Segmentation Options

**Option 1: Audacity (GUI)**
1. Open your audio file in Audacity
2. Select 5-15 second segments
3. File → Export → Export Selected Audio
4. Save as WAV, 22050 Hz, Mono, 16-bit PCM
5. Repeat for each segment

**Option 2: FFmpeg (Command Line)**
```bash
# Segment audio into 10-second chunks
ffmpeg -i speedchat.wav -f segment -segment_time 10 -c copy speedchat_%03d.wav
```

**Option 3: Python Script** (coming soon)

### Update metadata.csv

For each segment, add an entry:
```
speedchat_001.wav|In 1992, I co-founded a company with Chip Morningstar and Douglas Crockford named Electric Communities.
speedchat_002.wav|We initially did a lot of consulting for various media companies that were looking to leverage the emerging online gaming industry.
speedchat_003.wav|One of those companies was Disney.
```

**Important**: Each line must match the exact transcript for that audio segment.

---

## Step 2: Open the Training Notebook (2 minutes)

### 2.1 Access the Notebook

**Use this notebook (tested and working):**
👉 https://colab.research.google.com/github/natlamir/ProjectFiles/blob/main/Piper/Piper_Training.ipynb

**DO NOT use the official rmcpantoja notebook** - it has missing dependencies (piper-phonemize) that prevent training from working.

### 2.2 Make Your Own Copy

- Click **"File"** → **"Save a copy in Drive"**
- This creates YOUR personal copy you can modify
- The copy will open automatically

**Why?** The original is read-only. Your copy lets you run and modify the code.

---

## Step 3: Connect to GPU Runtime (1 minute)

Before running any code, you need a GPU computer:

1. Click **"Runtime"** in the top menu
2. Select **"Change runtime type"**
3. Under "Hardware accelerator", choose **"GPU"** (or "T4 GPU" if available)
4. Click **"Save"**

**What this does:** Gives you a free powerful computer for training (worth ~$0.50/hour if you paid for it!)

---

## Step 4: Mount Google Drive (1 minute)

This connects your Google Drive to the notebook so it can access your files.

### 4.1 Find the Mount Cell

Look for a code cell near the top that says something like:
```python
from google.colab import drive
drive.mount('/content/drive')
```

### 4.2 Run It

- Click the **play button ▶** on the left of the cell
- A popup will appear asking for permission
- Click **"Connect to Google Drive"**
- Choose your Google account
- Click **"Allow"**

**You'll see:** `Mounted at /content/drive` when it's done

---

## Step 5: Configure Training Parameters (5 minutes)

The natlamir notebook uses form-based configuration. Fill in these fields:

### 5.1 Dataset Format

Select: **`ljspeech`** (standard format for custom voice training)

### 5.2 Language

Select: **`en_US`** (English - United States)

### 5.3 Dataset Path

Enter: `/content/drive/MyDrive/piper_training`

This is where you uploaded your wavs folder and metadata.csv.

### 5.4 Training Parameters

**Recommended settings for first training:**
- **Batch Size**: `8` (or `4` if you get memory errors)
- **Quality**: `medium` (good balance)
- **Epochs**: `100` (will take 6-12 hours)

**If you get "CUDA out of memory" errors:**
1. First, ensure audio is segmented (5-15 seconds)
2. If still failing, reduce batch_size to `4` or `2`
3. Add flags: `--data.validation_split 0.0 --data.num_test_examples 0`

### 5.5 Optional: Model Name

Give your model a name like `randy_farmer_voice` or leave default.

---

## Step 6: Run Training Cells (Click and Wait)

### 6.1 Install Dependencies

Find and run the cell that installs required packages:
- Click ▶ on the install cell
- Wait for it to finish (shows green checkmark ✓)
- This takes ~2-3 minutes

### 6.2 Prepare Data

Run the data preparation cell:
- This validates your audio files
- Checks metadata.csv format
- Should show: "Found 2 audio files"

### 6.3 Start Training

Run the training cell:
- This is the long one (6-12 hours depending on quality setting)
- You'll see progress updates

**Important:**
- Keep the browser tab open (can minimize it)
- Don't close the browser completely
- Computer can go to sleep, but browser should stay open
- If you accidentally close it, you can reconnect (Colab saves progress)

**What you'll see during training:**
```
Epoch 1/100: loss=2.456
Epoch 2/100: loss=2.234
Epoch 3/100: loss=2.087
...
```

**Goal:** Loss should decrease over time (lower is better)

---

## Step 7: Monitor Progress

### 7.1 Check Loss Values

- Loss should gradually decrease
- Starting loss: ~2.5-3.0
- Target final loss: ~0.5-1.0 (lower is better)

### 7.2 Listen to Samples (Optional)

Some notebooks generate sample audio during training:
- Click the audio player icons if they appear
- Hear how your voice improves over time

### 7.3 Training Complete

When done, you'll see:
```
Training complete!
Saving model...
Model saved to: /content/piper_model/
```

---

## Step 8: Export Your Model (5 minutes)

### 8.1 Find the Export Cell

Run the cell that exports the model files.

### 8.2 Download Files

You need these files:
- `your_voice.onnx` (~20-50MB) - The actual model
- `your_voice.onnx.json` - Configuration file
- `tokens.txt` - Phoneme tokens (if separate)
- `espeak-ng-data/` folder (if needed)

**How to download:**
- Files appear in the Colab file browser (left sidebar)
- Right-click → Download
- Or use the notebook's download cell if provided

### 8.3 Alternative: Save to Google Drive

Some notebooks offer to save directly to Drive:
```python
!cp /content/model/* /content/drive/MyDrive/piper_model_output/
```

If this runs, your model will be in a `piper_model_output` folder in Drive.

---

## Step 9: Test Your Model (Optional)

### 9.1 Quick Test in Colab

Some notebooks include a test cell:
```python
!echo "Good morning. Today is a beautiful day." | piper \
  --model your_voice.onnx \
  --output_file test.wav
```

### 9.2 Play the Test Audio

- Click the audio player that appears
- Hear your custom voice!

---

## Common Issues & Solutions

### Issue: "CUDA out of memory" (MOST COMMON)

**Error message:**
```
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 4.83 GiB
```

**Cause:** Audio files are too long for GPU memory during training

**Solution:**
1. **Segment audio files** into 5-15 second clips (see Step 1.5)
2. Update metadata.csv with individual segments
3. Restart notebook and try again

**This is the #1 reason training fails on free Colab.** Do NOT skip audio segmentation.

### Issue: "No training batches available"

**Error message:**
```
INFO:piper_train.vits.lightning:No training batches available
```

**Cause:** Validation split consumed all data (happens with very few samples)

**Solution:**
Add these flags when running training:
```bash
--data.validation_split 0.0 --data.num_test_examples 0
```

### Issue: "ModuleNotFoundError: No module named 'piper_phonemize'"

**Cause:** Using the wrong notebook (rmcpantoja version)

**Solution:**
- Use the natlamir notebook instead: https://colab.research.google.com/github/natlamir/ProjectFiles/blob/main/Piper/Piper_Training.ipynb
- The official notebook has broken dependencies

### Issue: "Runtime disconnected"

**Cause:** Colab has usage limits (~12 hours per session)

**Solution:**
- Notebook auto-saves checkpoints
- Click "Reconnect"
- Training resumes from last checkpoint

### Issue: "Can't find metadata.csv"

**Cause:** File path is wrong or Drive not mounted

**Solution:**
1. Verify Drive is mounted: Look for "Mounted at /content/drive" message
2. Check path: `/content/drive/MyDrive/piper_training`
3. Verify files uploaded correctly in Google Drive

### Issue: Training loss not decreasing

**Cause:**
- Not enough training data
- Audio quality issues
- Mismatch between audio and transcript

**Solution:**
- Let it train longer (sometimes takes 20-30 epochs to start improving)
- If loss stays above 2.0 after 50 epochs, check audio/transcript alignment
- Record more training data (aim for 30-60 minutes total)

### Issue: Generated voice sounds robotic

**Cause:**
- Insufficient training data (13-17 min is minimal)
- Training stopped too early

**Solution:**
- Train longer if loss is still decreasing
- Record more samples and retrain (30-60 min recommended)
- Try higher quality setting

---

## Expected Timeline

| Stage | Duration | Can Leave? |
|-------|----------|-----------|
| Setup & Upload | 5-10 min | No |
| Mount Drive & Config | 5 min | No |
| Install Dependencies | 2-3 min | No |
| Training | 6-12 hours | Yes (minimize tab) |
| Export & Download | 5 min | No |
| **Total Active Time** | **~20-30 min** | |
| **Total Calendar Time** | **6-12 hours** | |

---

## What to Do While Training

✅ You can:
- Minimize the browser tab
- Use other browser tabs
- Let your computer go to sleep
- Do other work

❌ Don't:
- Close the browser completely
- Sign out of Google
- Clear browser cache/cookies
- Force-close the tab

**Tip:** Pin the Colab tab so you don't accidentally close it!

---

## After Training: Next Steps

Once you have your trained model files:

1. **Test locally** (optional):
   ```bash
   echo "Good morning" | piper --model your_voice.onnx --output test.wav
   ```

2. **Integrate into app**:
   - Follow `/PIPER_INTEGRATION_PLAN.md`
   - Copy model files to React Native app
   - Update TTSService to use Piper

3. **Refine if needed**:
   - If quality isn't good enough, record more samples
   - Retrain with more data (30-60 minutes recommended)

---

## Cost: $0 (Free!)

- Google Colab: Free GPU access
- Google Drive: ~30MB usage (free tier is 15GB)
- Training time: Free (with usage limits)

**Fair Usage Limits:**
- ~12 hours per session
- Can run multiple sessions per day
- May get temporary limits if heavily used

---

## Help & Resources

- **Piper GitHub**: https://github.com/rhasspy/piper
- **Colab Docs**: https://colab.research.google.com/notebooks/intro.ipynb
- **Troubleshooting**: Check notebook comments/docs

---

## Your Files Checklist

Before starting training, verify you have:
- [ ] **Segmented audio files** (5-15 seconds each) - in Google Drive `piper_training/wavs/`
- [ ] **Updated metadata.csv** (with entries for each segment) - in Google Drive `piper_training/`
- [ ] Google account with Drive access
- [ ] Modern web browser (Chrome/Firefox recommended)

**Note**: The repository contains speedchat.wav and almanac.wav, but these are **too long** for training. You must segment them first (see Step 1.5).

**Ready?** After segmenting your audio, open the notebook link and let's train!

---

## Lessons Learned from Real Training Attempts

This section documents issues encountered during actual training attempts (November 2025).

### What Didn't Work

1. **Official rmcpantoja notebook**
   - Missing `piper-phonemize` dependency
   - Multiple installation attempts failed
   - **Don't use this notebook**

2. **Long audio files (8-12 minutes)**
   - Caused "CUDA out of memory" errors
   - Failed even with batch_size=1
   - T4 GPU has ~15GB total, but training long files requires more
   - **Must segment audio before training**

3. **Single-file training approach**
   - Initially thought Piper could handle long files
   - Documentation suggested this was possible
   - Reality: Free GPU can't handle it
   - **Need proper segmentation**

### What Worked

1. **Natlamir notebook**
   - All dependencies install correctly
   - Clear form-based configuration
   - Successfully starts training with proper data

2. **Segmented audio files (5-15 seconds)**
   - Fits within GPU memory constraints
   - Standard approach for voice training
   - Matches how Piper was designed to work

3. **Validation split workaround**
   - For small datasets (2-10 files), use `--data.validation_split 0.0`
   - Prevents "no training batches" error

### Alternative Approaches

If you can't or don't want to segment audio manually:

1. **Paid cloud GPU services**
   - Google Colab Pro (~$10/month) - more GPU memory
   - Paperspace, Lambda Labs, etc.
   - May handle longer files

2. **Local training**
   - If you have NVIDIA GPU (16GB+ VRAM)
   - Install Piper locally
   - Train without cloud limitations

3. **Use existing voices**
   - Piper has many pre-trained voices
   - May be "good enough" for initial release
   - Can train custom voice later

### Realistic Expectations

- **Minimum data**: 10-15 minutes segmented audio (60-90 clips of 10 seconds each)
- **Recommended data**: 30-60 minutes (180-360 clips)
- **Training time**: 6-12 hours on free Colab
- **Quality**: Acceptable with 15 min, good with 30+ min
- **Voice similarity**: Won't be perfect, but recognizable

### Next Steps After This Guide

Once you have a trained model:
1. Test it thoroughly with various text
2. Identify weaknesses (specific words, intonations)
3. Record more targeted training data if needed
4. Retrain with combined dataset
5. Integrate into Almanac Alarm app (see `/PIPER_INTEGRATION_PLAN.md`)

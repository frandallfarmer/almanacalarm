# Google Colab Training Guide - First Time User

This guide walks you through training your custom Piper TTS voice model using Google Colab (completely free!).

## What is Google Colab?

Google Colab is a free cloud-based coding environment that runs in your web browser. It gives you access to powerful GPU computers for training machine learning models without needing any special hardware.

**Think of it like**: Google Docs, but for running code instead of writing documents.

## What You'll Do

1. Upload your audio files to Google Drive
2. Open a pre-made training notebook
3. Click "Run" on each step
4. Wait 6-12 hours while it trains
5. Download your trained voice model

## Prerequisites

- ✅ Google account (Gmail)
- ✅ ~30MB free space in Google Drive
- ✅ Training files ready (you have these!)
  - speedchat.wav (22MB)
  - almanac.wav (5.2MB)
  - metadata.csv

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

## Step 2: Open the Training Notebook (2 minutes)

### 2.1 Access the Notebook

Click this link to open the Piper training notebook:
👉 https://colab.research.google.com/github/rmcpantoja/piper/blob/master/notebooks/piper_multilingual_training_notebook.ipynb

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

## Step 5: Configure Training Parameters (3 minutes)

Look for the configuration section in the notebook. You'll need to set:

### 5.1 Path to Your Data

Find the cell that sets the data path and change it to:
```python
data_path = '/content/drive/MyDrive/piper_training'
```

### 5.2 Language Setting

```python
language = 'en-us'  # or 'en_US' depending on notebook format
```

### 5.3 Quality Setting

```python
quality = 'medium'  # Good balance of quality and training speed
```

**Quality options:**
- `low` - Fastest (3-4 hours), decent quality
- `medium` - Balanced (6-8 hours), good quality ← **Recommended**
- `high` - Slowest (10-12 hours), best quality

### 5.4 Model Name (Optional)

```python
model_name = 'randy_farmer_voice'  # Or any name you want
```

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

### Issue: "Runtime disconnected"

**Cause:** Colab has usage limits (~12 hours per session)

**Solution:**
- Notebook auto-saves checkpoints
- Click "Reconnect"
- Training resumes from last checkpoint

### Issue: "Out of memory"

**Cause:** T4 GPU doesn't have enough RAM

**Solution:**
- Try `quality = 'low'` instead of medium
- Or split into smaller training batches (notebook should handle this)

### Issue: "Can't find metadata.csv"

**Cause:** File path is wrong

**Solution:**
- Double-check path: `/content/drive/MyDrive/piper_training`
- Make sure you mounted Drive first
- Verify files are in correct folders

### Issue: Training loss not decreasing

**Cause:**
- Not enough training data (you have minimum viable)
- Audio quality issues
- Mismatch between audio and transcript

**Solution:**
- Let it train longer (sometimes takes 20-30 epochs to start improving)
- If loss stays above 2.0 after 50 epochs, check audio/transcript alignment
- May need more training data for better results

### Issue: Generated voice sounds robotic

**Cause:**
- Insufficient training data (13-17 min is minimal)
- Training stopped too early

**Solution:**
- Train longer if loss is still decreasing
- Record more samples and retrain
- Try `quality = 'high'` for next training

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

Before starting, verify you have:
- [x] speedchat.wav - in Google Drive `piper_training/wavs/`
- [x] almanac.wav - in Google Drive `piper_training/wavs/`
- [x] metadata.csv - in Google Drive `piper_training/`
- [x] Google account with Drive access
- [x] Modern web browser (Chrome/Firefox recommended)

**Ready?** Open the notebook link and let's train! 🚀

# Voice Training v4 Plan

## Current State (v3)
- **Samples**: 42 audio files (32 speedchat + 10 Almanac)
- **Training**: 3,541 epochs total (~30 epochs per sample)
- **Quality**: Good, but slight metallic artifacts
- **Context**: Primarily "reading voice" - consistent, monotone delivery
- **Bottleneck**: Limited phoneme diversity and sample variety

## The Problem: Data vs. Epochs

### Current Approach (v1-v3)
- ✅ **Extensive training**: 30+ epochs per sample
- ❌ **Limited data**: Only 42 samples, similar contexts
- **Result**: Model memorizes samples well but struggles with unseen patterns

### Recommended v4 Approach
- ✅ **Diverse data**: 100-200 samples, varied contexts
- ✅ **Moderate training**: 300-500 total epochs (~2-5 epochs per sample)
- **Expected result**: 2-3x improvement in naturalness, reduced metallic quality

### Quality Formula
**Voice Quality = 80% Data Diversity + 20% Training Time**

You've maxed out the 20%. Time to focus on the 80%.

## v4 Sample Collection Strategy

### Target: 100-200 Samples (vs. current 42)

### 1. Phoneme Coverage (30-40 samples)
Record text specifically designed to cover all English phonemes systematically.

**Examples:**
- "The quick brown fox jumps over the lazy dog"
- "She sells seashells by the seashore"
- "How now brown cow"
- "Peter Piper picked a peck of pickled peppers"
- Lists of minimal pairs: "bat/pat", "thin/sin", "ship/chip"

**Resources:**
- Use phonetic pangrams
- Include word lists from CMU Pronouncing Dictionary
- Cover all vowel sounds (IPA: /i/, /ɪ/, /ɛ/, /æ/, /ɑ/, /ɔ/, /ʊ/, /u/, /ʌ/, /ə/, /ɝ/)
- Cover all consonant sounds and clusters

### 2. Speaking Styles (40-60 samples)

**Conversational (15-20 samples):**
- Natural chat about daily topics
- Questions and answers
- Casual storytelling
- "So I was thinking about breakfast, and..."
- "Have you ever wondered why clocks run clockwise?"

**Reading - News Style (10-15 samples):**
- Formal, clear enunciation
- Historical facts
- Current events summaries
- "In eighteen sixty-three, President Lincoln..."

**Reading - Narrative Style (10-15 samples):**
- Storytelling tone
- Children's books
- Fables and anecdotes
- More expressive, with character

**Instructional (5-10 samples):**
- How-to guides
- Directions
- Explanations
- "To get started, first open the application..."

**Enthusiastic/Excited (5-10 samples):**
- Emphasis and energy
- Exclamations
- "That's incredible! The results show..."

**Calm/Soothing (5-10 samples):**
- Meditation-style
- Bedtime story tone
- Lower energy, relaxed

### 3. Sentence Types (20-30 samples)

**Statements (10 samples):**
- Declarative sentences
- Facts and observations

**Questions (5-10 samples):**
- Rising intonation at end
- "What time is it?"
- "Where did you put the keys?"
- "How does this work?"

**Exclamations (5-10 samples):**
- Emotional emphasis
- "Wow!", "Amazing!", "That's fantastic!"

**Commands/Imperatives (5 samples):**
- "Stop", "Listen carefully", "Turn left at the corner"

### 4. Almanac-Specific Content (20-30 samples)

**Time Announcements:**
- "Good morning. It's seven thirty AM."
- "The time is now two forty-five PM."
- "It's midnight."

**Historical Facts:**
- Short (1-2 sentence) historical events
- Dates and years
- Names and places

**Special Dates:**
- Holidays
- Birthdays
- Anniversaries

**Numbers and Dates:**
- Practice saying years: "eighteen sixty-three", "two thousand twenty-five"
- Times: "seven thirty", "quarter past nine"
- Dates: "November thirteenth", "the fourth of July"

## Recording Guidelines

### Technical Requirements
- **Format**: 22050 Hz sample rate, mono, 16-bit WAV
- **Length**: 5-15 seconds per clip (ideal: 8-10 seconds)
- **Quality**: Quiet environment, consistent microphone distance
- **Microphone**: Same mic for all recordings (consistency matters!)

### Recording Best Practices

1. **Warm up your voice** - Don't record first thing in the morning
2. **Hydrate** - Keep water nearby, avoid dairy before recording
3. **Consistent setup**:
   - Same microphone position (6-8 inches from mouth)
   - Same room
   - Same time of day if possible
4. **Take breaks** - Don't record all 100-200 samples in one session
   - Aim for 20-30 samples per session
   - 5-10 sessions total over several days/weeks
5. **Natural delivery**:
   - Don't read robotically
   - Use natural pauses and emphasis
   - Imagine speaking to a real person
6. **Label as you go** - Name files clearly: `conversational-01.wav`, `question-05.wav`, etc.

### What to Avoid
- ❌ Background noise (fans, traffic, keyboard clicks)
- ❌ Mouth sounds (lip smacks, breathing into mic)
- ❌ Rushed delivery
- ❌ Overly theatrical/exaggerated
- ❌ Inconsistent volume levels
- ❌ Recording when tired, sick, or hoarse

## File Organization

```
voice_training/audio_v4/
├── phonemes/
│   ├── phoneme-01.wav ... phoneme-40.wav
├── conversational/
│   ├── chat-01.wav ... chat-20.wav
├── news/
│   ├── news-01.wav ... news-15.wav
├── narrative/
│   ├── story-01.wav ... story-15.wav
├── instructional/
│   ├── howto-01.wav ... howto-10.wav
├── enthusiastic/
│   ├── excited-01.wav ... excited-10.wav
├── calm/
│   ├── calm-01.wav ... calm-10.wav
├── questions/
│   ├── question-01.wav ... question-10.wav
├── exclamations/
│   ├── exclaim-01.wav ... exclaim-10.wav
├── commands/
│   ├── command-01.wav ... command-05.wav
└── almanac/
    ├── time-01.wav ... time-10.wav
    ├── history-01.wav ... history-10.wav
    └── dates-01.wav ... dates-10.wav
```

## Transcription

Create `voice_training/transcripts_v4/` with corresponding `.txt` files matching the exact spoken content.

**Critical**: Transcripts must be exact, including:
- Punctuation (affects prosody)
- Numbers written as words ("eighteen sixty-three" not "1863")
- Capitalization
- Contractions as spoken ("it's" not "it is" if you said "it's")

## v4 Training Parameters

```bash
# After collecting 100-200 diverse samples

python3 -m piper.train fit \
  --data.voice_name "randy_farmer_v4" \
  --data.csv_path "/content/drive/MyDrive/piper_training_v4/metadata.csv" \
  --data.audio_dir "/content/drive/MyDrive/piper_training_v4/wavs" \
  --model.sample_rate 22050 \
  --data.espeak_voice "en-us" \
  --data.cache_dir "/content/piper_cache" \
  --data.config_path "/content/drive/MyDrive/piper_training_v4/randy_farmer_v4.json" \
  --data.batch_size 8 \
  --data.validation_split 0.1 \
  --data.num_test_examples 2 \
  --trainer.max_epochs 500 \
  --trainer.default_root_dir "/content/drive/MyDrive/piper_training_v4" \
  --ckpt_path "https://huggingface.co/datasets/rhasspy/piper-checkpoints/resolve/main/en/en_US/lessac/medium/epoch%3D2164-step%3D1355540.ckpt"
```

**Key changes from v3:**
- `--trainer.max_epochs 500` (vs 3541) - Much less training needed with good data
- `--data.batch_size 8` (vs 4) - Can increase with more samples
- Start fresh from pretrained checkpoint, don't continue from v3
- New data directory to keep v3 and v4 separate

**Expected training time**: ~2-4 hours (vs. 8+ hours for v3)

## Expected Quality Improvements

### v3 Limitations
- ✅ Reproduces training samples well
- ❌ Metallic on uncommon phoneme combinations
- ❌ Monotone delivery (trained on reading voice)
- ❌ Struggles with questions (rising intonation)
- ❌ Limited emotional range

### v4 Expected Results (with 100-200 diverse samples)
- ✅ Natural pronunciation across all phonemes
- ✅ 2-3x reduction in metallic artifacts
- ✅ Better prosody and intonation
- ✅ Handles questions, exclamations, different speaking styles
- ✅ More emotional variety
- ✅ Better generalization to unseen text

## Validation Strategy

### During Training
- Monitor validation loss (should be lower than v3 despite fewer epochs)
- Check test outputs every 50-100 epochs
- Listen for naturalness improvements

### After Training
**Test sentences** (not in training data):
1. "The weather today is partly cloudy with a high of seventy-five degrees."
2. "What would you like for dinner tonight?"
3. "That's absolutely amazing! I can't believe it worked!"
4. "On this day in nineteen sixty-nine, humans first walked on the moon."
5. "Please turn left at the next intersection and continue for two miles."

Compare to v3 outputs on same sentences.

## Timeline Estimate

| Phase | Time | Description |
|-------|------|-------------|
| Planning | 1-2 hours | Prepare scripts, organize recording setup |
| Recording | 4-8 hours | 5-10 sessions over 1-2 weeks |
| Transcription | 2-3 hours | Create accurate transcripts |
| Preprocessing | 30 min | Segment audio, normalize, generate metadata |
| Training | 2-4 hours | Google Colab with GPU |
| Testing | 30 min | Generate test outputs, compare to v3 |
| **Total** | **10-18 hours** | Spread over 2-3 weeks |

## ROI Analysis

### v3 → v3.5 (more epochs, same data)
- **Effort**: High (4-8 more hours training, storage management)
- **Expected improvement**: Minimal (5-10%)
- **Recommendation**: ❌ Not worth it

### v3 → v4 (better data, moderate training)
- **Effort**: Medium-High (10-18 hours total, mostly recording)
- **Expected improvement**: High (2-3x quality gain)
- **Recommendation**: ✅ **Do this when quality matters**

## When to Do v4 Training

**Do v4 if:**
- ✅ v3 metallic quality is noticeable to end users
- ✅ App is working and worth investing in improvement
- ✅ You have 2-3 weeks to spread recording sessions
- ✅ Users complain about voice quality

**Stick with v3 if:**
- ✅ App integration is still experimental
- ✅ v3 quality is "good enough" for current use case
- ✅ User feedback hasn't identified voice as a problem
- ✅ Other features are higher priority

## Next Steps

1. ✅ Use v3 in production, gather user feedback
2. ⏳ Wait for real-world usage data
3. ⏳ If voice quality is an issue, proceed with v4
4. ⏳ If v3 is good enough, focus on other features

**Decision point**: After 50-100 real users have experienced v3 in the app.

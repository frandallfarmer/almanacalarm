#!/bin/bash
# Extended training command for Randy Farmer voice
# Continue from epoch 2270 checkpoint and train 2-4x longer for better quality

# Original training: 106 epochs (2164→2270)
# For 2x training: 212 more epochs (→2482 total)
# For 4x training: 424 more epochs (→2694 total)

# RECOMMENDED: Start with 4x training (424 more epochs)
python3 -m piper.train fit \
  --data.voice_name "randy_farmer" \
  --data.csv_path "/content/drive/MyDrive/piper_training/metadata.csv" \
  --data.audio_dir "/content/drive/MyDrive/piper_training/wavs" \
  --model.sample_rate 22050 \
  --data.espeak_voice "en-us" \
  --data.cache_dir "/content/piper_cache" \
  --data.config_path "/content/drive/MyDrive/piper_training/randy_farmer.json" \
  --data.batch_size 4 \
  --data.validation_split 0.1 \
  --data.num_test_examples 2 \
  --trainer.max_epochs 2694 \
  --ckpt_path "/content/drive/MyDrive/piper_training/checkpoints/epoch=2270-step=1908.ckpt"

# Key changes:
# 1. --trainer.max_epochs 2694 (4x training) or 2482 (2x training)
# 2. --ckpt_path points to YOUR epoch 2270 checkpoint (not the pretrained one)
# 3. With $10 GPU credit, you have several hours - 4x training should complete fine

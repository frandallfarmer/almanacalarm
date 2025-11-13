#!/bin/bash
# Extended training command for Randy Farmer voice
# Continue from epoch 2693 checkpoint to reduce metallic quality

# Training history:
# - Original: 106 epochs (2164→2270)
# - v2: 423 epochs (2270→2693)
# - v3: Continue for another 424-848 epochs

# RECOMMENDED: Train another 848 epochs (2x the v2 training) to epoch 3541
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
  --trainer.max_epochs 3541 \
  --trainer.default_root_dir "/content/drive/MyDrive/piper_training" \
  --ckpt_path "/content/drive/MyDrive/piper_training/checkpoints/epoch=2693-step=9522.ckpt"

# Options:
# - For 1x more (424 epochs): --trainer.max_epochs 3117
# - For 2x more (848 epochs): --trainer.max_epochs 3541 (recommended)
#
# Key changes from v2:
# 1. --ckpt_path updated to epoch 2693 checkpoint (v2 endpoint)
# 2. --trainer.max_epochs 3541 for 2x more training
# 3. Added --trainer.default_root_dir to save checkpoints to Google Drive during training

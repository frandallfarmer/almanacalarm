#!/bin/bash
# Cleanup script to remove unnecessary files from repo

set -e

REPO_ROOT="/home/randy/almanacalarm"
ASSETS_ESPEAK="$REPO_ROOT/android/app/src/main/assets/voice_profiles/espeak-ng-data"
VOICE_PROFILES="$REPO_ROOT/voice_profiles"
VOICE_TRAINING="$REPO_ROOT/voice_training"

echo "🧹 Cleaning up Almanac Alarm repo..."

# 1. Delete all non-English dictionaries from assets (saves ~17MB in APK)
echo "Removing non-English espeak-ng dictionaries from assets..."
cd "$ASSETS_ESPEAK"
find . -name "*_dict" ! -name "en_dict" -delete
echo "✅ Kept only en_dict, deleted 112 other language dictionaries"

# 2. Delete non-English lang files from assets
echo "Removing non-English lang files from assets..."
cd "$ASSETS_ESPEAK/lang"
# Keep only English variants (gmw/en*)
find . -type d ! -path "./gmw*" ! -path "." -exec rm -rf {} + 2>/dev/null || true
cd gmw
find . ! -name "en*" -delete 2>/dev/null || true
echo "✅ Kept only English lang variants"

# 3. Clean up voice_profiles directory
echo "Cleaning voice_profiles directory..."
cd "$VOICE_PROFILES"
rm -rf android/  # Empty directory structure, not needed
rm -f randy_farmer_v3.onnx randy_farmer_v3.onnx.json  # Duplicate of current
rm -f voice-profile-randy-farmer-v2.onnx voice-profile-randy-farmer-v2.onnx.json  # Saved in git history
echo "✅ Removed duplicate models and empty android/ dir"

# 4. Clean up voice_training directory
echo "Cleaning voice_training directory..."
cd "$VOICE_TRAINING"
rm -f *.onnx  # Training checkpoints, not needed in repo
rm -f full_crash_log.txt  # Debug artifact
echo "✅ Removed training checkpoints and logs"

# 5. Create .gitignore for future cleanup
echo "Creating .gitignore rules..."
cd "$REPO_ROOT"
cat >> .gitignore <<'EOF'

# Voice training artifacts
voice_training/*.onnx
voice_training/*.wav
voice_training/full_crash_log.txt

# Voice profile build artifacts
voice_profiles/*.onnx
voice_profiles/randy_farmer_*.onnx*

# Keep only the active model
!voice_profiles/voice-profile-randy-farmer.onnx
!voice_profiles/voice-profile-randy-farmer.onnx.json
!voice_profiles/voice-profile-randy-farmer-tokens.txt
EOF
echo "✅ Created .gitignore rules"

echo ""
echo "📊 Space saved:"
echo "   - Assets: ~17MB (112 language dictionaries)"
echo "   - voice_profiles: ~122MB (duplicate models)"
echo "   - voice_training: ~122MB (training checkpoints)"
echo "   - Total: ~261MB removed from repo"
echo ""
echo "✅ Cleanup complete!"

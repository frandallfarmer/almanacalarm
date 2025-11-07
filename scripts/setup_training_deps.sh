#!/bin/bash
# Setup dependencies for podcast training data processing

set -e  # Exit on error

echo "============================================================"
echo "Installing dependencies for Piper training data preparation"
echo "============================================================"
echo ""

# Check if running on WSL/Linux
if [[ ! -f /etc/os-release ]]; then
    echo "ERROR: This script is for Linux/WSL systems"
    exit 1
fi

echo "1. Installing system packages (ffmpeg)..."
sudo apt update
sudo apt install -y ffmpeg python3-pip

echo ""
echo "2. Installing Python packages..."
pip3 install --user pydub beautifulsoup4 lxml nltk

echo ""
echo "3. Downloading NLTK data..."
python3 -c "import nltk; nltk.download('punkt', quiet=True)"

echo ""
echo "============================================================"
echo "Installation complete!"
echo "============================================================"
echo ""
echo "Verify installation:"
echo "  python3 -c 'import pydub, bs4, nltk; print(\"All packages installed!\")'"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/download_podcasts.sh"
echo "  2. Run: python3 scripts/prepare_podcast_training_data.py \\"
echo "            --audio-dir ./podcast_source \\"
echo "            --transcript-dir ./podcast_source \\"
echo "            --output-dir ./piper_training_data \\"
echo "            --speaker Randy"
echo ""

#!/bin/bash
# Download podcast files from remote droplet server

set -e  # Exit on error

REMOTE_HOST="droplet"
REMOTE_AUDIO_DIR="/opt/web-server/public/podcasts/"
REMOTE_TRANSCRIPT_DIR="/opt/web-server/public/episodes/"
LOCAL_DIR="/home/randy/almanacalarm/podcast_source"

echo "Downloading podcasts from $REMOTE_HOST"
echo "  Audio: $REMOTE_AUDIO_DIR"
echo "  Transcripts: $REMOTE_TRANSCRIPT_DIR"
echo "Local destination: $LOCAL_DIR"
echo ""

# Create local directory if it doesn't exist
mkdir -p "$LOCAL_DIR"

# Download MP3 files from podcasts directory
echo "Downloading MP3 audio files..."
rsync -avz --progress "$REMOTE_HOST:$REMOTE_AUDIO_DIR" "$LOCAL_DIR/" || true

# Download HTML transcript files from episodes directory
echo ""
echo "Downloading HTML transcript files..."
rsync -avz --progress "$REMOTE_HOST:$REMOTE_TRANSCRIPT_DIR*.html" "$LOCAL_DIR/" || true

# Download HTM transcript files (in case they use .htm extension)
echo ""
echo "Downloading HTM transcript files..."
rsync -avz --progress "$REMOTE_HOST:$REMOTE_TRANSCRIPT_DIR*.htm" "$LOCAL_DIR/" || true

echo ""
echo "Download complete!"
echo ""

# List what was downloaded
echo "Downloaded files:"
echo "MP3 files:"
ls -lh "$LOCAL_DIR"/*.mp3 2>/dev/null || echo "  (none found)"
echo ""
echo "HTML/HTM files:"
ls -lh "$LOCAL_DIR"/*.html "$LOCAL_DIR"/*.htm 2>/dev/null || echo "  (none found)"

echo ""
echo "Next step: Run the processing script to prepare training data"
echo "This will extract ONLY Randy's voice segments from the podcasts:"
echo ""
echo "  python scripts/prepare_podcast_training_data.py \\"
echo "    --audio-dir $LOCAL_DIR \\"
echo "    --transcript-dir $LOCAL_DIR \\"
echo "    --output-dir ./piper_training_data \\"
echo "    --speaker Randy"

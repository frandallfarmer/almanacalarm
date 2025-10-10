#!/bin/bash

# Almanac Alarm - Build and Deploy Script
# Builds both debug and release APKs and copies them to Dropbox for easy phone transfer

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/randy/almanacalarm"
ANDROID_DIR="$PROJECT_DIR/android"
DROPBOX_DIR="$HOME/Dropbox"
APP_NAME="AlmanacAlarm"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Almanac Alarm - Build & Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory not found at $PROJECT_DIR${NC}"
    exit 1
fi

# Check if Dropbox directory exists
if [ ! -d "$DROPBOX_DIR" ]; then
    echo -e "${YELLOW}Warning: Dropbox directory not found at $DROPBOX_DIR${NC}"
    echo -e "${YELLOW}Creating directory for APK storage...${NC}"
    mkdir -p "$HOME/APKs"
    DROPBOX_DIR="$HOME/APKs"
fi

# Set Android environment
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

echo -e "${BLUE}🔧 Environment Setup${NC}"
echo "Project: $PROJECT_DIR"
echo "Android SDK: $ANDROID_HOME"
echo "Deploy to: $DROPBOX_DIR"
echo ""

# Navigate to android directory
cd "$ANDROID_DIR"

echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
./gradlew clean --quiet
echo -e "${GREEN}✅ Clean completed${NC}"
echo ""

echo -e "${BLUE}🔨 Building Debug APK...${NC}"
if ./gradlew assembleDebug --quiet; then
    echo -e "${GREEN}✅ Debug build completed${NC}"
else
    echo -e "${RED}❌ Debug build failed${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}🚀 Building Release APK...${NC}"
if ./gradlew assembleRelease --quiet; then
    echo -e "${GREEN}✅ Release build completed${NC}"
else
    echo -e "${RED}❌ Release build failed${NC}"
    exit 1
fi
echo ""

# Get current timestamp for file naming
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Define APK paths
DEBUG_APK="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
RELEASE_APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

# Create timestamped filenames
DEBUG_NAME="${APP_NAME}_debug_${TIMESTAMP}.apk"
RELEASE_NAME="${APP_NAME}_release_${TIMESTAMP}.apk"

echo -e "${BLUE}📱 Copying APKs to deployment directory...${NC}"

# Check if APK files exist
if [ ! -f "$DEBUG_APK" ]; then
    echo -e "${RED}❌ Debug APK not found at $DEBUG_APK${NC}"
    exit 1
fi

if [ ! -f "$RELEASE_APK" ]; then
    echo -e "${RED}❌ Release APK not found at $RELEASE_APK${NC}"
    exit 1
fi

# Copy APKs with timestamped names
cp "$DEBUG_APK" "$DROPBOX_DIR/$DEBUG_NAME"
cp "$RELEASE_APK" "$DROPBOX_DIR/$RELEASE_NAME"

# Also copy with simple names (overwrites previous)
cp "$DEBUG_APK" "$DROPBOX_DIR/${APP_NAME}_debug.apk"
cp "$RELEASE_APK" "$DROPBOX_DIR/${APP_NAME}_release.apk"

echo -e "${GREEN}✅ APKs copied successfully!${NC}"
echo ""

# Display file information
echo -e "${BLUE}📊 Build Summary${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}Debug APK:${NC}"
echo "  File: $DEBUG_NAME"
echo "  Size: $(du -h "$DROPBOX_DIR/$DEBUG_NAME" | cut -f1)"
echo "  Location: $DROPBOX_DIR/$DEBUG_NAME"
echo ""
echo -e "${YELLOW}Release APK (Recommended):${NC}"
echo "  File: $RELEASE_NAME"
echo "  Size: $(du -h "$DROPBOX_DIR/$RELEASE_NAME" | cut -f1)"
echo "  Location: $DROPBOX_DIR/$RELEASE_NAME"
echo ""

echo -e "${GREEN}🎉 Build and deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📲 Next Steps:${NC}"
echo "1. Open Dropbox on your phone or computer"
echo "2. Download the ${APP_NAME}_release.apk file (recommended)"
echo "3. Install on your Android phone"
echo "4. Enable 'Install from Unknown Sources' if prompted"
echo ""
echo -e "${BLUE}⏰ App Features:${NC}"
echo "• Voice-based alarm announcements"
echo "• Current time and date"
echo "• Weather conditions (temperature, humidity, wind)"
echo "• Sunrise and sunset times"
echo "• Tide predictions for next 24 hours"
echo "• Air quality information"
echo "• Location-based data"
echo "• Dark/light mode support"
echo ""
echo -e "${GREEN}Good morning! ⏰🌅${NC}"

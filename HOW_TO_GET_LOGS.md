# How to Get Android Logs from Your Phone

## Method 1: ADB Logcat (Most Detailed)

### Setup ADB on Your Phone
1. **Enable Developer Options:**
   - Go to **Settings → About Phone**
   - Tap **Build Number** 7 times until it says "You are now a developer"

2. **Enable USB Debugging:**
   - Go to **Settings → System → Developer Options**
   - Enable **USB Debugging**

3. **Connect Phone to Computer:**
   - Connect via USB cable
   - When prompted on phone, tap **Allow USB Debugging**

4. **Get Logs from WSL:**
   ```bash
   # Check if device is connected
   adb devices

   # Get live logs (filter for our app)
   adb logcat | grep -E "AlmanacAlarm|TTSService|PiperTTS|ReactNative"

   # Or save to file
   adb logcat > /tmp/app_logs.txt

   # Clear old logs first, then capture only new ones
   adb logcat -c
   adb logcat > /tmp/app_logs.txt
   ```

5. **Reproduce the Crash:**
   - Leave the logcat command running
   - Launch the app on your phone
   - Click "Speak Almanac"
   - When it crashes, press Ctrl+C to stop logcat
   - Check `/tmp/app_logs.txt`

## Method 2: Android Studio Logcat (Easiest GUI)

1. **Install Android Studio** (if not already installed)
2. Connect phone via USB (with USB debugging enabled)
3. Open Android Studio
4. Go to **View → Tool Windows → Logcat**
5. Select your device at the top
6. Filter by package: `com.almanacalarm`
7. Reproduce the crash and save the logs

## Method 3: On-Device Log Viewer Apps (No Computer Needed)

### Option A: Logcat Reader (Free App)
1. Install **Logcat Reader** from Google Play Store
2. Grant it permission to read logs
3. Open the app
4. Filter for "AlmanacAlarm" or "PiperTTS"
5. Launch Almanac Alarm and click Speak
6. Switch back to Logcat Reader to see the error
7. You can share/export the logs from the app

### Option B: MatLog (Free App)
1. Install **MatLog** from Google Play Store
2. Grant permissions
3. Use filter: `com.almanacalarm`
4. Record logs while reproducing crash
5. Share logs via email/text

## Method 4: React Native Debug Menu (Built-in)

1. **Open Debug Menu:**
   - Shake your phone, OR
   - Press hardware menu button, OR
   - Run: `adb shell input keyevent 82`

2. **Enable Remote JS Debugging:**
   - This will open Chrome DevTools
   - Console logs will appear in browser
   - Limited to JavaScript errors only (not native crashes)

## Quick Commands for WSL

```bash
# One-line command to get filtered logs
adb logcat -c && adb logcat | grep -i -E "fatal|crash|error|exception" | grep -E "almanac|tts|piper|sherpa"

# Save crash logs to file
adb logcat -d > ~/crash_logs_$(date +%Y%m%d_%H%M%S).txt

# Get only last 500 lines
adb logcat -d -t 500 > ~/recent_logs.txt

# Filter for our app package specifically
adb logcat | grep "com.almanacalarm"
```

## What to Look For in Logs

When you get the logs, search for:
- `FATAL EXCEPTION`
- `AndroidRuntime`
- `PiperTTS`
- `TTSService`
- `sherpa-onnx`
- `copyFileAssets`
- Any line with `Error:` or `Exception:`

## Send Me the Logs

Once you have the logs, you can:
1. Save to a file
2. Copy/paste the relevant error section
3. Send me the last ~100 lines around the crash

The error will typically look like:
```
E/AndroidRuntime: FATAL EXCEPTION: main
    Process: com.almanacalarm, PID: 12345
    java.lang.RuntimeException: ...
        at com.sherpaonnxofflinetts...
```

# Voice Customization Workflow: CCWeb vs CLI Strategy

This document outlines the recommended workflow for implementing custom voice features in Almanac Alarm, specifically identifying which tasks are best handled by Claude Code Web versus Claude Code CLI.

## Overview

The voice customization feature involves multiple phases spanning different environments and tools. Understanding which tool (CCWeb vs CLI) is optimal for each phase helps streamline development and avoid tool limitations.

## Workflow Phase Breakdown

### Phase 1: Recording & Processing (CLI Required)

**Tools Needed:** Local machine with microphone, Audacity

**Tasks:**
1. Record audio on your local machine following VOICE_RECORDING_GUIDE.md
2. Process audio in Audacity (normalize, noise reduction, segmentation)
3. Create metadata.csv with transcriptions
4. Validate audio quality locally

**Why CLI?**
- Requires access to local microphone hardware
- Needs GUI application (Audacity) running on your machine
- Interactive audio playback for quality verification

**CCWeb Cannot:** Access local audio hardware or run GUI applications

---

### Phase 2: Model Training (External - Google Colab)

**Tools Needed:** Google Colab, Google Drive

**Tasks:**
1. Upload processed audio files and metadata to Google Drive
2. Run Piper training notebook on Colab GPU
3. Monitor training progress (6-12 hours)
4. Download trained .onnx model files

**Why External?**
- Requires GPU compute (free on Google Colab)
- Independent of local development environment
- Runs on Google's infrastructure

**Neither CCWeb nor CLI needed:** This is a standalone cloud training process

---

### Phase 3: Integration (Perfect for CCWeb!) ✨

**Tools Needed:** Claude Code Web

**Tasks:**
1. Install npm dependencies (`react-native-sherpa-onnx-offline-tts`)
2. Create PiperTTSService.ts implementation
3. Refactor TTSService.ts for dual-mode support
4. Update AlmanacSpeaker.ts to use new service
5. Configure Android build files:
   - android/app/build.gradle
   - AndroidManifest.xml
   - Asset bundling configuration
6. Run build validation (`npm run build`, `./gradlew assembleDebug`)
7. Run automated tests (if available)
8. Update documentation (README.md, inline comments)

**Why CCWeb Excels:**
- Multiple file changes can be made in parallel
- Immediate build validation in sandboxed environment
- Test-driven development workflow (change → build → test)
- All documentation exists in repo for full context
- No need for local environment setup
- Can run multiple parallel integration tasks
- Perfect for "grunt work" of wiring components together

**CCWeb Strengths:**
- Fast iteration cycles
- Automated validation
- Parallel task execution
- Cloud-based builds don't impact local machine
- Easy to rollback or create PR from web interface

---

### Phase 4: Testing & Refinement (CLI Required)

**Tools Needed:** Local machine, Android device/emulator, USB debugging

**Tasks:**
1. Use "Open CLI" button to transition from CCWeb session
2. Build APK locally
3. Deploy to physical device or emulator via ADB
4. Test actual voice playback and quality
5. Interactive debugging with device logs
6. Iterate on voice parameters (pitch, rate, speed)
7. Profile performance (memory usage, CPU load)
8. Test edge cases and error handling
9. Verify fallback to system TTS works correctly

**Why CLI?**
- Requires USB connection to physical device
- Needs audio playback to evaluate voice quality
- Interactive debugging with real-time device logs
- IDE integration for breakpoint debugging
- Local emulator management
- Hearing the actual TTS output is essential

**CCWeb Cannot:**
- Deploy to physical devices
- Play audio for quality assessment
- Provide interactive debugging experience
- Access local Android SDK/emulator

---

## Task Category Matrix

### ✅ CCWeb Excels At

| Task Category | Examples |
|--------------|----------|
| **Code Integration** | Creating services, refactoring existing code |
| **Dependency Management** | npm install, package updates |
| **Build Configuration** | Gradle files, manifest updates, bundling |
| **Automated Builds** | Running compilation, catching build errors |
| **Test Execution** | Running unit/integration tests |
| **Documentation** | README updates, code comments, guides |
| **File Generation** | Config files, metadata processing |
| **Multi-file Changes** | Parallel refactoring across components |

### ❌ CLI Required For

| Task Category | Examples |
|--------------|----------|
| **Local Hardware** | Microphone recording, speaker playback |
| **GUI Applications** | Audacity, Android Studio, IDE debugging |
| **Device Interaction** | APK deployment, USB debugging, ADB |
| **Interactive Testing** | Hearing TTS output, user experience testing |
| **Local Tools** | Piper CLI testing, local model validation |
| **Large Binary Files** | Uploading 20-50MB .onnx models |
| **Emulator Management** | Starting/stopping Android emulators |

---

## Recommended Hybrid Workflow

### Step-by-Step Process

**1. Preparation (CLI - 1-2 hours)**
```
Local Machine:
- Record audio samples (30-60 minutes of speech)
- Process in Audacity
- Export WAV files and create metadata.csv
- Validate recording quality
```

**2. Training (External - 6-12 hours automated)**
```
Google Colab:
- Upload files to Google Drive
- Run training notebook
- Monitor progress
- Download trained .onnx model files
```

**3. Integration (CCWeb - 2-4 hours)**
```
Claude Code Web:
✅ Install packages
✅ Create PiperTTSService.ts
✅ Update AlmanacSpeaker.ts and TTSService.ts
✅ Configure Android build
✅ Run builds to verify compilation
✅ Run automated tests
✅ Update documentation
✅ Commit and push changes
```

**4. Testing (CLI - 1-2 hours)**
```
Local Machine:
- Click "Open CLI" button (after CCWeb pushes changes)
- Build APK locally
- Deploy to device via ADB
- Test voice playback quality
- Debug any issues interactively
- Iterate on parameters
- Final validation
```

**5. Refinement (CCWeb or CLI as needed)**
```
CCWeb for: Code changes, refactoring, configuration tweaks
CLI for: Testing results, quality assessment, debugging
```

---

## Benefits of This Approach

### For CCWeb Phase
- **Reduced context switching** - Stay in browser for all coding work
- **Parallel execution** - Can run builds while editing other files
- **Clean environment** - No local dev environment pollution
- **Easy collaboration** - Share web session links with team
- **Automatic progress tracking** - Tasks visible in web interface

### For CLI Phase
- **Real hardware access** - Essential for audio quality assessment
- **Full debugging power** - Breakpoints, logs, profilers
- **Familiar tools** - Your preferred IDE and setup
- **Device control** - Direct ADB access and emulator management
- **Iterative testing** - Quick edit-build-test cycles on device

### Seamless Transition
The "Open CLI" button bridges both worlds:
1. Complete integration work in CCWeb
2. Push changes to GitHub
3. Click "Open CLI" to get checkout command
4. Continue testing on local machine with same branch
5. Push final refinements from either environment

---

## Common Scenarios

### Scenario: Build Fails During Integration

**Solution:** Stay in CCWeb
- Error messages visible in build output
- Fix code directly in web interface
- Rebuild immediately
- No need to switch to CLI until build succeeds

### Scenario: Voice Quality Issues

**Solution:** Must use CLI
- Need to hear the actual output
- Adjust parameters interactively
- Test different model configurations
- Profile memory/CPU usage on real device

### Scenario: Adding New TTS Feature

**Solution:** Start with CCWeb, finish with CLI
- Use CCWeb to implement feature code
- Run unit tests in CCWeb
- Switch to CLI to test on device
- Return to CCWeb for any needed refactoring

### Scenario: Documentation Updates Only

**Solution:** CCWeb is sufficient
- No device testing needed
- Quick markdown edits
- Commit and push from web interface

---

## Transition Tips

### From CCWeb to CLI
1. Complete all code integration work in CCWeb
2. Ensure all builds pass
3. Commit and push your changes
4. Click "Open CLI" button in web interface
5. Run provided checkout command on local machine
6. Continue with device testing

### From CLI to CCWeb
1. Commit and push any local changes
2. Open CCWeb and select your repository
3. Choose the branch you were working on
4. Continue with code changes or parallel tasks

---

## Tool Selection Decision Tree

```
Need to interact with hardware?
├─ Yes → Use CLI
└─ No → Continue

Need to hear/see audio output?
├─ Yes → Use CLI
└─ No → Continue

Need to deploy to device?
├─ Yes → Use CLI
└─ No → Continue

Just writing/refactoring code?
├─ Yes → Use CCWeb ✅
└─ No → Continue

Need to run automated builds/tests?
├─ Yes → Use CCWeb ✅
└─ No → Continue

Need interactive debugging?
├─ Yes → Use CLI
└─ No → Use CCWeb ✅
```

---

## Files Involved

### Documentation (Read First)
- `/VOICE_RECORDING_GUIDE.md` - User guide for audio recording
- `/PIPER_INTEGRATION_PLAN.md` - Technical implementation details
- `/VOICE_CUSTOMIZATION_WORKFLOW.md` - This document

### Implementation Files (CCWeb Integration Phase)
- `/services/TTSService.ts` - Current TTS service
- `/services/PiperTTSService.ts` - New service (to be created)
- `/utils/AlmanacSpeaker.ts` - Main speech orchestrator
- `/android/app/build.gradle` - Build configuration
- `/AndroidManifest.xml` - Permissions and configuration

### Model Files (CLI Testing Phase)
- `your_voice.onnx` - Trained model (20-50MB)
- `your_voice.onnx.json` - Model configuration
- `tokens.txt` - Phoneme tokens
- `espeak-ng-data/` - Pronunciation data

---

## Timeline Estimate

| Phase | Environment | Time | Can Work In Parallel? |
|-------|------------|------|---------------------|
| Recording | CLI | 1-2 hours | No |
| Training | Colab | 6-12 hours (automated) | Yes - work on other tasks |
| Integration | CCWeb | 2-4 hours | Yes - multiple sessions |
| Testing | CLI | 1-2 hours | No - needs device |
| Refinement | Both | 1-2 hours | Depends on changes |

**Total Active Development Time:** 5-10 hours
**Total Calendar Time:** 1-2 days (including training)

---

## Conclusion

Use **Claude Code Web** for all code integration, building, and automated testing. Switch to **Claude Code CLI** only when you need hardware access, interactive debugging, or audio quality assessment. The "Open CLI" button makes transitioning seamless when you hit the limits of what CCWeb can do.

This hybrid approach leverages the strengths of each tool while minimizing their weaknesses, resulting in faster development cycles and better quality outcomes.

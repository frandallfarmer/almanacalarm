/**
 * Piper TTS Service
 * Handles offline text-to-speech using custom Piper voice models via sherpa-onnx
 */

import TTSManager from 'react-native-sherpa-onnx-offline-tts';
import RNFS from 'react-native-fs';

interface PiperConfig {
  modelPath: string;
  tokensPath: string;
  dataDirPath: string;
}

class PiperTTSService {
  private static instance: PiperTTSService;
  private isInitialized: boolean = false;
  private isSpeakingFlag: boolean = false;
  private baseDir: string = '';

  private constructor() {}

  static getInstance(): PiperTTSService {
    if (!PiperTTSService.instance) {
      PiperTTSService.instance = new PiperTTSService();
    }
    return PiperTTSService.instance;
  }

  /**
   * Initialize Piper TTS engine
   * Copies voice model files to device storage and initializes sherpa-onnx
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[PiperTTS] Step 1: Setting up base directory');
      // Use app's document directory for voice model files
      this.baseDir = `${RNFS.DocumentDirectoryPath}/voice_profiles`;

      // Create voice_profiles directory if it doesn't exist
      const exists = await RNFS.exists(this.baseDir);
      console.log(`[PiperTTS] Base directory exists: ${exists}`);
      if (!exists) {
        console.log(`[PiperTTS] Creating directory: ${this.baseDir}`);
        await RNFS.mkdir(this.baseDir);
      }

      // Copy voice model files from assets to document directory
      // Note: Files need to be in android/app/src/main/assets/voice_profiles/
      const modelName = 'voice-profile-randy-farmer';
      const modelPath = `${this.baseDir}/${modelName}.onnx`;
      const modelJsonPath = `${this.baseDir}/${modelName}.onnx.json`;
      const tokensPath = `${this.baseDir}/${modelName}-tokens.txt`;
      const dataDirPath = `${this.baseDir}/espeak-ng-data`;

      console.log('[PiperTTS] Step 2: Checking for existing files');
      // Check if files already exist (to avoid re-copying on every init)
      const modelExists = await RNFS.exists(modelPath);
      console.log(`[PiperTTS] Model exists: ${modelExists}`);

      if (!modelExists) {
        console.log('[PiperTTS] Step 3: Copying voice model files to device...');

        try {
          console.log('[PiperTTS] Step 3a: Copying ONNX model file...');
          await RNFS.copyFileAssets(
            `voice_profiles/${modelName}.onnx`,
            modelPath
          );
          console.log('[PiperTTS] ONNX model copied successfully');
        } catch (modelError) {
          throw new Error(`Failed to copy model file: ${modelError.message}`);
        }

        try {
          console.log('[PiperTTS] Step 3b: Copying JSON config file...');
          await RNFS.copyFileAssets(
            `voice_profiles/${modelName}.onnx.json`,
            modelJsonPath
          );
          console.log('[PiperTTS] JSON config copied successfully');
        } catch (jsonError) {
          throw new Error(`Failed to copy JSON config: ${jsonError.message}`);
        }

        try {
          console.log('[PiperTTS] Step 3c: Copying tokens file...');
          await RNFS.copyFileAssets(
            `voice_profiles/${modelName}-tokens.txt`,
            tokensPath
          );
          console.log('[PiperTTS] Tokens file copied successfully');
        } catch (tokensError) {
          throw new Error(`Failed to copy tokens file: ${tokensError.message}`);
        }

        try {
          console.log('[PiperTTS] Step 3d: Copying espeak-ng-data directory...');
          await this.copyAssetsFolderRecursive(
            'voice_profiles/espeak-ng-data',
            dataDirPath
          );
          console.log('[PiperTTS] espeak-ng-data copied successfully');
        } catch (espeakError) {
          throw new Error(`Failed to copy espeak-ng-data: ${espeakError.message}`);
        }

        console.log('[PiperTTS] All voice model files copied successfully');
      } else {
        console.log('[PiperTTS] Voice model files already exist on device');
      }

      // Initialize sherpa-onnx with the model
      console.log('[PiperTTS] Step 4: Initializing sherpa-onnx');
      const config: PiperConfig = {
        modelPath,
        tokensPath,
        dataDirPath,
      };
      console.log(`[PiperTTS] Config: ${JSON.stringify(config)}`);

      try {
        await TTSManager.initialize(JSON.stringify(config));
        console.log('[PiperTTS] sherpa-onnx initialized successfully');
      } catch (sherpaError) {
        throw new Error(`sherpa-onnx initialization failed: ${sherpaError.message}`);
      }

      this.isInitialized = true;
      console.log('[PiperTTS] ✅ Piper TTS fully initialized');
    } catch (error) {
      const errorMsg = `[PiperTTS] ❌ Initialization failed: ${error.message || error}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Recursively copy assets folder
   * Helper method to copy the espeak-ng-data directory structure
   */
  private async copyAssetsFolderRecursive(
    assetPath: string,
    destPath: string
  ): Promise<void> {
    try {
      // Create destination directory
      const destExists = await RNFS.exists(destPath);
      if (!destExists) {
        await RNFS.mkdir(destPath);
      }

      // List all files in asset path
      const items = await RNFS.readDirAssets(assetPath);

      for (const item of items) {
        const itemDestPath = `${destPath}/${item.name}`;

        if (item.isDirectory()) {
          // Recursively copy subdirectory
          await this.copyAssetsFolderRecursive(item.path, itemDestPath);
        } else {
          // Copy file
          await RNFS.copyFileAssets(item.path, itemDestPath);
        }
      }
    } catch (error) {
      console.error(`[PiperTTS] Error copying folder ${assetPath}:`, error);
      throw error;
    }
  }

  /**
   * Speak text using Piper voice
   */
  async speak(text: string, speed: number = 1.0): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.isSpeakingFlag = true;
      const speakerId = 0; // Single-speaker model

      // Generate and play audio
      await TTSManager.generateAndPlay(text, speakerId, speed);

      this.isSpeakingFlag = false;
    } catch (error) {
      this.isSpeakingFlag = false;
      console.error('[PiperTTS] Error speaking text:', error);
      throw error;
    }
  }

  /**
   * Generate audio file without playing it
   * Returns the path to the generated WAV file
   */
  async generateAudio(text: string, speed: number = 1.0): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const speakerId = 0;
      const wavPath = await TTSManager.generate(text, speakerId, speed);
      return wavPath;
    } catch (error) {
      console.error('[PiperTTS] Error generating audio:', error);
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  async stop(): Promise<void> {
    try {
      await TTSManager.stopPlaying();
      this.isSpeakingFlag = false;
    } catch (error) {
      console.error('[PiperTTS] Error stopping TTS:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isSpeakingFlag;
  }

  /**
   * Clean up resources
   */
  async deinitialize(): Promise<void> {
    try {
      await TTSManager.deinitialize();
      this.isInitialized = false;
      console.log('[PiperTTS] Deinitialized');
    } catch (error) {
      console.error('[PiperTTS] Error deinitializing:', error);
    }
  }
}

export default PiperTTSService;

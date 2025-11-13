/**
 * Text-to-Speech Service
 * Handles converting text to speech for alarm announcements
 * Uses custom Piper voice model via sherpa-onnx with fallback to system TTS
 */

import PiperTTSService from './PiperTTSService';
import Tts from 'react-native-tts';

class TTSService {
  private static instance: TTSService;
  private piperTTS: PiperTTSService | null = null;
  private isInitialized: boolean = false;
  private usePiper: boolean = false;
  private speechRate: number = 1.0; // Speed for Piper (1.0 = normal)

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Initialize TTS engine with Piper voice and system TTS fallback
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Try to initialize Piper TTS (custom voice)
    try {
      console.log('[TTSService] Initializing Piper TTS...');
      this.piperTTS = PiperTTSService.getInstance();
      await this.piperTTS.initialize();
      this.usePiper = true;
      console.log('[TTSService] ✅ Piper TTS initialized successfully');
    } catch (piperError) {
      console.error('[TTSService] ❌ Piper TTS failed, falling back to system TTS:', piperError);
      this.usePiper = false;
      this.piperTTS = null;

      // Show alert to user (non-blocking)
      const {Alert} = require('react-native');
      const errorMessage = piperError?.message || String(piperError);
      Alert.alert(
        'Piper TTS Failed',
        `Using system voice instead.\n\nError: ${errorMessage}`,
        [{text: 'OK'}]
      );
    }

    // Initialize system TTS (either as fallback or primary)
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);
      const voices = await Tts.voices();
      const preferredVoices = voices.filter((v: any) => v.language.startsWith('en-US'));
      if (preferredVoices.length > 0) {
        await Tts.setDefaultVoice(preferredVoices[0].id);
      }
      console.log('[TTSService] ✅ System TTS initialized');
    } catch (systemError) {
      console.error('[TTSService] ❌ System TTS failed:', systemError);
    }

    this.isInitialized = true;
  }

  /**
   * Speak text using Piper voice or system TTS fallback
   */
  async speak(text: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.usePiper && this.piperTTS) {
        console.log('[TTSService] Speaking with Piper voice...');
        await this.piperTTS.speak(text, this.speechRate);
      } else {
        console.log('[TTSService] Speaking with system TTS...');
        await Tts.speak(text);
      }
    } catch (error) {
      console.error('[TTSService] Error speaking text:', error);
      // Try fallback if Piper fails
      if (this.usePiper) {
        console.warn('[TTSService] Piper failed, trying system TTS...');
        try {
          await Tts.speak(text);
        } catch (fallbackError) {
          console.error('[TTSService] Fallback also failed:', fallbackError);
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Stop speaking
   */
  async stop(): Promise<void> {
    try {
      if (this.usePiper && this.piperTTS) {
        await this.piperTTS.stop();
      } else {
        await Tts.stop();
      }
    } catch (error) {
      console.error('[TTSService] Error stopping TTS:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      if (this.usePiper && this.piperTTS) {
        return this.piperTTS.isSpeaking();
      } else {
        return await Tts.isSpeaking();
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Set speech rate/speed
   * For Piper: 1.0 = normal, < 1.0 = slower, > 1.0 = faster
   */
  async setRate(rate: number): Promise<void> {
    // Convert from react-native-tts rate (0.01-0.99) to Piper speed (0.5-2.0)
    // Map 0.5 -> 0.5 (slow), 0.75 -> 1.0 (normal), 0.99 -> 2.0 (fast)
    if (rate < 0.5) {
      this.speechRate = 0.5;
    } else if (rate < 0.75) {
      // 0.5-0.75 maps to 0.5-1.0
      this.speechRate = 0.5 + (rate - 0.5) * 2.0;
    } else {
      // 0.75-0.99 maps to 1.0-2.0
      this.speechRate = 1.0 + ((rate - 0.75) / 0.24) * 1.0;
    }
    console.log(`[TTSService] Set speech rate to ${this.speechRate}`);
  }

  /**
   * Set pitch - Not supported by Piper, but kept for API compatibility
   */
  async setPitch(_pitch: number): Promise<void> {
    console.warn('[TTSService] Pitch adjustment not supported by Piper TTS');
  }

  /**
   * Get available voices - Returns Piper voice info
   */
  async getVoices(): Promise<any[]> {
    return [
      {
        id: 'piper-randy-farmer',
        name: 'Randy Farmer (Piper)',
        language: 'en-US',
        quality: 400, // Higher quality than system voices
      },
    ];
  }

  /**
   * Set voice by ID - Only one Piper voice available currently
   */
  async setVoice(voiceId: string): Promise<void> {
    if (voiceId !== 'piper-randy-farmer') {
      console.warn(`[TTSService] Voice ${voiceId} not available, using default Piper voice`);
    }
  }
}

export default TTSService;

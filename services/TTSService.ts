/**
 * Text-to-Speech Service
 * Handles converting text to speech for alarm announcements
 */

import Tts from 'react-native-tts';

class TTSService {
  private static instance: TTSService;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Initialize TTS engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set default settings
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5); // Slightly slower for clarity
      await Tts.setDefaultPitch(1.0);

      // Get available voices
      const voices = await Tts.voices();
      console.log('Available TTS voices:', voices);

      // Try to use a high-quality voice if available
      const preferredVoices = voices.filter((v: any) =>
        v.language.startsWith('en-US'),
      );

      if (preferredVoices.length > 0) {
        await Tts.setDefaultVoice(preferredVoices[0].id);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing TTS:', error);
      throw error;
    }
  }

  /**
   * Speak text
   */
  async speak(text: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await Tts.speak(text);
    } catch (error) {
      console.error('Error speaking text:', error);
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  async stop(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Tts.isSpeaking();
    } catch (error) {
      console.error('Error checking TTS status:', error);
      return false;
    }
  }

  /**
   * Set speech rate (0.01 to 0.99)
   */
  async setRate(rate: number): Promise<void> {
    try {
      await Tts.setDefaultRate(Math.max(0.01, Math.min(0.99, rate)));
    } catch (error) {
      console.error('Error setting TTS rate:', error);
    }
  }

  /**
   * Set pitch (0.5 to 2.0)
   */
  async setPitch(pitch: number): Promise<void> {
    try {
      await Tts.setDefaultPitch(Math.max(0.5, Math.min(2.0, pitch)));
    } catch (error) {
      console.error('Error setting TTS pitch:', error);
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    try {
      return await Tts.voices();
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  /**
   * Set voice by ID
   */
  async setVoice(voiceId: string): Promise<void> {
    try {
      await Tts.setDefaultVoice(voiceId);
    } catch (error) {
      console.error('Error setting voice:', error);
    }
  }
}

export default TTSService;

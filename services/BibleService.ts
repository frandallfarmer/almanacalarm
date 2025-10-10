/**
 * Bible Service
 * Handles fetching Bible verses from bible-api.com
 */

export interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

interface BibleApiResponse {
  reference: string;
  verses: Array<{
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name: string;
}

class BibleService {
  private static instance: BibleService;
  private readonly BASE_URL = 'https://bible-api.com';

  // Curated list of popular verses for daily rotation
  private readonly DAILY_VERSES = [
    'John 3:16',
    'Psalm 23:1',
    'Philippians 4:13',
    'Jeremiah 29:11',
    'Proverbs 3:5-6',
    'Romans 8:28',
    'Isaiah 41:10',
    'Matthew 28:20',
    'Psalm 46:1',
    'John 14:6',
    'Romans 12:2',
    'Joshua 1:9',
    'Psalm 118:24',
    'Proverbs 16:3',
    'Matthew 6:33',
    'Psalm 37:4',
    '1 Corinthians 13:4-8',
    'Ephesians 2:8-9',
    'Psalm 119:105',
    'Isaiah 40:31',
    'Romans 5:8',
    'Galatians 5:22-23',
    'Matthew 11:28',
    'Psalm 121:1-2',
    '2 Timothy 1:7',
    'Hebrews 11:1',
    'James 1:2-3',
    'Colossians 3:23',
    '1 John 4:19',
    'Psalm 27:1',
    'Matthew 5:14-16',
  ];

  private constructor() {}

  static getInstance(): BibleService {
    if (!BibleService.instance) {
      BibleService.instance = new BibleService();
    }
    return BibleService.instance;
  }

  /**
   * Get verse index based on current date (same verse each day)
   */
  private getDailyVerseIndex(): number {
    const today = new Date();
    // Use year and day of year to calculate index
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24,
    );
    const yearOffset = today.getFullYear() % this.DAILY_VERSES.length;
    return (dayOfYear + yearOffset) % this.DAILY_VERSES.length;
  }

  /**
   * Get verse of the day (changes daily)
   */
  async getVerseOfTheDay(): Promise<BibleVerse> {
    const verseIndex = this.getDailyVerseIndex();
    const verseReference = this.DAILY_VERSES[verseIndex];

    return this.getVerse(verseReference);
  }

  /**
   * Get a specific verse by reference
   */
  async getVerse(reference: string): Promise<BibleVerse> {
    try {
      // Format reference for URL (replace spaces with +)
      const formattedRef = reference.replace(/\s+/g, '+');
      const url = `${this.BASE_URL}/${formattedRef}?translation=kjv`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BibleApiResponse = await response.json();

      // Clean up text (remove verse numbers and extra whitespace)
      const cleanText = data.text
        .replace(/\[\d+\]/g, '') // Remove verse numbers like [1]
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      return {
        reference: data.reference,
        text: cleanText,
        translation: data.translation_name || 'King James Version',
      };
    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      throw error;
    }
  }

  /**
   * Get a random verse
   */
  async getRandomVerse(): Promise<BibleVerse> {
    try {
      const url = `${this.BASE_URL}/data/random`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BibleApiResponse = await response.json();

      const cleanText = data.text
        .replace(/\[\d+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        reference: data.reference,
        text: cleanText,
        translation: data.translation_name || 'King James Version',
      };
    } catch (error) {
      console.error('Error fetching random verse:', error);
      throw error;
    }
  }

  /**
   * Get verse information as spoken text for alarm
   */
  getVerseSpeechText(verse: BibleVerse): string {
    return `Today's Bible verse is from ${verse.reference}. ${verse.text}`;
  }
}

export default BibleService;

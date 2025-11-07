#!/usr/bin/env python3
"""
Podcast to Piper Training Data Processor - Speaker-Aware Version

This script processes podcast audio (MP3) and HTML transcripts into
sentence-level chunks suitable for Piper TTS training.

ONLY extracts segments where Randy is speaking (filters out other speakers).

Requirements:
    pip3 install pydub beautifulsoup4 lxml nltk

    Also requires ffmpeg:
    sudo apt-get install ffmpeg

Usage:
    python prepare_podcast_training_data.py \
        --audio-dir /path/to/audio \
        --transcript-dir /path/to/transcripts \
        --output-dir ./piper_training_data \
        --speaker "Randy"
"""

import os
import re
import sys
import argparse
import csv
from pathlib import Path
from typing import List, Tuple, Dict, Optional
import subprocess

try:
    from pydub import AudioSegment
    from bs4 import BeautifulSoup
    import nltk
    from nltk.tokenize import sent_tokenize
except ImportError as e:
    print(f"ERROR: Missing required package: {e}")
    print("\nPlease install dependencies:")
    print("  pip3 install pydub beautifulsoup4 lxml nltk")
    print("  sudo apt-get install ffmpeg")
    sys.exit(1)

# Download NLTK data if not already present
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt_tab')


class PodcastProcessor:
    """Process podcast audio and transcripts for Piper TTS training (speaker-aware)"""

    def __init__(self, output_dir: str, target_speaker: str = "Randy"):
        self.output_dir = Path(output_dir)
        self.wavs_dir = self.output_dir / "wavs"
        self.wavs_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.output_dir / "metadata.csv"
        self.sentence_counter = 0
        self.target_speaker = target_speaker

    def get_audio_filename_from_html(self, html_path: str) -> Optional[str]:
        """
        Extract the audio filename referenced in the HTML transcript
        Looks for <source src="/podcasts/filename.mp3">
        """
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()

            soup = BeautifulSoup(html_content, 'html.parser')
            source_tag = soup.find('source', {'type': 'audio/mpeg'})

            if source_tag and source_tag.get('src'):
                src = source_tag.get('src')
                # Extract just the filename from path like "/podcasts/filename.mp3"
                filename = Path(src).name
                return filename
        except Exception as e:
            print(f"  WARNING: Could not extract audio filename from {html_path}: {e}")

        return None

    def extract_speaker_segments(self, html_path: str) -> List[Dict[str, str]]:
        """
        Extract text segments by speaker from HTML transcript

        Returns list of dicts: [{"speaker": "Randy", "text": "Welcome to episode two..."}]
        """
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        soup = BeautifulSoup(html_content, 'html.parser')

        segments = []

        # Find all paragraphs with class MsoNormal (the transcript paragraphs)
        paragraphs = soup.find_all('p', class_='MsoNormal')

        for p in paragraphs:
            # Look for <strong>Speaker</strong> at the beginning of the paragraph
            strong_tag = p.find('strong')

            if not strong_tag:
                continue

            speaker_name = strong_tag.get_text().strip()

            # Skip if this isn't a speaker label (e.g., News:, Topic:, Tips:, etc.)
            # Also skip 'B' which is a typo in some HTML files
            if speaker_name in ['News', 'Topic', 'Tips', 'B', 'Subscribe', 'Subscribe:']:
                continue

            # Get ALL text from this paragraph (the complete utterance)
            # This includes everything after the speaker name until the next paragraph
            full_text = p.get_text()

            # Remove the speaker label from the beginning
            # Pattern: "Speaker:   text" or "Speaker:        text"
            text = re.sub(r'^' + re.escape(speaker_name) + r'[:\s]+', '', full_text)

            text = text.strip()

            if text and speaker_name:
                segments.append({
                    "speaker": speaker_name,
                    "text": text
                })

        return segments

    def filter_speaker_segments(self, segments: List[Dict[str, str]],
                               target_speaker: str) -> str:
        """
        Filter segments to only include target speaker's text

        Returns concatenated text of target speaker's segments
        """
        target_texts = []

        for segment in segments:
            if segment["speaker"] == target_speaker:
                target_texts.append(segment["text"])

        return ' '.join(target_texts)

    def clean_sentence(self, sentence: str) -> str:
        """Clean sentence for TTS training"""
        # Remove extra whitespace
        sentence = ' '.join(sentence.split())

        # Remove URLs
        sentence = re.sub(r'http[s]?://\S+', '', sentence)

        # Remove email addresses
        sentence = re.sub(r'\S+@\S+', '', sentence)

        # Remove HTML entities
        sentence = re.sub(r'&nbsp;', ' ', sentence)
        sentence = re.sub(r'&[a-z]+;', '', sentence)

        # Remove special characters but keep punctuation
        # Keep: letters, numbers, spaces, basic punctuation, apostrophes
        sentence = re.sub(r'[^a-zA-Z0-9\s\.,!?\'\-]', '', sentence)

        # Clean up whitespace again
        sentence = ' '.join(sentence.split())

        return sentence.strip()

    def is_valid_sentence(self, sentence: str, min_words: int = 3, max_words: int = 50) -> bool:
        """Check if sentence is suitable for training"""
        if not sentence:
            return False

        word_count = len(sentence.split())

        # Filter by word count
        if word_count < min_words or word_count > max_words:
            return False

        # Must contain at least one letter
        if not re.search(r'[a-zA-Z]', sentence):
            return False

        # Skip sentences that are mostly numbers
        words = sentence.split()
        number_words = sum(1 for word in words if word.replace(',', '').replace('.', '').isdigit())
        if len(words) > 0 and number_words / len(words) > 0.5:
            return False

        return True

    def split_text_into_sentences(self, text: str) -> List[str]:
        """Split text into clean sentences"""
        # Use NLTK sentence tokenizer
        sentences = sent_tokenize(text)

        cleaned_sentences = []
        for sentence in sentences:
            cleaned = self.clean_sentence(sentence)
            if self.is_valid_sentence(cleaned):
                cleaned_sentences.append(cleaned)

        return cleaned_sentences

    def convert_to_wav(self, audio_path: str, output_path: str) -> bool:
        """Convert audio to WAV 22050Hz mono for Piper training"""
        try:
            audio = AudioSegment.from_file(audio_path)

            # Convert to mono
            audio = audio.set_channels(1)

            # Set sample rate to 22050 Hz (Piper standard)
            audio = audio.set_frame_rate(22050)

            # Set sample width to 2 bytes (16-bit)
            audio = audio.set_sample_width(2)

            # Export as WAV
            audio.export(output_path, format="wav")
            return True
        except Exception as e:
            print(f"ERROR converting {audio_path}: {e}")
            return False

    def estimate_speaker_time(self, segments: List[Dict[str, str]],
                             target_speaker: str,
                             total_duration_ms: float,
                             words_per_minute: float = 150) -> List[Tuple[float, float, str]]:
        """
        Estimate timing for each speaker segment based on word count

        Returns list of (start_ms, end_ms, text) tuples for target speaker only
        """
        # Calculate speaking time for each segment
        segment_durations = []
        for seg in segments:
            word_count = len(seg["text"].split())
            duration_ms = (word_count / words_per_minute) * 60 * 1000
            segment_durations.append(duration_ms)

        # Calculate total estimated duration
        total_estimated = sum(segment_durations)

        # Scale to match actual audio duration (accounting for pauses, intro music, etc.)
        time_scale = total_duration_ms / total_estimated if total_estimated > 0 else 1.0

        # Build timeline with start/end times
        timeline = []
        current_time = 0

        for i, seg in enumerate(segments):
            scaled_duration = segment_durations[i] * time_scale

            if seg["speaker"] == target_speaker:
                timeline.append((
                    current_time,
                    current_time + scaled_duration,
                    seg["text"]
                ))

            current_time += scaled_duration

        return timeline

    def split_audio_by_speaker_segments(self, audio_path: str,
                                       timeline: List[Tuple[float, float, str]]) -> List[Tuple[str, str]]:
        """
        Extract audio segments based on speaker timeline

        Each timeline entry is one complete utterance from the target speaker.
        We extract the audio for each utterance (no sentence splitting).

        timeline: List of (start_ms, end_ms, full_utterance_text) tuples
        Returns list of (wav_filename, utterance_text) tuples
        """
        try:
            # Load full audio
            audio = AudioSegment.from_file(audio_path)

            # Convert to mono 22050Hz
            audio = audio.set_channels(1).set_frame_rate(22050).set_sample_width(2)

            results = []

            for start_ms, end_ms, text in timeline:
                # Keep the full utterance text (no sentence splitting)
                # Just clean it up a bit
                cleaned_text = self.clean_sentence(text)

                if not cleaned_text or len(cleaned_text.split()) < 3:
                    # Skip very short utterances
                    continue

                # Add small buffer before/after for clean audio extraction
                buffer = 200  # 200ms
                extract_start = max(0, start_ms - buffer)
                extract_end = min(len(audio), end_ms + buffer)

                # Extract audio chunk for this complete utterance
                chunk = audio[extract_start:extract_end]

                # Generate filename
                self.sentence_counter += 1
                wav_filename = f"utterance_{self.sentence_counter:04d}.wav"
                wav_path = self.wavs_dir / wav_filename

                # Export chunk
                chunk.export(wav_path, format="wav")

                results.append((wav_filename, cleaned_text))

            return results

        except Exception as e:
            print(f"ERROR splitting audio {audio_path}: {e}")
            return []

    def process_podcast(self, audio_file: str, transcript_file: str) -> int:
        """
        Process a single podcast episode - extract only target speaker
        Returns number of sentences processed
        """
        print(f"\n{'='*60}")
        print(f"Processing: {Path(audio_file).name}")
        print(f"Transcript: {Path(transcript_file).name}")
        print(f"Target speaker: {self.target_speaker}")
        print(f"{'='*60}")

        # Extract speaker segments from HTML
        segments = self.extract_speaker_segments(transcript_file)
        print(f"Found {len(segments)} total speaker segments")

        # Count segments by speaker
        speaker_counts = {}
        for seg in segments:
            speaker = seg["speaker"]
            speaker_counts[speaker] = speaker_counts.get(speaker, 0) + 1

        print(f"Speakers in this episode:")
        for speaker, count in sorted(speaker_counts.items()):
            marker = " ← TARGET" if speaker == self.target_speaker else ""
            print(f"  {speaker}: {count} segments{marker}")

        # Filter to target speaker
        target_segments = [s for s in segments if s["speaker"] == self.target_speaker]

        if not target_segments:
            print(f"WARNING: No segments found for speaker '{self.target_speaker}', skipping")
            return 0

        print(f"Extracting {len(target_segments)} segments from {self.target_speaker}")

        # Load audio to get duration
        try:
            audio = AudioSegment.from_file(audio_file)
            total_duration_ms = len(audio)
            print(f"Audio duration: {total_duration_ms / 1000 / 60:.1f} minutes")
        except Exception as e:
            print(f"ERROR loading audio: {e}")
            return 0

        # Estimate timing for speaker segments
        timeline = self.estimate_speaker_time(segments, self.target_speaker,
                                              total_duration_ms)

        # Split audio and generate metadata
        results = self.split_audio_by_speaker_segments(audio_file, timeline)

        # Write to metadata.csv
        with open(self.metadata_file, 'a', encoding='utf-8', newline='') as f:
            writer = csv.writer(f, delimiter='|')
            for wav_filename, sentence_text in results:
                writer.writerow([wav_filename, sentence_text])

        print(f"✓ Generated {len(results)} audio chunks for {self.target_speaker}")
        return len(results)

    def process_directory(self, audio_dir: str, transcript_dir: str,
                         audio_ext: str = ".mp3", transcript_ext: str = ".html",
                         limit: Optional[int] = None):
        """Process all matching audio and transcript files in directories"""
        audio_path = Path(audio_dir)
        transcript_path = Path(transcript_dir)

        # Find all audio files
        audio_files = sorted(audio_path.glob(f"**/*{audio_ext}"))

        # Apply limit if specified
        if limit is not None:
            audio_files = audio_files[:limit]
            print(f"⚠ LIMIT: Processing only first {limit} file(s) for testing\n")

        if not audio_files:
            print(f"ERROR: No audio files found in {audio_dir} with extension {audio_ext}")
            return

        print(f"\n{'='*60}")
        print(f"PODCAST TO PIPER TRAINING DATA PROCESSOR")
        print(f"{'='*60}")
        print(f"Audio directory: {audio_dir}")
        print(f"Transcript directory: {transcript_dir}")
        print(f"Target speaker: {self.target_speaker}")
        print(f"Found {len(audio_files)} audio files")
        print(f"{'='*60}\n")

        # Build mapping from audio filenames to transcript files by reading HTML
        print("Building audio-to-transcript mapping from HTML files...")
        transcript_map = {}  # Maps audio filename to transcript path

        for transcript_file in transcript_path.glob(f"**/*{transcript_ext}"):
            audio_filename = self.get_audio_filename_from_html(str(transcript_file))
            if audio_filename:
                transcript_map[audio_filename.lower()] = transcript_file
                print(f"  {audio_filename} → {transcript_file.name}")

        print(f"\nMapped {len(transcript_map)} transcript files to audio filenames\n")

        # Initialize metadata file
        if self.metadata_file.exists():
            self.metadata_file.unlink()

        total_sentences = 0
        processed_count = 0
        skipped_count = 0

        for audio_file in audio_files:
            # Look up transcript using the mapping we built from HTML files
            audio_filename_lower = audio_file.name.lower()
            transcript_file = transcript_map.get(audio_filename_lower)

            if not transcript_file:
                print(f"⚠ WARNING: No transcript found for {audio_file.name}")
                print(f"  This audio file is not referenced in any HTML transcript")
                skipped_count += 1
                continue

            print(f"\n✓ Matched: {audio_file.name} → {transcript_file.name}")

            # Process this podcast
            count = self.process_podcast(str(audio_file), str(transcript_file))

            if count > 0:
                total_sentences += count
                processed_count += 1
            else:
                skipped_count += 1

        print(f"\n{'='*60}")
        print(f"PROCESSING COMPLETE!")
        print(f"{'='*60}")
        print(f"Speaker extracted: {self.target_speaker}")
        print(f"Episodes processed: {processed_count}")
        print(f"Episodes skipped: {skipped_count}")
        print(f"Training samples: {total_sentences}")
        print(f"")
        print(f"Output directory: {self.output_dir}")
        print(f"WAV files: {self.wavs_dir}")
        print(f"Metadata: {self.metadata_file}")
        print(f"{'='*60}\n")

        # Calculate estimated training duration
        if total_sentences > 0:
            # Rough estimate: average 5 seconds per sentence
            est_duration_min = (total_sentences * 5) / 60
            print(f"Estimated audio duration: {est_duration_min:.1f} minutes")

            if est_duration_min < 30:
                print(f"⚠ NOTE: Target 30-60 minutes for good training quality")
            elif est_duration_min > 90:
                print(f"⚠ NOTE: You have plenty of data! Can reduce to 45-60 min if needed")
            else:
                print(f"✓ Good amount of training data!")
            print()


def main():
    parser = argparse.ArgumentParser(
        description='Prepare podcast audio and transcripts for Piper TTS training (speaker-aware)'
    )
    parser.add_argument('--audio-dir', required=True, help='Directory containing podcast MP3 files')
    parser.add_argument('--transcript-dir', required=True, help='Directory containing HTML transcripts')
    parser.add_argument('--output-dir', default='./piper_training_data', help='Output directory for training data')
    parser.add_argument('--speaker', default='Randy', help='Speaker name to extract (default: Randy)')
    parser.add_argument('--audio-ext', default='.mp3', help='Audio file extension (default: .mp3)')
    parser.add_argument('--transcript-ext', default='.html', help='Transcript file extension (default: .html)')
    parser.add_argument('--limit', type=int, help='Limit processing to first N files (for testing)')

    args = parser.parse_args()

    # Check if directories exist
    if not os.path.exists(args.audio_dir):
        print(f"ERROR: Audio directory not found: {args.audio_dir}")
        sys.exit(1)

    if not os.path.exists(args.transcript_dir):
        print(f"ERROR: Transcript directory not found: {args.transcript_dir}")
        sys.exit(1)

    # Create processor and run
    processor = PodcastProcessor(args.output_dir, args.speaker)
    processor.process_directory(args.audio_dir, args.transcript_dir,
                               args.audio_ext, args.transcript_ext, args.limit)


if __name__ == '__main__':
    main()

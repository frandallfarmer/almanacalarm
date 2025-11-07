#!/usr/bin/env python3
"""
Simple audio alignment using silence detection

This finds speech segments in audio by detecting silences,
then matches them to speaker segments based on duration.
"""

from pydub import AudioSegment
from pydub.silence import detect_nonsilent
from typing import List, Tuple
import sys


def detect_speech_segments(audio_path: str,
                          min_silence_len: int = 500,
                          silence_thresh: int = -40) -> List[Tuple[int, int]]:
    """
    Detect speech segments by finding non-silent portions of audio

    Returns list of (start_ms, end_ms) tuples for speech segments
    """
    print(f"Loading audio: {audio_path}")
    audio = AudioSegment.from_file(audio_path)

    print(f"Detecting speech segments (silence threshold: {silence_thresh}dB)...")
    nonsilent_ranges = detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,  # Minimum silence length in ms
        silence_thresh=silence_thresh      # Silence threshold in dB
    )

    print(f"Found {len(nonsilent_ranges)} speech segments")
    return nonsilent_ranges


def match_segments_to_speakers(speech_segments: List[Tuple[int, int]],
                               speaker_segments: List[dict]) -> List[Tuple[int, int, str, str]]:
    """
    Match detected speech segments to speaker text segments

    Returns list of (start_ms, end_ms, speaker, text) tuples
    """
    results = []
    speech_idx = 0

    for speaker_seg in speaker_segments:
        if speech_idx >= len(speech_segments):
            break

        # Estimate expected duration for this speaker segment based on text length
        text_length = len(speaker_seg['text'])
        # Rough estimate: 150 words/min = ~800 chars/min = ~13 chars/sec
        estimated_duration_ms = (text_length / 13) * 1000

        # Find speech segment(s) that match this duration
        start_ms = speech_segments[speech_idx][0]
        accumulated_duration = 0
        end_ms = start_ms

        while speech_idx < len(speech_segments) and accumulated_duration < estimated_duration_ms * 0.8:
            seg_start, seg_end = speech_segments[speech_idx]
            accumulated_duration += (seg_end - seg_start)
            end_ms = seg_end
            speech_idx += 1

        results.append((start_ms, end_ms, speaker_seg['speaker'], speaker_seg['text']))

    return results


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python simple_audio_alignment.py <audio_file>")
        sys.exit(1)

    audio_file = sys.argv[1]
    segments = detect_speech_segments(audio_file)

    print("\nSpeech segments:")
    for i, (start, end) in enumerate(segments[:10], 1):
        duration = (end - start) / 1000
        print(f"  {i}. {start/1000:.1f}s - {end/1000:.1f}s (duration: {duration:.1f}s)")

    if len(segments) > 10:
        print(f"  ... and {len(segments) - 10} more segments")

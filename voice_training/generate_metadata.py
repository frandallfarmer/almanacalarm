#!/usr/bin/env python3
"""
Generate metadata.csv for Piper TTS training from transcript files.

Matches segmented audio files with transcript paragraphs.
A paragraph is separated from the next by TWO line breaks (blank line).
"""

import re
import os

def extract_paragraphs(text, content_marker):
    """
    Extract paragraphs from text.
    Paragraphs are separated by blank lines (double line breaks).
    Only extracts content after the specified marker section.

    Args:
        text: Full text content
        content_marker: Header marking start of actual content (e.g., "## Transcript" or "## Sample Script")

    Returns list of paragraphs with whitespace trimmed.
    """
    # Find the content section
    if content_marker in text:
        # Extract everything after the marker
        parts = text.split(content_marker, 1)
        if len(parts) > 1:
            text = parts[1]

    # Normalize whitespace-only lines to empty lines
    # This treats lines with only spaces/tabs as blank lines
    lines = text.split('\n')
    normalized_lines = []
    for line in lines:
        if line.strip() == '':
            normalized_lines.append('')
        else:
            normalized_lines.append(line)
    text = '\n'.join(normalized_lines)

    # Split on double newlines (blank lines)
    # This regex matches 2 or more newlines
    paragraphs = re.split(r'\n\n+', text)

    # Clean up each paragraph
    cleaned = []
    for para in paragraphs:
        # Remove single line breaks within paragraphs (replace with space)
        para = para.replace('\n', ' ')
        # Collapse multiple spaces
        para = re.sub(r'\s+', ' ', para)
        # Strip leading/trailing whitespace
        para = para.strip()

        # Skip empty paragraphs, markdown elements, and metadata
        if not para:
            continue
        if para.startswith('#'):  # Headers
            continue
        if para.startswith('**'):  # Bold metadata
            continue
        if para == '---':  # Markdown separator
            continue
        if para.startswith('-') and len(para) < 200:  # Likely a bullet list, skip short ones
            continue
        if para.startswith('1.') or para.startswith('2.'):  # Numbered lists
            continue

        cleaned.append(para)

    return cleaned

def process_transcript(transcript_path, prefix, num_files, content_marker="## Transcript"):
    """
    Process a transcript file and return metadata entries.

    Args:
        transcript_path: Path to transcript file
        prefix: Audio file prefix (e.g., 'speedchat', 'Almanac')
        num_files: Expected number of audio segments
        content_marker: Markdown header marking start of content

    Returns:
        List of (filename, transcript) tuples
    """
    with open(transcript_path, 'r', encoding='utf-8') as f:
        text = f.read()

    paragraphs = extract_paragraphs(text, content_marker)

    # Match paragraphs to audio files
    entries = []
    for i in range(1, num_files + 1):
        filename = f"{prefix}-{i:02d}.wav"

        if i - 1 < len(paragraphs):
            transcript = paragraphs[i - 1]
            entries.append((filename, transcript))
        else:
            print(f"WARNING: No transcript for {filename} (only {len(paragraphs)} paragraphs found)")
            entries.append((filename, "[MISSING TRANSCRIPT]"))

    if len(paragraphs) > num_files:
        print(f"WARNING: {len(paragraphs)} paragraphs found but only {num_files} audio files for {prefix}")

    return entries

def main():
    base_dir = "/home/user/almanacalarm/voice_training"

    # Process speedchat (32 files)
    print("Processing speedchat transcript...")
    speedchat_entries = process_transcript(
        os.path.join(base_dir, "transcripts/blog_post_speedchat.txt"),
        "speedchat",
        32,
        content_marker="## Transcript"
    )

    # Process Almanac (10 files)
    print("Processing Almanac transcript...")
    almanac_entries = process_transcript(
        os.path.join(base_dir, "transcripts/sample_sentences.txt"),
        "Almanac",
        10,
        content_marker="## Sample Script"
    )

    # Combine all entries
    all_entries = speedchat_entries + almanac_entries

    # Write metadata.csv
    output_path = os.path.join(base_dir, "metadata.csv")
    with open(output_path, 'w', encoding='utf-8') as f:
        for filename, transcript in all_entries:
            # Piper metadata format: filename|transcript
            f.write(f"{filename}|{transcript}\n")

    print(f"\nGenerated {output_path}")
    print(f"Total entries: {len(all_entries)}")
    print(f"  - speedchat: {len(speedchat_entries)} files")
    print(f"  - Almanac: {len(almanac_entries)} files")

    # Show first few entries as preview
    print("\nFirst 3 entries:")
    for filename, transcript in all_entries[:3]:
        preview = transcript[:100] + "..." if len(transcript) > 100 else transcript
        print(f"  {filename}: {preview}")

if __name__ == "__main__":
    main()

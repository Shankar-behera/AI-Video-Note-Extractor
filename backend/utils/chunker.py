"""
Transcript chunking utility.
Splits long transcripts into manageable chunks for the map phase.
"""
import re
from typing import List


def chunk_transcript(
    transcript: str,
    words_per_chunk: int = 800,
    overlap_words: int = 50,
) -> List[str]:
    """
    Split transcript into overlapping chunks by word count.
    Tries to split on sentence boundaries where possible.

    Args:
        transcript: Full transcript text
        words_per_chunk: Target words per chunk (~5-7 min of speech)
        overlap_words: Words to overlap between chunks for context

    Returns:
        List of text chunks
    """
    if not transcript or not transcript.strip():
        return []

    # Clean up whitespace
    transcript = re.sub(r"\s+", " ", transcript).strip()

    # Split into sentences first
    sentences = _split_sentences(transcript)

    if not sentences:
        return [transcript]

    # Build chunks by accumulating sentences
    chunks = []
    current_chunk_sentences = []
    current_word_count = 0

    for sentence in sentences:
        sentence_words = len(sentence.split())

        if current_word_count + sentence_words > words_per_chunk and current_chunk_sentences:
            # Finalize current chunk
            chunks.append(" ".join(current_chunk_sentences))

            # Carry over overlap from the end of current chunk
            if overlap_words > 0:
                overlap_text = " ".join(current_chunk_sentences)
                overlap_words_list = overlap_text.split()[-overlap_words:]
                current_chunk_sentences = [" ".join(overlap_words_list)]
                current_word_count = len(overlap_words_list)
            else:
                current_chunk_sentences = []
                current_word_count = 0

        current_chunk_sentences.append(sentence)
        current_word_count += sentence_words

    # Don't forget the last chunk
    if current_chunk_sentences:
        chunks.append(" ".join(current_chunk_sentences))

    return [c.strip() for c in chunks if c.strip()]


def _split_sentences(text: str) -> List[str]:
    """Split text into sentences using regex."""
    # Split on sentence-ending punctuation followed by space + capital letter
    sentence_endings = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")
    sentences = sentence_endings.split(text)
    return [s.strip() for s in sentences if s.strip()]


def estimate_chunk_count(transcript: str, words_per_chunk: int = 800) -> int:
    """Estimate how many chunks a transcript will produce."""
    word_count = len(transcript.split())
    return max(1, round(word_count / words_per_chunk))

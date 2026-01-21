#!/usr/bin/env node

/**
 * Readability and Reading Time Analysis Script
 *
 * Calculates Flesch readability metrics and estimates reading time
 * with complexity adjustments for Hugo markdown content.
 *
 * Usage:
 *   node analyze.js <file>          # Analyze file
 *   cat file.md | node analyze.js   # Analyze stdin
 *   node analyze.js --text "..."    # Analyze text argument
 */

import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Reading speed constants
const BASE_WPM = 200; // Base words per minute for standard web content
const CODE_WPM = 80;  // Slower reading for code blocks

/**
 * Count syllables in a word using approximation algorithm
 */
function countSyllables(word) {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove non-alphabetic characters
  word = word.replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;

  // Count vowel groups
  let syllables = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isVowel = 'aeiouy'.includes(char);

    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }

  // Handle silent 'e' at end
  if (word.endsWith('e') && syllables > 1) {
    syllables--;
  }

  // Handle special cases
  if (word.endsWith('le') && word.length > 2 && !'aeiou'.includes(word[word.length - 3])) {
    syllables++;
  }

  // Minimum one syllable per word
  return Math.max(1, syllables);
}

/**
 * Strip YAML frontmatter from markdown content
 */
function stripFrontmatter(content) {
  const lines = content.split('\n');

  // Check if starts with frontmatter delimiter
  if (lines[0] === '---') {
    // Find closing delimiter
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        // Return content after frontmatter
        return lines.slice(i + 1).join('\n');
      }
    }
  }

  return content;
}

/**
 * Extract and process code blocks separately
 * Returns { text, codeWords }
 */
function separateCodeBlocks(content) {
  const codeBlockRegex = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
  const codeBlocks = content.match(codeBlockRegex) || [];

  // Remove code blocks from content
  let textContent = content.replace(codeBlockRegex, '');

  // Count words in code blocks
  let codeWords = 0;
  for (const block of codeBlocks) {
    const blockContent = block.replace(/```|~~~/g, '').trim();
    codeWords += blockContent.split(/\s+/).filter(w => w.length > 0).length;
  }

  return { text: textContent, codeWords };
}

/**
 * Strip markdown formatting while preserving content
 */
function stripMarkdown(content) {
  let text = content;

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^(\*\*\*|---|___)\s*$/gm, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  return text;
}

/**
 * Calculate text statistics
 */
function calculateStatistics(text) {
  // Split into sentences (handle common abbreviations)
  const sentenceEnders = /[.!?]+[\s\n]+/g;
  const sentences = text.split(sentenceEnders).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Split into words
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      words: 0,
      sentences: 0,
      syllables: 0,
      characters: 0,
      avgSentenceLength: 0,
      avgWordLength: 0
    };
  }

  // Count syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }

  // Count characters (excluding spaces)
  const characters = text.replace(/\s/g, '').length;

  return {
    words: wordCount,
    sentences: sentenceCount,
    syllables: syllableCount,
    characters: characters,
    avgSentenceLength: parseFloat((wordCount / sentenceCount).toFixed(1)),
    avgWordLength: parseFloat((characters / wordCount).toFixed(1))
  };
}

/**
 * Calculate Flesch Reading Ease
 * Formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
 * Scale: 0-100 (higher = easier)
 */
function calculateReadingEase(stats) {
  if (stats.words === 0) return 0;

  const wordsPerSentence = stats.words / stats.sentences;
  const syllablesPerWord = stats.syllables / stats.words;

  const score = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);

  return parseFloat(Math.max(0, Math.min(100, score)).toFixed(1));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
 */
function calculateGradeLevel(stats) {
  if (stats.words === 0) return 0;

  const wordsPerSentence = stats.words / stats.sentences;
  const syllablesPerWord = stats.syllables / stats.words;

  const grade = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;

  return parseFloat(Math.max(0, grade).toFixed(1));
}

/**
 * Interpret reading ease score
 */
function interpretReadingEase(score) {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade)';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College)';
  return 'Very Difficult (College graduate)';
}

/**
 * Get recommendation based on reading ease
 */
function getRecommendation(score) {
  if (score >= 60) return 'Good readability for web content';
  if (score >= 50) return 'Acceptable for educated audiences';
  if (score >= 30) return 'Consider simplifying for broader appeal';
  return 'Very difficult - simplify if possible';
}

/**
 * Calculate complexity adjustment factor
 */
function calculateComplexityAdjustment(stats) {
  let adjustment = 1.0;

  // Longer sentences slow reading
  if (stats.avgSentenceLength > 20) {
    adjustment += (stats.avgSentenceLength - 20) * 0.01;
  }

  // Longer words slow reading (3+ syllables per word indicates complexity)
  const syllablesPerWord = stats.syllables / stats.words;
  if (syllablesPerWord > 1.5) {
    adjustment += (syllablesPerWord - 1.5) * 0.2;
  }

  // Cap adjustment at 1.5x (50% slower)
  return parseFloat(Math.min(1.5, adjustment).toFixed(2));
}

/**
 * Estimate reading time
 */
function estimateReadingTime(textWords, codeWords, complexityAdjustment) {
  // Calculate time for regular text
  const textMinutes = (textWords / BASE_WPM) * complexityAdjustment;

  // Calculate time for code blocks (slower)
  const codeMinutes = codeWords / CODE_WPM;

  // Total time
  const totalMinutes = textMinutes + codeMinutes;
  const roundedMinutes = Math.max(1, Math.round(totalMinutes));

  // Calculate range (±20% for reading speed variation)
  const lowerBound = Math.max(1, Math.round(totalMinutes * 0.8));
  const upperBound = Math.max(1, Math.round(totalMinutes * 1.2));

  return {
    minutes: roundedMinutes,
    range: `${lowerBound}-${upperBound} min`,
    words_per_minute: BASE_WPM,
    complexity_adjustment: complexityAdjustment
  };
}

/**
 * Main analysis function
 */
function analyzeContent(content) {
  // Strip frontmatter
  let processed = stripFrontmatter(content);

  // Separate code blocks
  const { text, codeWords } = separateCodeBlocks(processed);

  // Strip markdown formatting
  const cleanText = stripMarkdown(text);

  // Calculate statistics
  const stats = calculateStatistics(cleanText);

  // Calculate readability
  const readingEase = calculateReadingEase(stats);
  const gradeLevel = calculateGradeLevel(stats);
  const interpretation = interpretReadingEase(readingEase);
  const recommendation = getRecommendation(readingEase);

  // Calculate reading time
  const complexityAdjustment = calculateComplexityAdjustment(stats);
  const readingTime = estimateReadingTime(stats.words, codeWords, complexityAdjustment);

  return {
    readability: {
      flesch_reading_ease: readingEase,
      flesch_kincaid_grade: gradeLevel,
      interpretation: interpretation,
      recommendation: recommendation
    },
    reading_time: readingTime,
    statistics: stats
  };
}

/**
 * Main entry point
 */
async function main() {
  try {
    let content = '';

    // Check for --text argument
    const textIndex = process.argv.indexOf('--text');
    if (textIndex !== -1 && process.argv[textIndex + 1]) {
      content = process.argv[textIndex + 1];
    }
    // Check for file argument
    else if (process.argv[2] && !process.argv[2].startsWith('--')) {
      const filePath = process.argv[2];
      content = fs.readFileSync(filePath, 'utf8');
    }
    // Read from stdin
    else if (!process.stdin.isTTY) {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      content = Buffer.concat(chunks).toString('utf8');
    }
    else {
      console.error('Usage: analyze.js <file> | cat file | analyze.js | analyze.js --text "content"');
      process.exit(1);
    }

    if (content.trim().length === 0) {
      console.error('Error: No content to analyze');
      process.exit(1);
    }

    const results = analyzeContent(content);
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

# Readability Analysis Reference

## Overview

The hugo-copywriting skill includes a Node.js script (`scripts/analyze.js`) that provides comprehensive readability analysis, reading time estimation, and text statistics for Hugo content.

## Readability Metrics

### Flesch Reading Ease (0-100 scale)

Higher scores indicate easier reading:

- **90-100**: Very Easy (5th grade)
- **80-89**: Easy (6th grade)
- **70-79**: Fairly Easy (7th grade)
- **60-69**: Standard (8th-9th grade)
- **50-59**: Fairly Difficult (10th-12th grade)
- **30-49**: Difficult (College level)
- **0-29**: Very Difficult (College graduate)

### Flesch-Kincaid Grade Level

Indicates the US grade level required to understand the text. For example:

- Grade 6-8: Middle school (good for web content)
- Grade 9-12: High school (standard business writing)
- Grade 13+: College level (academic or technical)

### Interpretation

The script provides a human-readable interpretation like "Standard", "Fairly Easy", or "Difficult" based on the Flesch Reading Ease score.

### Recommendation

Context-aware suggestions based on content type and audience, such as:

- "Good readability for general web content"
- "Consider simplifying for broader audience"
- "Appropriate for technical documentation"

## Reading Time Estimation

### Minutes to Read

Rounded estimate based on word count and reading speed, adjusted for content complexity.

### Reading Range

Accounts for variation in reading speed (e.g., "4-5 min") to provide realistic expectations.

### Complexity Adjustment

The script adjusts reading time based on:

- **Sentence length**: Longer sentences = slower reading
- **Word difficulty**: More syllables per word = slower reading
- **Code blocks**: Technical content = significantly slower (100 WPM vs 200 WPM)
- **Markdown formatting**: Lists, headings, and emphasis affect pacing

### Base Reading Speed

- **Standard web content**: 200 words per minute
- **Code blocks**: 100 words per minute
- **Complex technical content**: Adjusted down based on sentence/word complexity

## Text Statistics

The script calculates:

- **Word count**: Total words in the content
- **Sentence count**: Total sentences detected
- **Syllable count**: Used for readability formulas
- **Character count**: Total characters (including spaces)
- **Average sentence length**: Words per sentence
- **Average word length**: Characters per word

These statistics help identify patterns like overly long sentences or complex vocabulary.

## Script Usage

### Analyze from File

```bash
cd .claude/skills/hugo-copywriting
node scripts/analyze.js ../../../../hugo/content/posts/my-post.md
```

### Analyze from Stdin

```bash
cat hugo/content/posts/my-post.md | node scripts/analyze.js
```

Or with copied text:

```bash
echo "Your content here. This is a test." | node scripts/analyze.js
```

### Analyze from Text Argument

```bash
node scripts/analyze.js --text "Your content here. This is a test."
```

## Output Format

The script outputs JSON with three main sections:

```json
{
  "readability": {
    "flesch_reading_ease": 72.3,
    "flesch_kincaid_grade": 6.8,
    "interpretation": "Fairly Easy (7th grade)",
    "recommendation": "Good readability for general web content"
  },
  "reading_time": {
    "minutes": 4,
    "range": "4-5 min",
    "words_per_minute": 200,
    "complexity_adjustment": 1.1
  },
  "statistics": {
    "words": 847,
    "sentences": 52,
    "syllables": 1156,
    "characters": 4289,
    "avg_sentence_length": 16.3,
    "avg_word_length": 5.1
  }
}
```

## Content Processing

### Frontmatter Handling

The script automatically strips YAML frontmatter from Hugo content files:

```yaml
---
title: 'My Post'
date: 2024-01-15
---
```

This frontmatter is removed before analysis, so only the actual content is evaluated.

### Markdown Processing

The script handles markdown syntax intelligently:

- **Headers** (`#`, `##`, etc.): Counted as sentences
- **Lists**: Each item counted as a sentence
- **Links**: Link text counted, URLs ignored
- **Emphasis** (`*italic*`, `**bold**`): Text counted normally
- **Images**: Alt text counted, URLs ignored

### Code Block Handling

Code blocks are processed separately with special handling:

- **Detection**: Fenced code blocks (` ``` `) and indented blocks
- **Reading speed**: 100 WPM (slower than prose)
- **Complexity**: Not included in readability formulas
- **Statistics**: Word/character count included

This ensures technical content doesn't skew readability metrics.

### HTML and Special Characters

- HTML tags are stripped before analysis
- Entities like `&nbsp;` are converted to characters
- Unicode characters counted appropriately

## Error Handling

### Common Errors

**File not found:**

```bash
Error: ENOENT: no such file or directory, open 'path/to/file.md'
```

**Solution**: Verify the file path is correct and file exists.

**Permission denied:**

```bash
Error: EACCES: permission denied
```

**Solution**: Check file permissions with `ls -l` and adjust if needed.

**Invalid input:**

```bash
Error: No input provided
```

**Solution**: Provide file path, stdin, or --text argument.

### Debugging

If the script fails:

1. Check Node.js version: `node --version` (requires Node.js 16+)
2. Verify file path is correct
3. Check file permissions
4. Review stderr output for specific error messages
5. Test with simple text: `echo "Test." | node scripts/analyze.js`

## Batch Analysis Example

Analyze all blog posts and compare readability:

```bash
cd .claude/skills/hugo-copywriting

for file in ../../../../hugo/content/posts/*.md; do
  echo "=== $(basename "$file") ==="
  node scripts/analyze.js "$file" | jq '.readability'
done
```

Output:

```json
=== welcome.md ===
{
  "flesch_reading_ease": 72.3,
  "flesch_kincaid_grade": 6.8,
  "interpretation": "Fairly Easy (7th grade)",
  "recommendation": "Good readability for general web content"
}
=== tutorial.md ===
{
  "flesch_reading_ease": 58.2,
  "flesch_kincaid_grade": 10.1,
  "interpretation": "Fairly Difficult (10th grade)",
  "recommendation": "Consider simplifying for broader audience"
}
```

This helps identify content that's too easy or too difficult compared to your target audience.

## Integration with Copywriter Styles

Each copywriter style preset has a target readability range:

| Preset          | Target Grade Level |
| --------------- | ------------------ |
| Gary Halbert    | 6-8                |
| Dan Kennedy     | 8-10               |
| Joanna Wiebe    | 7-9                |
| Eugene Schwartz | 10-12              |
| David Ogilvy    | 10-12              |
| Ann Handley     | 7-9                |
| Drayton Bird    | 9-11               |
| Seth Godin      | 6-8                |
| Belinda Weaver  | 6-8                |
| Alex Cattoni    | 6-8                |

Use the readability analysis to verify content matches the target style's complexity level.

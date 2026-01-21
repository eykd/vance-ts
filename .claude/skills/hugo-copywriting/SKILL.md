---
name: hugo-copywriting
description: 'Analyze and guide Hugo site copywriting with readability metrics and style presets (advisory mode). Use when: (1) analyzing existing Hugo content for style compliance, (2) writing new Hugo content with style guidance, (3) choosing/documenting style guides (checked every invocation), (4) evaluating configuration copy (params.yaml, menus.yaml, data), (5) analyzing readability metrics, (6) providing suggestions to match copywriter voice presets. Advisory mode: provides examples and suggestions rather than automatic rewrites. Integrates with hugo-templates, frontend-design, and tailwind-daisyui-design skills.'
---

# Hugo Copywriting Skill

Analyze and guide copywriting for Hugo static sites with readability metrics, reading time estimation, and 10 professional copywriter style presets.

**Mode: Advisory** - This skill provides guidance, suggestions, and examples rather than automatically rewriting content. It helps you understand how to improve copy and match specific styles.

## Quick Start

**Common use cases:**

```bash
# Analyze existing blog post for readability and style
/hugo-copywriting
> "Analyze hugo/content/posts/getting-started.md against Gary Halbert style"

# Write new content with style guidance
/hugo-copywriting
> "Help me write a new blog post about feature X in Joanna Wiebe style"

# Check all posts for readability consistency
/hugo-copywriting
> "Analyze readability across all posts in hugo/content/posts/"

# Evaluate and improve hero section copy
/hugo-copywriting
> "Review hugo/data/home/hero.yaml and suggest improvements for Dan Kennedy style"

# Choose and document style standards
/hugo-copywriting
> "Help me choose and document copywriting standards for this site"
```

## Advisory Mode Philosophy

This skill operates in **advisory mode**, meaning:

- **Provides suggestions** - Shows you what could be improved and why
- **Offers examples** - Demonstrates before/after transformations
- **Explains rationale** - Helps you understand style principles
- **Respects your judgment** - You decide which changes to make
- **Only rewrites when asked** - Waits for explicit permission to edit files

**Not automatic rewriting** - The skill won't silently change your content. Instead, it helps you become a better copywriter by explaining principles and showing examples.

## Initialization Workflow (CRITICAL)

**On every invocation**, this skill checks if copywriting standards are documented in `hugo/CLAUDE.md`:

1. **Check for existing documentation**:

   ```bash
   grep -i "copywriting\|style guide" hugo/CLAUDE.md
   ```

2. **If not documented**:
   - Prompt user to choose style guide (AP, Chicago, APA, MLA, Google, Mailchimp)
   - Prompt user to choose copywriter voice preset (10 options available)
   - Document both choices in `hugo/CLAUDE.md` using the template from `assets/hugo-claude-template.md`

3. **If documented**:
   - Read existing standards from `hugo/CLAUDE.md`
   - Use those standards for all analysis and guidance

**This ensures consistency** - Every piece of content is evaluated against the same documented standards.

See `references/hugo-claude-integration.md` for complete workflow details.

## Copywriter Style Presets

Ten professional copywriter voices, each with distinct characteristics:

| Preset              | Voice Characteristics                     | Best For                     | Readability Target |
| ------------------- | ----------------------------------------- | ---------------------------- | ------------------ |
| **Gary Halbert**    | Conversational, urgent, punchy            | Sales pages, email campaigns | Grade 6-8          |
| **Dan Kennedy**     | Authoritative, structured, no-nonsense    | B2B, thought leadership      | Grade 8-10         |
| **Joanna Wiebe**    | Crisp, persuasive, voice-driven           | SaaS, conversion copy        | Grade 7-9          |
| **Eugene Schwartz** | Intellectual, emotionally resonant        | High-end products, long-form | Grade 10-12        |
| **David Ogilvy**    | Elegant, logical, research-backed         | Brand building, prestige     | Grade 10-12        |
| **Ann Handley**     | Warm, personable, story-forward           | Content marketing, blogs     | Grade 7-9          |
| **Drayton Bird**    | Wry, insightful, direct                   | Marketing strategy, analysis | Grade 9-11         |
| **Seth Godin**      | Philosophical, minimalist, metaphorical   | Blog posts, manifestos       | Grade 6-8          |
| **Belinda Weaver**  | Friendly, accessible, confidence-building | Small business, coaching     | Grade 6-8          |
| **Alex Cattoni**    | Energetic, persuasive, millennial-savvy   | YouTube, social media, ads   | Grade 6-8          |

**Detailed documentation** for each style (with before/after examples, identification guides, and specific suggestions) is in `references/copywriter-styles.md`.

## Style Guide Reference

Style guides provide **mechanics** (dates, numbers, punctuation, capitalization), while copywriter presets provide **voice** (tone, rhythm, word choice).

**Major style guides:**

- **AP Stylebook** - News, journalism, PR, web content (most common for Hugo sites)
- **Chicago Manual of Style** - Books, long-form content, business writing
- **APA Style** - Social sciences, research, academic writing
- **MLA Style** - Humanities, literature, academic writing
- **Google Developer Style Guide** - Technical documentation, developer content
- **Mailchimp Content Style Guide** - Marketing, conversational brand content

**Decision tree and detailed comparison** available in `references/style-guides.md`.

## Content Targets

This skill can analyze and guide copywriting for:

**Hugo content files:**

- `hugo/content/**/*.md` - Blog posts, pages, documentation
- YAML frontmatter (title, description, summary)
- Markdown body content

**Hugo configuration:**

- `hugo/config/_default/params.yaml` - Site tagline, descriptions
- `hugo/config/_default/menus.yaml` - Navigation labels
- `hugo/config/_default/languages.yaml` - Multilingual content

**Hugo data files:**

- `hugo/data/**/*.yaml` - Structured content (hero sections, features, testimonials)

**Analysis scope:**

- Individual files
- Batch analysis across directories
- Specific sections within files
- Configuration values

## Readability Analysis

The skill includes a Node.js script (`scripts/analyze.js`) that calculates:

**Readability metrics:**

- **Flesch Reading Ease** (0-100 scale, higher = easier)
- **Flesch-Kincaid Grade Level** (US grade level required)
- **Interpretation** (e.g., "Standard", "Fairly Easy", "Difficult")
- **Recommendation** based on content type and audience

**Reading time estimation:**

- **Minutes** to read (rounded)
- **Range** accounting for reading speed variation
- **Complexity adjustment** based on sentence length, word difficulty, code blocks
- **Base speed** of 200 WPM for standard web content

**Text statistics:**

- Word count, sentence count, syllable count
- Average sentence length
- Average word length
- Character count

**Usage:**

```bash
# Analyze from file
node scripts/analyze.js hugo/content/posts/my-post.md

# Analyze from stdin
cat hugo/content/posts/my-post.md | node scripts/analyze.js

# Analyze from text argument
node scripts/analyze.js --text "Your content here."
```

**Output format:** JSON with `readability`, `reading_time`, and `statistics` sections.

The script automatically:

- Strips YAML frontmatter
- Handles markdown formatting
- Processes code blocks separately (slower reading speed)
- Adjusts for content complexity

## Providing Style Guidance

When analyzing content against a copywriter style preset:

**1. Read the content** - Use Read tool to examine the file

**2. Analyze against style** - Compare content to preset characteristics:

- Sentence structure and length
- Word choice and vocabulary
- Tone and voice
- Rhythm and pacing
- Persuasive techniques

**3. Run readability analysis** - Execute `analyze.js` to get metrics

**4. Identify deviations** - Note specific areas where content differs from target style

**5. Provide specific suggestions** with examples:

```markdown
**Current version:**
"Our platform provides comprehensive solutions for enterprise-level organizations seeking to optimize their operational efficiency."

**Suggested revision (Gary Halbert style):**
"Want to cut costs and work faster? Here's how."

**Why:** Gary Halbert uses short, punchy sentences with direct questions. Avoid corporate jargon like "comprehensive solutions" and "operational efficiency."
```

**6. Offer readability improvements** if metrics don't match targets:

```markdown
**Current:** Flesch-Kincaid Grade 14.2 (college sophomore)
**Target:** Grade 7-9 for Ann Handley style

**Suggestions:**

- Break 35-word sentences into 2-3 shorter ones
- Replace "utilize" with "use", "facilitate" with "help"
- Add more conversational transitions
```

**7. Respect user decisions** - Present options, explain trade-offs, let user choose

See `references/copywriter-styles.md` for detailed before/after examples for each preset.

## Common Workflows

### Analyzing Existing Content

**Goal:** Evaluate a blog post for style compliance

**Steps:**

1. Read the post with Read tool
2. Run `analyze.js` to get readability metrics
3. Compare content to documented copywriter style
4. Identify 3-5 specific improvement opportunities
5. Provide before/after examples for each
6. Suggest readability adjustments if needed

**Example output:**

```markdown
Analysis of hugo/content/posts/feature-launch.md

**Readability:** Grade 11.2 (target: 7-9 for Joanna Wiebe style)
**Reading time:** 8 minutes

**Style observations:**

1. Sentences average 28 words (target: 15-20 for Joanna's style)
2. Passive voice in 6 locations (Joanna prefers active)
3. Missing emotional hooks in intro (Joanna leads with pain/desire)

**Specific suggestions:** [detailed examples follow]
```

### Writing New Content

**Goal:** Create a new blog post with style guidance

**Steps:**

1. Confirm documented style guide and copywriter preset
2. Discuss post topic, audience, and goals
3. Outline key sections and messages
4. Draft content section by section with style guidance
5. Run `analyze.js` on complete draft
6. Refine based on readability metrics and style feedback
7. Only write to file when user approves final version

### Batch Readability Analysis

**Goal:** Check all blog posts for consistency

**Steps:**

1. List all posts in `hugo/content/posts/`
2. Run `analyze.js` on each post
3. Compile readability metrics into comparison table
4. Identify outliers (too easy/difficult)
5. Suggest posts that need adjustment
6. Prioritize by importance/traffic

### Updating Configuration Copy

**Goal:** Improve site tagline and navigation labels

**Steps:**

1. Read current values from `hugo/config/_default/params.yaml`
2. Analyze against copywriter style for brand consistency
3. Suggest alternatives with rationale
4. Test readability of each option
5. Document final choices
6. Only update files when user approves

See `references/workflow-patterns.md` for complete workflow examples.

## Related Skills

This skill integrates with:

- **hugo-templates** - For understanding Hugo template structure and Go template syntax
- **frontend-design** - For overall site design decisions and visual hierarchy
- **tailwind-daisyui-design** - For component styling and accessible UI patterns
- **daisyui-design-system-generator** - For color themes and contrast ratios
- **htmx-alpine-templates** - For interactive elements embedded in content
- **hugo-project-setup** - For initial Hugo site configuration

**Typical collaboration:**

1. Use `frontend-design` to establish visual direction
2. Use `hugo-copywriting` to define voice and style standards
3. Use `hugo-templates` to implement content templates
4. Use `tailwind-daisyui-design` to style components

## Script Usage Examples

### Basic Analysis

```bash
# Analyze a blog post
cd .claude/skills/hugo-copywriting
node scripts/analyze.js ../../../../hugo/content/posts/welcome.md
```

**Output:**

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

### Stdin Analysis

```bash
# Analyze copied text
echo "This is a test sentence. It demonstrates readability." | node scripts/analyze.js
```

### Batch Analysis

```bash
# Analyze all posts
for file in ../../../../hugo/content/posts/*.md; do
  echo "=== $(basename "$file") ==="
  node scripts/analyze.js "$file" | jq '.readability'
done
```

## Documentation Standards

**Always maintain documentation** in `hugo/CLAUDE.md`:

- Style guide choice (AP, Chicago, etc.)
- Copywriter voice preset
- Readability targets by content type
- Terminology glossary
- Resource links
- Last updated date

**Template available** in `assets/hugo-claude-template.md` for easy copy-paste.

## Best Practices

**Do:**

- ✓ Check `hugo/CLAUDE.md` on every invocation
- ✓ Provide specific before/after examples
- ✓ Explain why suggestions improve the copy
- ✓ Run readability analysis to validate improvements
- ✓ Respect documented standards consistently
- ✓ Ask before making file edits
- ✓ Show trade-offs when multiple approaches work

**Don't:**

- ✗ Automatically rewrite content without permission
- ✗ Mix style guides (pick one and stick with it)
- ✗ Ignore readability targets for the audience
- ✗ Use jargon when simple words work better
- ✗ Forget to document style choices in `hugo/CLAUDE.md`
- ✗ Apply copywriter style to code or technical content
- ✗ Sacrifice clarity for style

## Error Handling

**If analyze.js fails:**

1. Check that Node.js is installed (`node --version`)
2. Verify file path is correct
3. Check file permissions
4. Review stderr output for specific error

**If style documentation is missing:**

1. Prompt user with AskUserQuestion for style guide
2. Prompt user for copywriter preset
3. Create documentation section in `hugo/CLAUDE.md`
4. Confirm with user before writing

**If content doesn't match any preset:**

1. Identify closest matching style
2. Note specific deviations
3. Ask user if they want to match a preset or document custom style

## File Locations

**Skill files:**

- `SKILL.md` - This file
- `scripts/analyze.js` - Readability and reading time calculator
- `scripts/package.json` - Node.js configuration
- `references/copywriter-styles.md` - Detailed style preset documentation
- `references/style-guides.md` - Style guide decision tree
- `references/hugo-claude-integration.md` - Workflow for hugo/CLAUDE.md
- `references/workflow-patterns.md` - Common copywriting workflows
- `assets/hugo-claude-template.md` - Template for documenting standards

**Hugo files analyzed:**

- `hugo/content/**/*.md` - Content files
- `hugo/config/_default/*.yaml` - Configuration
- `hugo/data/**/*.yaml` - Data files
- `hugo/CLAUDE.md` - Documented copywriting standards

## Support

For issues with this skill, check:

1. Node.js version (`node --version` - requires 16+)
2. File permissions on `scripts/analyze.js` (should be executable)
3. Existence of `hugo/CLAUDE.md` (created if missing)
4. Reference documentation in `references/` directory

For questions about specific copywriter styles, see detailed examples in `references/copywriter-styles.md`.

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

This skill operates in **advisory mode**: provides suggestions and examples rather than automatic rewrites. It explains principles, shows before/after transformations, and respects your judgment. Only rewrites when you explicitly ask.

## Initialization Workflow (CRITICAL)

**On every invocation**, check if copywriting standards are documented in `hugo/CLAUDE.md`:

1. Check: `grep -i "copywriting\|style guide" hugo/CLAUDE.md`
2. If not documented: Prompt user to choose style guide and copywriter preset, then document in `hugo/CLAUDE.md`
3. If documented: Use those standards for all analysis

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

Style guides provide **mechanics** (dates, numbers, punctuation), while copywriter presets provide **voice** (tone, rhythm, word choice).

**Major style guides:** AP Stylebook (web content), Chicago Manual (books), APA (academic), MLA (humanities), Google Developer (technical), Mailchimp (marketing).

See `references/style-guides.md` for decision tree and detailed comparison.

## Content Targets

Analyzes copywriting for:

- **Hugo content:** `hugo/content/**/*.md` (posts, pages, frontmatter, body)
- **Configuration:** `hugo/config/_default/*.yaml` (params, menus, languages)
- **Data files:** `hugo/data/**/*.yaml` (hero sections, features, testimonials)

Supports individual files, batch analysis, or specific sections.

## Readability Analysis

Quick reference for the `scripts/analyze.js` tool:

**Basic usage:**

```bash
# Analyze from file
node scripts/analyze.js hugo/content/posts/my-post.md

# Analyze from stdin
cat hugo/content/posts/my-post.md | node scripts/analyze.js
```

**Output includes:**

- Flesch Reading Ease (0-100 scale)
- Flesch-Kincaid Grade Level
- Reading time estimation
- Text statistics (word count, avg sentence length, etc.)

**The script automatically:**

- Strips YAML frontmatter
- Handles markdown formatting
- Processes code blocks separately
- Adjusts for content complexity

**For detailed information** about metrics, formulas, output format, error handling, and integration with copywriter styles, see `references/readability-analysis.md`.

## Providing Style Guidance

1. Read the content
2. Analyze against style preset characteristics
3. Run `analyze.js` to get readability metrics
4. Identify deviations from target style
5. Provide specific suggestions with before/after examples
6. Offer readability improvements if needed
7. Respect user decisions

See `references/copywriter-styles.md` for detailed examples.
See `references/workflow-patterns.md` for complete workflows.

## Related Skills

Integrates with: `hugo-templates`, `frontend-design`, `tailwind-daisyui-design`, `daisyui-design-system-generator`, `htmx-alpine-templates`, `hugo-project-setup`.

**Typical flow:** frontend-design (visual) → hugo-copywriting (voice/style) → hugo-templates (structure) → tailwind-daisyui-design (styling).

## Documentation Standards

Maintain in `hugo/CLAUDE.md`: style guide choice, copywriter preset, readability targets, terminology, resources, last updated.

Template: `assets/hugo-claude-template.md`

## Best Practices

**Do:** Check `hugo/CLAUDE.md` on every invocation, provide before/after examples with rationale, run readability analysis, ask before editing files.

**Don't:** Auto-rewrite without permission, mix style guides, ignore readability targets, forget to document choices, apply style to code, sacrifice clarity.

## Reference Documentation

- `references/readability-analysis.md` - Metrics, script usage, output format, error handling
- `references/copywriter-styles.md` - Detailed presets with before/after examples
- `references/style-guides.md` - Decision tree and comparisons
- `references/hugo-claude-integration.md` - Hugo/CLAUDE.md workflow
- `references/workflow-patterns.md` - Complete workflow examples
- `assets/hugo-claude-template.md` - Documentation template

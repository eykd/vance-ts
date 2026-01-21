# Hugo CLAUDE.md Integration

How the hugo-copywriting skill integrates with `hugo/CLAUDE.md` for documenting copywriting standards.

## Overview

**Purpose:** Ensure consistent copywriting standards by documenting choices in `hugo/CLAUDE.md`.

**Pattern:** Hugo sites use hierarchical CLAUDE.md files:

- **Root `/CLAUDE.md`:** Project-wide instructions for the entire codebase
- **Hugo `/hugo/CLAUDE.md`:** Hugo-specific instructions including copywriting standards

This separation allows Hugo-specific copywriting standards to live alongside the static site content without cluttering root project documentation.

## Why Document Standards

**Benefits:**

1. **Consistency** - Every piece of content follows same standards
2. **Onboarding** - New team members understand voice immediately
3. **AI assistance** - Claude reads these standards on every invocation
4. **Decision record** - Captures why choices were made
5. **Quality control** - Easy to check if content matches standards

**Without documentation:** Every copywriting session requires re-explaining standards, leading to inconsistency.

## Hugo CLAUDE.md Location

**File path:** `/home/sprite/turtlebased-ts/hugo/CLAUDE.md`

**Relationship to root CLAUDE.md:**

- Root CLAUDE.md: TypeScript, testing, git workflow, project-wide rules
- Hugo CLAUDE.md: Static site, copywriting, design, Hugo-specific rules

**When skills read Hugo CLAUDE.md:**

- `hugo-copywriting` skill (this one) - **On every invocation**
- `hugo-templates` skill - For template conventions
- `frontend-design` skill - For design decisions
- Other Hugo-related skills as needed

## Initialization Workflow (CRITICAL)

**On EVERY invocation of hugo-copywriting skill:**

### Step 1: Check for Existing Documentation

```bash
# Check if hugo/CLAUDE.md exists
test -f hugo/CLAUDE.md && echo "Found" || echo "Not found"

# If exists, check for copywriting standards
grep -i "copywriting\|style guide" hugo/CLAUDE.md
```

**Expected output if documented:**

```
## Copywriting Standards

### Style Guide
We follow **AP Stylebook**...
```

### Step 2: If NOT Documented

**The skill must prompt the user with AskUserQuestion:**

**Question 1: Style Guide**

```
Which style guide should we use for grammar and mechanics?

Options:
1. AP Stylebook - News, journalism, general web (recommended for most sites)
2. Chicago Manual of Style - Books, long-form, traditional
3. Google Developer Style Guide - Technical documentation
4. Mailchimp Content Style Guide - Conversational marketing
5. Other/Custom - I'll specify
```

**Question 2: Copywriter Voice**

```
Which copywriter voice preset should we use?

Options:
1. Gary Halbert - Conversational, urgent, punchy
2. Dan Kennedy - Authoritative, structured
3. Joanna Wiebe - Crisp, persuasive, voice-driven
4. Ann Handley - Warm, personable, story-forward
5. Seth Godin - Philosophical, minimalist
6. Custom - I'll describe our voice
```

**Question 3: Readability Target (Optional)**

```
What readability level should we target?

Options:
1. Grade 6-8 (Easy - General audience)
2. Grade 8-10 (Standard - Educated audience)
3. Grade 10-12 (Advanced - Sophisticated audience)
4. Varies by content type
```

### Step 3: Document Choices

After receiving answers, use the template from `assets/hugo-claude-template.md` to add a Copywriting Standards section to `hugo/CLAUDE.md`.

**Use Edit tool if hugo/CLAUDE.md exists:**

```
Add new "## Copywriting Standards" section
```

**Use Write tool if hugo/CLAUDE.md doesn't exist:**

```
Create new file with copywriting standards section
```

### Step 4: Confirm with User

**Show the user what was documented:**

```
I've documented your copywriting standards in hugo/CLAUDE.md:

- Style Guide: AP Stylebook
- Copywriter Voice: Joanna Wiebe (Copyhackers)
- Readability Target: Grade 7-9

From now on, all content will be evaluated against these standards.
You can update these at any time by editing hugo/CLAUDE.md.
```

## Reading Existing Documentation

**When hugo/CLAUDE.md exists and contains copywriting standards:**

### Extract the Information

```bash
# Read the entire copywriting standards section
sed -n '/## Copywriting Standards/,/^## /p' hugo/CLAUDE.md
```

**Parse key information:**

1. **Style guide** - Which mechanics guide (AP, Chicago, etc.)
2. **Copywriter voice** - Which preset or custom voice description
3. **Readability targets** - Grade levels by content type
4. **Terminology** - Project-specific terms and preferred spellings
5. **Exceptions** - Any documented deviations from standards

**Example extraction:**

```markdown
## Copywriting Standards

### Style Guide

We follow **AP Stylebook** for all grammar, punctuation, and formatting.

### Copywriter Voice

**Joanna Wiebe (Copyhackers)** - Voice-driven, crisp, persuasive copy.

### Readability Targets

- Blog posts: Grade 7-9
- Product pages: Grade 6-8
- Documentation: Grade 8-10
```

**Use this information for all analysis and guidance.**

## Template for Documentation

**Complete template available in:** `assets/hugo-claude-template.md`

**Quick template:**

```markdown
## Copywriting Standards

### Style Guide

We follow **[Style Guide Name]** for all grammar, punctuation, and formatting decisions.

**Key conventions:**

- [Specific rule 1]
- [Specific rule 2]
- [Specific rule 3]

**Resources:**

- [Link to style guide]

### Copywriter Voice

**[Copywriter Name/Preset]** - [Brief description]

**Characteristics:**

- [Voice characteristic 1]
- [Voice characteristic 2]
- [Voice characteristic 3]

**Reference:** See `.claude/skills/hugo-copywriting/references/copywriter-styles.md` for detailed examples.

### Readability Targets

| Content Type  | Target Grade Level | Flesch Reading Ease |
| ------------- | ------------------ | ------------------- |
| Blog posts    | 7-9                | 65-75               |
| Product pages | 6-8                | 70-80               |
| About/Team    | 7-9                | 65-75               |

### Terminology

**Preferred terms:**

- [term]: [definition/usage]
- [term]: [definition/usage]

**Avoid:**

- [term to avoid]: use [preferred term] instead

### Resources

- Style guide: [link]
- Copywriter examples: [link]
- Brand voice guidelines: [link]

**Last updated:** [Date]
```

## Updating Documentation

**When to update:**

1. Standards change or evolve
2. User requests different voice or style guide
3. Exceptions or special cases discovered
4. Terminology additions
5. Readability targets refined

**How to update:**

1. **Read current documentation:**

   ```bash
   cat hugo/CLAUDE.md
   ```

2. **Use Edit tool to make changes:**

   ```
   Update specific sections while preserving rest of file
   ```

3. **Update "Last updated" date:**

   ```
   **Last updated:** 2026-01-21
   ```

4. **Confirm with user:**
   ```
   I've updated hugo/CLAUDE.md to reflect the new standards.
   ```

## Integration Flow Example

**Complete walkthrough of first-time setup:**

### Scenario: User invokes /hugo-copywriting for first time

**Step 1: Skill checks for documentation**

```bash
grep -i "copywriting" hugo/CLAUDE.md
# Returns: (empty - not found)
```

**Step 2: Skill prompts user**

```
I notice copywriting standards aren't documented yet in hugo/CLAUDE.md.

Let me ask a few questions to set this up:

[AskUserQuestion with style guide options]
```

**User selects:** "AP Stylebook"

**Step 3: Skill prompts for voice**

```
[AskUserQuestion with copywriter voice options]
```

**User selects:** "Joanna Wiebe - Crisp, persuasive, voice-driven"

**Step 4: Skill prompts for targets**

```
[AskUserQuestion with readability target options]
```

**User selects:** "Grade 7-9 for most content"

**Step 5: Skill documents choices**

```bash
# If hugo/CLAUDE.md exists, use Edit to add section
# If not, use Write to create file

# Add complete Copywriting Standards section using template
```

**Step 6: Skill confirms**

```
✓ Documented copywriting standards in hugo/CLAUDE.md

Standards:
- Style Guide: AP Stylebook
- Voice: Joanna Wiebe (Copyhackers)
- Readability: Grade 7-9

You can now proceed with content analysis or creation.
All content will be evaluated against these standards.
```

**Step 7: Skill proceeds with original task**

```
Now, what would you like help with?
- Analyze existing content
- Write new content
- Review configuration copy
```

## Subsequent Invocations

**On every future invocation:**

1. **Check hugo/CLAUDE.md**
2. **Extract documented standards**
3. **Use those standards** for all analysis and guidance
4. **No need to prompt user again** (unless they want to change standards)

**Example:**

```
I see from hugo/CLAUDE.md that we're using:
- AP Stylebook for mechanics
- Joanna Wiebe voice for tone
- Target readability: Grade 7-9

I'll evaluate the content against these standards.
```

## Checking for Updates

**The skill should check hugo/CLAUDE.md on EVERY invocation** because:

- Standards may have been updated
- User may have manually edited the file
- Other skills may have modified it
- Ensures current session uses latest standards

**Quick check:**

```bash
# Get last modified time
stat -c %Y hugo/CLAUDE.md

# Read current standards
grep -A 20 "## Copywriting Standards" hugo/CLAUDE.md
```

## Error Handling

**If hugo/CLAUDE.md exists but is malformed:**

1. Notify user of the issue
2. Offer to fix or recreate the section
3. Proceed with prompting for standards

**If user manually edited standards:**

1. Read and respect their changes
2. Validate against known presets if possible
3. If custom, work with their documented standards

**If standards section is incomplete:**

1. Identify missing pieces
2. Prompt user for missing information
3. Complete the documentation

## Best Practices

**Do:**

- ✓ Check hugo/CLAUDE.md on every invocation
- ✓ Respect documented standards consistently
- ✓ Update "Last updated" date when changing standards
- ✓ Document exceptions and special cases
- ✓ Use the template for consistency
- ✓ Keep documentation concise but complete

**Don't:**

- ✗ Assume standards from previous sessions
- ✗ Skip checking hugo/CLAUDE.md
- ✗ Ignore documented standards
- ✗ Overwrite user's custom documentation
- ✗ Forget to confirm changes with user
- ✗ Leave documentation incomplete

## Example hugo/CLAUDE.md Structure

**Complete example showing how copywriting standards integrate:**

```markdown
# Hugo Site Instructions

Project-specific instructions for the Hugo static site portion of this project.

## Overview

This Hugo site uses TailwindCSS 4 and DaisyUI 5 for styling...

## Copywriting Standards

### Style Guide

We follow **AP Stylebook** for all grammar, punctuation, and formatting decisions.

**Key conventions:**

- No Oxford comma (except when needed for clarity)
- Spell out numbers one through nine
- Use % symbol (not "percent")
- Dates: Jan. 21, 2026

### Copywriter Voice

**Joanna Wiebe (Copyhackers)** - Voice-driven, crisp, persuasive copy.

**Characteristics:**

- Active voice always
- Customer language and real pain points
- Varied sentence length for rhythm
- Concrete outcomes over abstract features

### Readability Targets

| Content Type  | Target Grade Level |
| ------------- | ------------------ |
| Blog posts    | 7-9                |
| Product pages | 6-8                |
| About page    | 7-9                |

**Last updated:** 2026-01-21

## Content Structure

[Other Hugo-specific documentation continues...]
```

## Related Documentation

- **Template:** `assets/hugo-claude-template.md` - Ready-to-use documentation template
- **Style Guides:** `references/style-guides.md` - Detailed style guide comparison
- **Copywriter Styles:** `references/copywriter-styles.md` - Voice preset details
- **Workflows:** `references/workflow-patterns.md` - Common copywriting workflows

## Summary

**Key workflow:**

1. ✓ Check hugo/CLAUDE.md on every invocation
2. ✓ If not documented → prompt user → document choices
3. ✓ If documented → read standards → use consistently
4. ✓ Update documentation when standards change
5. ✓ Keep documentation current and complete

This ensures every copywriting session uses consistent, documented standards.

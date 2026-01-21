# Copywriting Standards Template

Ready-to-paste markdown section for documenting copywriting standards in `hugo/CLAUDE.md`.

## Complete Template

```markdown
## Copywriting Standards

### Style Guide

We follow **[Style Guide Name]** for all grammar, punctuation, and formatting decisions.

**Key conventions:**

- [Convention 1: e.g., No Oxford comma except when needed for clarity]
- [Convention 2: e.g., Spell out numbers one through nine, use numerals for 10+]
- [Convention 3: e.g., Use % symbol (not "percent")]
- [Convention 4: e.g., Dates: Jan. 21, 2026 (abbreviate months)]
- [Convention 5: e.g., Time: 3 p.m. (lowercase with periods)]

**Resources:**

- [Link to style guide]
- [Link to internal quick reference if available]

### Copywriter Voice

**[Copywriter Name/Preset]** - [Brief description of voice characteristics]

**Core characteristics:**

- [Characteristic 1: e.g., Active voice always]
- [Characteristic 2: e.g., Short, punchy sentences]
- [Characteristic 3: e.g., Direct questions engage reader]
- [Characteristic 4: e.g., Avoid jargon and corporate speak]

**Sentence structure:**

- Average sentence length: [range, e.g., 8-15 words]
- Paragraph length: [guidance, e.g., 1-3 sentences]
- Rhythm: [description, e.g., Varied for emphasis]

**Word choice:**

- Prefer: [examples of preferred words/phrases]
- Avoid: [examples of words/phrases to avoid]

**Reference:** See `.claude/skills/hugo-copywriting/references/copywriter-styles.md` for detailed examples and before/after transformations.

### Readability Targets

| Content Type  | Target Grade Level | Flesch Reading Ease | Notes       |
| ------------- | ------------------ | ------------------- | ----------- |
| Blog posts    | [e.g., 7-9]        | [e.g., 65-75]       | [any notes] |
| Product pages | [e.g., 6-8]        | [e.g., 70-80]       | [any notes] |
| About/Team    | [e.g., 7-9]        | [e.g., 65-75]       | [any notes] |
| Documentation | [e.g., 8-10]       | [e.g., 60-70]       | [any notes] |
| Landing pages | [e.g., 6-8]        | [e.g., 70-80]       | [any notes] |

**Analysis tool:** Use `.claude/skills/hugo-copywriting/scripts/analyze.js` to check readability metrics.

### Terminology

**Preferred terms:**

- [term]: [definition or usage guidance]
- [term]: [definition or usage guidance]
- [term]: [definition or usage guidance]

**Avoid:**

- [term to avoid]: use [preferred term] instead
- [term to avoid]: use [preferred term] instead
- [term to avoid]: use [preferred term] instead

**Capitalization:**

- [Product/Feature Name]: [how to capitalize]
- [Industry term]: [how to capitalize]

### Resources

- **Style guide:** [link to official style guide]
- **Copywriter reference:** `.claude/skills/hugo-copywriting/references/copywriter-styles.md`
- **Readability analyzer:** `.claude/skills/hugo-copywriting/scripts/analyze.js`
- **Brand voice guidelines:** [link if available]
- **Internal writing guide:** [link if available]

**Last updated:** [YYYY-MM-DD]
```

---

## Example: AP + Joanna Wiebe

```markdown
## Copywriting Standards

### Style Guide

We follow **AP Stylebook** for all grammar, punctuation, and formatting decisions.

**Key conventions:**

- No Oxford comma (except when needed for clarity)
- Spell out numbers one through nine, use numerals for 10+
- Use % symbol (not "percent")
- Dates: Jan. 21, 2026 (abbreviate months)
- Time: 3 p.m. (lowercase with periods)
- States: N.Y., Calif. (abbreviate in text)

**Resources:**

- [AP Stylebook](https://www.apstylebook.com/)

### Copywriter Voice

**Joanna Wiebe (Copyhackers)** - Crisp, persuasive, voice-driven copy that speaks in the customer's language.

**Core characteristics:**

- Active voice always - "You get results" not "Results are achieved"
- Customer language - Use actual words customers say
- Emotional hooks - Address real pain points and desires
- Concrete outcomes - "inbox zero" not "improved productivity"

**Sentence structure:**

- Average sentence length: 10-18 words
- Paragraph length: 1-3 sentences for web, longer OK for storytelling
- Rhythm: Varied dramatically for emphasis and impact

**Word choice:**

- Prefer: you, your, get, make, stop, start, concrete nouns
- Avoid: leverage, synergy, solution, comprehensive, optimize, utilize

**Reference:** See `.claude/skills/hugo-copywriting/references/copywriter-styles.md` for detailed examples and before/after transformations.

### Readability Targets

| Content Type  | Target Grade Level | Flesch Reading Ease | Notes                       |
| ------------- | ------------------ | ------------------- | --------------------------- |
| Blog posts    | 7-9                | 65-75               | Fairly easy, accessible     |
| Product pages | 6-8                | 70-80               | Easy, scannable             |
| About page    | 7-9                | 65-75               | Personable but professional |
| Documentation | 8-10               | 60-70               | Can be more technical       |
| Landing pages | 6-8                | 70-80               | Clear, conversion-focused   |

**Analysis tool:** Use `.claude/skills/hugo-copywriting/scripts/analyze.js` to check readability metrics.

### Terminology

**Preferred terms:**

- platform: our main product offering
- workspace: user's project container
- team member: person invited to workspace
- project: collection of related work

**Avoid:**

- solution: use "platform" or specific feature name
- users: use "customers" or "team members" (more human)
- functionality: use "feature" or specific name
- utilize: use "use"

**Capitalization:**

- ProductName Platform: our main product
- Workspace: when referring to the feature
- workspace: when used generically

### Resources

- **Style guide:** [AP Stylebook](https://www.apstylebook.com/)
- **Copywriter reference:** `.claude/skills/hugo-copywriting/references/copywriter-styles.md`
- **Readability analyzer:** `.claude/skills/hugo-copywriting/scripts/analyze.js`

**Last updated:** 2026-01-21
```

---

## Example: Chicago + Dan Kennedy

```markdown
## Copywriting Standards

### Style Guide

We follow **Chicago Manual of Style** for all grammar, punctuation, and formatting decisions.

**Key conventions:**

- Oxford comma always (design, development, and consulting)
- Spell out numbers zero through one hundred, numerals for 101+
- Spell out "percent" with numerals (15 percent)
- Dates: January 21, 2026 (don't abbreviate months)
- Time: 3:00 p.m. (lowercase with periods)
- States: spell out in text

**Resources:**

- [Chicago Manual of Style](https://www.chicagomanualofstyle.org/)

### Copywriter Voice

**Dan Kennedy** - Authoritative, structured, no-nonsense business writing that establishes expertise.

**Core characteristics:**

- Authoritative tone - Command the room, establish expertise
- Structured arguments - Claim → Evidence → Implication
- Results-focused - Emphasize profit, growth, concrete outcomes
- No fluff - Every word earns its place

**Sentence structure:**

- Average sentence length: 15-20 words
- Paragraph length: 3-5 sentences, well-structured
- Rhythm: Steady, purposeful pace

**Word choice:**

- Prefer: strategy, approach, method, system, implement, execute, achieve
- Avoid: fluff words, apologetic language (maybe, just, sort of), overly casual slang

**Reference:** See `.claude/skills/hugo-copywriting/references/copywriter-styles.md` for detailed examples and before/after transformations.

### Readability Targets

| Content Type       | Target Grade Level | Flesch Reading Ease | Notes                       |
| ------------------ | ------------------ | ------------------- | --------------------------- |
| Blog posts         | 8-10               | 60-70               | Professional, authoritative |
| Thought leadership | 9-11               | 55-65               | Can be more sophisticated   |
| Service pages      | 8-10               | 60-70               | Clear but professional      |
| Case studies       | 8-10               | 60-70               | Evidence-based              |

**Analysis tool:** Use `.claude/skills/hugo-copywriting/scripts/analyze.js` to check readability metrics.

### Terminology

**Preferred terms:**

- client: our customers (B2B context)
- engagement: client project
- methodology: our proven approach
- framework: structured system we use

**Avoid:**

- customer: use "client" (more professional for B2B)
- gig: use "engagement" or "project"
- stuff: use specific terms
- things: use specific terms

**Last updated:** 2026-01-21
```

---

## Example: Mailchimp + Ann Handley

```markdown
## Copywriting Standards

### Style Guide

We follow **Mailchimp Content Style Guide** for conversational, human marketing content.

**Key conventions:**

- Oxford comma for clarity (design, development, and consulting)
- Use numerals for numbers (more scannable)
- Use % symbol
- Dates: January 21, 2026
- Contractions encouraged (you'll, we're, it's)
- Active voice strongly preferred

**Resources:**

- [Mailchimp Style Guide](https://styleguide.mailchimp.com/)

### Copywriter Voice

**Ann Handley** - Warm, personable, story-forward content that builds relationships.

**Core characteristics:**

- Conversational tone - Write like you're talking to a friend
- Story-forward - Use anecdotes and personal examples
- Encouraging - Build confidence, be supportive
- Human - Make marketing feel less like marketing

**Sentence structure:**

- Average sentence length: 15-20 words
- Paragraph length: Varies, natural flow
- Rhythm: Natural speaking pace

**Word choice:**

- Prefer: everyday language, personal anecdotes, you/your/we
- Avoid: corporate jargon, overly formal language, marketing clichés

**Reference:** See `.claude/skills/hugo-copywriting/references/copywriter-styles.md` for detailed examples and before/after transformations.

### Readability Targets

| Content Type      | Target Grade Level | Flesch Reading Ease | Notes                      |
| ----------------- | ------------------ | ------------------- | -------------------------- |
| Blog posts        | 7-9                | 65-75               | Conversational, accessible |
| Email newsletters | 7-9                | 65-75               | Warm, personal             |
| About page        | 7-9                | 65-75               | Story-focused              |
| How-to guides     | 7-9                | 65-75               | Clear, supportive          |

**Analysis tool:** Use `.claude/skills/hugo-copywriting/scripts/analyze.js` to check readability metrics.

### Terminology

**Preferred terms:**

- community: our users/customers (emphasizes relationship)
- member: person in our community
- story: customer example or case study
- journey: customer experience

**Avoid:**

- users: use "community members" or "people"
- funnel: use "journey" (more human)
- conversion: use "sign-up" or specific action
- engagement metrics: use "how people interact"

**Last updated:** 2026-01-21
```

---

## Usage Instructions

**To use this template:**

1. **Choose your style guide and copywriter voice**
   - See `references/style-guides.md` for style guide comparison
   - See `references/copywriter-styles.md` for voice presets

2. **Copy the appropriate example or start with the complete template**

3. **Customize for your project:**
   - Fill in bracketed placeholders [like this]
   - Add project-specific terminology
   - Set readability targets for your content types
   - Add links to resources

4. **Add to hugo/CLAUDE.md:**
   - If hugo/CLAUDE.md exists, add as new section
   - If it doesn't exist, create file with this section

5. **Update the "Last updated" date**

6. **Verify with the hugo-copywriting skill:**
   ```bash
   /hugo-copywriting
   ```
   The skill will read and confirm your documented standards.

## Integration with Hugo CLAUDE.md

**File structure:**

```
hugo/
├── CLAUDE.md                    # Hugo-specific instructions
│   ├── Overview
│   ├── Copywriting Standards   # ← This template goes here
│   ├── Content Structure
│   ├── Template Guidelines
│   └── Build Process
├── content/
├── config/
└── ...
```

**Complete workflow documented in:**

- `references/hugo-claude-integration.md` - Full integration guide
- `references/workflow-patterns.md` - Common workflows using standards

## Maintenance

**Keep this section updated when:**

- Copywriting standards evolve
- New content types are added
- Terminology changes
- Style guide or voice changes
- Resources links change

**Always update "Last updated" date when making changes.**

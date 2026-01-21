# Workflow Patterns

Common copywriting workflows for the hugo-copywriting skill in advisory mode.

**Remember:** This skill operates in **advisory mode** - provides guidance and suggestions rather than automatic rewrites.

## Pattern 1: Analyzing Existing Blog Post

**Goal:** Evaluate a blog post for style compliance and provide actionable suggestions.

### Steps

**1. Check documentation** (ALWAYS first)

```bash
grep -A 20 "## Copywriting Standards" hugo/CLAUDE.md
```

**2. Read the blog post**

```bash
# Use Read tool
hugo/content/posts/example-post.md
```

**3. Run readability analysis**

```bash
cd .claude/skills/hugo-copywriting
node scripts/analyze.js ../../../../hugo/content/posts/example-post.md
```

**4. Analyze against documented style**

Compare post content to:

- Style guide mechanics (AP, Chicago, etc.)
- Copywriter voice characteristics
- Readability targets

**5. Identify 3-5 specific improvement opportunities**

Focus on:

- High-impact changes
- Clear before/after examples
- Rationale for each suggestion

**6. Provide structured feedback**

### Example Output

```markdown
## Analysis of "Getting Started with Our Platform"

**Current readability:** Grade 11.2 (target: 7-9 for Joanna Wiebe style)
**Reading time:** 8 minutes
**Overall assessment:** Good content, but needs simplification and more voice

### Observations

1. **Sentence length too long** (avg 28 words vs target 15-20)
2. **Passive voice in intro** (conflicts with Joanna's active voice style)
3. **Missing emotional hooks** (Joanna leads with pain/desire)
4. **Style guide compliance:** 2 Oxford commas (AP style doesn't use these)

### Specific Suggestions

#### Suggestion 1: Simplify intro paragraph

**Current (Grade 12, passive):**
"When organizations are seeking to implement solutions that can be leveraged to enhance their operational capabilities, it is often discovered that the complexity of modern platforms can be overwhelming."

**Suggested (Grade 8, active, Joanna style):**
"You're drowning in complicated tools. Every new platform promises simplicity—then dumps fifty features on you. Here's a different approach."

**Why:**

- Shorter sentences (15, 13, 7 words vs 32 words)
- Active voice ("You're drowning" vs "it is discovered")
- Emotional hook ("drowning")
- Conversational tone matches Joanna's style

#### Suggestion 2: Fix Oxford commas for AP style

**Lines affected:** 3 instances

**Current:**
"We offer design, development, and consulting."

**Suggested:**
"We offer design, development and consulting."

**Why:** AP style doesn't use Oxford comma (unless needed for clarity)

#### Suggestion 3: Add voice-driven call-to-action

**Current (weak):**
"Please sign up to learn more about our platform."

**Suggested (Joanna style):**
"Ready to stop drowning? Get started now."

**Why:**

- Echoes the intro hook ("drowning")
- Direct question engages reader
- Command form ("Get started") is confident
- Short and punchy (8 words vs 10)

### Priority Actions

1. **High priority:** Shorten intro paragraph (biggest readability impact)
2. **Medium priority:** Convert passive voice to active throughout
3. **Low priority:** Fix Oxford comma usage (mechanical, less visible)

### Next Steps

Would you like me to:

- Provide more detailed rewrites for specific sections?
- Analyze other posts for consistency?
- Focus on a particular aspect (readability, style guide, voice)?
```

---

## Pattern 2: Writing New Blog Post

**Goal:** Create a new blog post with style guidance throughout.

### Steps

**1. Check documentation**

```bash
grep -A 20 "## Copywriting Standards" hugo/CLAUDE.md
```

**2. Discuss post planning**

Ask about:

- Topic and key message
- Target audience
- Desired outcome (educate, persuade, inform)
- Approximate length

**3. Create outline with voice guidance**

```markdown
## Proposed Outline

**Title ideas** (testing for voice):

1. "Stop Making This Mistake with Your Data" (Gary Halbert - urgent, direct)
2. "The One Thing Successful Teams Do Differently" (Dan Kennedy - authoritative)
3. "Your Data Is Lying to You (Here's Why)" (Joanna Wiebe - provocative)

**Structure:**

1. **Hook** (Joanna style: start with pain point)
   - Address reader's frustration
   - 2-3 short sentences
   - Grade 6-8 readability

2. **Problem** (elaborate on the pain)
   - Real scenarios
   - Emotional language
   - 1-2 paragraphs

3. **Solution** (introduce approach)
   - Active voice
   - Concrete benefits
   - 2-3 paragraphs

4. **How-to** (tactical steps)
   - Numbered list
   - Each step 1-2 sentences
   - Clear action items

5. **Wrap-up** (reinforce value)
   - Short paragraph
   - Call to action
   - Echo the hook

Would you like me to draft the hook first?
```

**4. Draft section by section**

**For each section:**

- Draft content following voice characteristics
- Check readability as you go
- Provide rationale for word choices
- Ask for feedback before moving to next section

**5. Complete draft**

**6. Full readability analysis**

```bash
node scripts/analyze.js ../../../../hugo/content/posts/new-post.md
```

**7. Refine based on metrics**

If readability off-target:

- Identify problem areas
- Suggest specific improvements
- Run analysis again

**8. Final review against documented style**

Checklist:

- [ ] Style guide mechanics correct
- [ ] Voice characteristics present
- [ ] Readability within target range
- [ ] Reading time appropriate
- [ ] Frontmatter complete

**9. Create file only when approved**

```bash
# User approves
# Use Write tool to create hugo/content/posts/new-post.md
```

---

## Pattern 3: Batch Readability Analysis

**Goal:** Check all blog posts for readability consistency.

### Steps

**1. List all posts**

```bash
ls -1 hugo/content/posts/*.md
```

**2. Analyze each post**

```bash
cd .claude/skills/hugo-copywriting

for file in ../../../../hugo/content/posts/*.md; do
  echo "=== $(basename "$file") ==="
  node scripts/analyze.js "$file" | jq -r '"\(.readability.flesch_kincaid_grade) | \(.reading_time.minutes) min"'
done
```

**3. Compile results table**

```markdown
## Readability Analysis: All Blog Posts

| Post               | Grade Level | Reading Time | Status           |
| ------------------ | ----------- | ------------ | ---------------- |
| getting-started.md | 11.2        | 8 min        | ⚠️ Too difficult |
| feature-guide.md   | 7.8         | 5 min        | ✓ On target      |
| tips-tricks.md     | 6.5         | 3 min        | ✓ On target      |
| advanced-setup.md  | 13.1        | 12 min       | ⚠️ Too difficult |

**Target:** Grade 7-9 (documented in hugo/CLAUDE.md)

**Summary:**

- 2 posts within target range
- 2 posts too difficult
- Average reading time: 7 minutes
```

**4. Identify outliers**

**Posts needing attention:**

1. `getting-started.md` - Grade 11.2 (should be easier for intro content)
2. `advanced-setup.md` - Grade 13.1 (complex is OK for advanced, but could simplify)

**5. Prioritize improvements**

```markdown
## Recommended Actions

**High priority:**

- `getting-started.md` - This is intro content, should be Grade 7-8 max

**Medium priority:**

- `advanced-setup.md` - Advanced content can be more complex, but Grade 13 is very high

**Low priority:**

- Other posts are on target
```

**6. Offer to analyze specific posts in detail**

---

## Pattern 4: Updating Configuration Copy

**Goal:** Improve site tagline and navigation labels.

### Steps

**1. Read current configuration**

```bash
cat hugo/config/_default/params.yaml
```

**2. Extract copy elements**

```yaml
# Current copy
tagline: 'Innovative Solutions for Modern Businesses'
description: 'We provide comprehensive services to help organizations optimize their operations'
```

**3. Analyze against documented voice**

```markdown
## Analysis of Current Config Copy

**Style:** Generic corporate language
**Issues:**

- "Innovative Solutions" - marketing cliché
- "Modern Businesses" - vague
- "comprehensive services" - unclear
- "optimize their operations" - jargon

**Documented voice:** Joanna Wiebe (crisp, voice-driven, concrete)

**Current copy doesn't match** - too corporate, not customer-focused
```

**4. Suggest alternatives with rationale**

```markdown
## Suggested Alternatives

### Tagline Options

**Option 1 (Direct benefit):**
"Stop wasting time on broken workflows"

**Why:**

- Addresses pain point directly
- Active voice
- Concrete ("wasting time", "broken workflows")
- Grade 6 readability
- 6 words (short, punchy)

**Option 2 (Transformation):**
"From chaos to clarity in 30 days"

**Why:**

- Shows transformation
- Concrete timeframe
- Alliteration ("chaos to clarity")
- Grade 4 readability
- 6 words

**Option 3 (Customer voice):**
"Finally, a tool that actually works"

**Why:**

- Customer frustration ("Finally")
- Conversational ("actually")
- Implies previous failures
- Grade 4 readability
- 6 words

Which direction resonates with your brand?
```

**5. Refine based on feedback**

**6. Update configuration when approved**

---

## Pattern 5: Hero Section Copy

**Goal:** Review and improve hero section in data files.

### Steps

**1. Read hero data file**

```bash
cat hugo/data/home/hero.yaml
```

**2. Extract current copy**

```yaml
title: 'Transform Your Business'
subtitle: 'Comprehensive solutions for the modern enterprise'
cta: 'Learn More'
```

**3. Analyze each element**

```markdown
## Hero Section Analysis

### Title: "Transform Your Business"

**Issues:**

- Generic transformation promise
- No specificity
- Grade 8

**Suggestion (Gary Halbert style):**
"Cut Your Costs. Double Your Output."

**Why:**

- Specific benefits
- Parallel structure
- Direct and urgent
- Grade 4
- Creates immediate interest

### Subtitle: "Comprehensive solutions for the modern enterprise"

**Issues:**

- Corporate jargon ("comprehensive solutions")
- Vague ("modern enterprise")
- Grade 12

**Suggestion (Gary Halbert style):**
"The simple system that helped 500+ companies save $2M each."

**Why:**

- Social proof (500+ companies)
- Specific result ($2M)
- "Simple" addresses fear of complexity
- Grade 6

### CTA: "Learn More"

**Issues:**

- Weakest possible CTA
- No value proposition
- Unclear what happens next

**Suggestion (Gary Halbert style):**
"Show Me How"

**Why:**

- Active, command form
- Implies demonstration/proof
- Personal ("Me")
- Grade 2
```

**4. Test readability of combined hero**

**5. Provide complete hero section options**

---

## Pattern 6: Documenting Voice and Tone

**Goal:** Help user choose and document copywriting standards in hugo/CLAUDE.md.

### Steps

**1. Check if already documented**

```bash
test -f hugo/CLAUDE.md && grep -i "copywriting" hugo/CLAUDE.md || echo "Not documented"
```

**2. If not documented, use AskUserQuestion**

**Question 1: Style Guide**

```
Which style guide should we use?
- AP Stylebook (recommended for web)
- Chicago Manual of Style (books, formal)
- Google Developer Style Guide (technical)
- Mailchimp (conversational marketing)
```

**Question 2: Copywriter Voice**

```
Which copywriter voice matches your brand?
- Gary Halbert (urgent, conversational)
- Dan Kennedy (authoritative, structured)
- Joanna Wiebe (crisp, persuasive)
- Ann Handley (warm, story-forward)
- Seth Godin (philosophical, minimal)
- Other (describe)
```

**Question 3: Readability Targets**

```
What reading level should we target?
- Grade 6-8 (accessible, general audience)
- Grade 8-10 (educated audience)
- Varies by content type
```

**3. Document in hugo/CLAUDE.md**

Use template from `assets/hugo-claude-template.md`

**4. Confirm with user**

```markdown
✓ Documented copywriting standards in hugo/CLAUDE.md

**Your standards:**

- Style Guide: AP Stylebook
- Voice: Joanna Wiebe (Copyhackers)
- Readability: Grade 7-9 for most content

All future content will be evaluated against these standards.
You can update them anytime by editing hugo/CLAUDE.md.
```

---

## Pattern 7: Style Guide Compliance Check

**Goal:** Verify content follows documented style guide mechanics.

### Steps

**1. Read documented style guide**

```bash
grep -A 10 "### Style Guide" hugo/CLAUDE.md
```

Example: "We follow AP Stylebook"

**2. Read content to check**

```bash
cat hugo/content/posts/example-post.md
```

**3. Check for common style guide violations**

**AP Stylebook checks:**

- [ ] Numbers: One through nine spelled out, 10+ as numerals
- [ ] Oxford comma: Should NOT be used (except for clarity)
- [ ] Percent: Use % symbol
- [ ] Dates: Abbreviated months (Jan. 21, 2026)
- [ ] Time: lowercase a.m./p.m. with periods
- [ ] States: Abbreviated in text (N.Y., Calif.)

**4. Report findings**

```markdown
## Style Guide Compliance Check

**Documented guide:** AP Stylebook

**Violations found:** 3

### 1. Oxford comma usage (Line 23)

**Current:** "We offer design, development, and consulting."
**Should be:** "We offer design, development and consulting."
**Rule:** AP style omits Oxford comma except when needed for clarity

### 2. Number spelling (Line 45)

**Current:** "Twelve employees"
**Should be:** "12 employees"
**Rule:** AP spells out one through nine, uses numerals for 10+

### 3. Percent formatting (Line 67)

**Current:** "15 percent increase"
**Should be:** "15% increase"
**Rule:** AP uses % symbol with numerals

**Compliance score:** 97% (3 violations in 156 style-sensitive elements)
```

**5. Offer to provide corrected version**

---

## General Advisory Mode Guidelines

**For all workflows:**

### Do:

- ✓ Explain why each suggestion improves the copy
- ✓ Provide before/after examples
- ✓ Reference documented standards
- ✓ Show trade-offs when multiple approaches work
- ✓ Respect user's judgment on which changes to make
- ✓ Ask before editing files
- ✓ Run readability analysis to validate changes

### Don't:

- ✗ Silently rewrite content
- ✗ Make changes without explaining rationale
- ✗ Ignore documented standards
- ✗ Apply rigid rules without context
- ✗ Criticize user's writing skill
- ✗ Force a single approach
- ✗ Forget to check hugo/CLAUDE.md

### Communication Pattern:

**Always structure feedback as:**

1. **What:** Identify the issue
2. **Why:** Explain why it matters
3. **How:** Show specific improvement
4. **Ask:** Get user input on direction

**Example:**

```
**What:** Your headline is 15 words long.

**Why:** Gary Halbert style targets 8-12 words for punchy impact.

**How:** "Stop Wasting Time on Broken Tools" → "Your Tools Are Broken. Here's the Fix."
(15 words → 9 words, adds urgency with period break)

**Ask:** Does this direction work for your brand voice?
```

## Workflow Summary

**Every workflow starts with:**

1. Check hugo/CLAUDE.md for documented standards
2. If not documented → prompt user → document choices
3. If documented → read and apply standards

**Every workflow ends with:**

1. Summary of suggestions provided
2. Next steps or questions for user
3. Offer to continue with related tasks

**Throughout every workflow:**

- Maintain advisory mode (suggest, don't silently rewrite)
- Provide specific examples
- Explain rationale
- Run readability analysis
- Respect user decisions

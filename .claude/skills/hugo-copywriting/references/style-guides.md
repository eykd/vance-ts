# Style Guides Reference

Comprehensive guide to choosing and applying style guides for Hugo site content.

**Purpose:** Style guides provide **mechanics** (grammar, punctuation, formatting, capitalization) while copywriter presets provide **voice** (tone, rhythm, word choice). You need both for consistent, effective content.

## Decision Tree

Use this flowchart to choose the right style guide for your Hugo site:

```
START: What type of content are you creating?

├─ News, journalism, PR, or general web content
│  └─ → AP Stylebook (MOST COMMON FOR HUGO SITES)
│
├─ Books, long-form business content, or publishing
│  └─ → Chicago Manual of Style
│
├─ Social sciences, research, or academic writing
│  └─ → APA Style
│
├─ Humanities, literature, or academic essays
│  └─ → MLA Style
│
├─ Technical documentation or developer content
│  └─ → Google Developer Style Guide
│
└─ Marketing, conversational brand content, or startups
   └─ → Mailchimp Content Style Guide
```

**Recommendation for most Hugo sites:** Start with **AP Stylebook** unless you have specific needs for another guide.

## Major Style Guides

### 1. AP Stylebook (Associated Press)

**Best for:** News, journalism, PR, general web content, blogs

**Philosophy:** Concise, clear, efficient. Designed for news writing where space and clarity matter.

**Key Characteristics:**

- **Numbers:** Spell out one through nine, use numerals for 10+
- **Dates:** Month Day, Year (e.g., Jan. 21, 2026)
- **Time:** lowercase a.m. and p.m. with periods
- **Oxford comma:** NO (use comma before "and" in series only when needed for clarity)
- **States:** Abbreviate in datelines and text (e.g., N.Y., Calif.)
- **Titles:** Capitalize before names, lowercase after (President Biden, but Joe Biden, president)
- **Percent:** Use % symbol with numerals (15%)
- **Internet terms:** website (not Website or web site), email (not e-mail)

**Example sentence (AP):**
"The company raised $5 million in Series A funding from investors in New York, California and Texas."

**Common mistakes when using AP:**

- ✗ "The company raised five million dollars..." (spell out numbers 10+)
- ✗ "...in New York, California, and Texas" (Oxford comma not used in AP)
- ✗ "President Smith" after already introducing "John Smith, president of the company"

**When to choose AP:**

- General-purpose websites and blogs
- News-style content
- PR and marketing websites
- Business websites without specialized requirements
- When you want modern, web-friendly style

**Resources:**

- APStylebook.com (subscription)
- Free AP style guides online
- AP Stylebook Twitter account for updates

---

### 2. Chicago Manual of Style

**Best for:** Books, long-form content, business writing, publishing

**Philosophy:** Comprehensive, traditional, detailed. The go-to guide for book publishing.

**Key Characteristics:**

- **Numbers:** Spell out zero through one hundred, use numerals for 101+
- **Dates:** Month Day, Year (e.g., January 21, 2026) - don't abbreviate months
- **Time:** lowercase a.m. and p.m. with periods (same as AP)
- **Oxford comma:** YES (always use comma before "and" in series)
- **States:** Spell out in text, abbreviate only in bibliographies
- **Titles:** Capitalize major words in titles (headline style)
- **Percent:** Spell out "percent" with numerals (15 percent)
- **Internet terms:** website, email (generally follows modern conventions)

**Example sentence (Chicago):**
"The company raised $5 million in Series A funding from investors in New York, California, and Texas."

**Difference from AP:**

- Uses Oxford comma (", and")
- More formal, traditional approach
- More detailed rules for edge cases

**When to choose Chicago:**

- Publishing books or long-form content
- Formal business writing
- Content requiring traditional style
- When you need comprehensive rules for edge cases
- Academic writing outside of sciences/humanities

**Resources:**

- ChicagoManualofStyle.org (subscription)
- Abbreviated free online guides
- "The Chicago Manual of Style" book (17th edition)

---

### 3. APA Style (American Psychological Association)

**Best for:** Social sciences, psychology, education, research papers

**Philosophy:** Clear, precise, designed for academic and scientific writing.

**Key Characteristics:**

- **Numbers:** Spell out zero through nine, use numerals for 10+ (with exceptions for statistics)
- **Dates:** Month Day, Year or Year, Month Day
- **Oxford comma:** YES
- **Headings:** Five levels of headings with specific formatting
- **Citations:** In-text citations with (Author, Year) format
- **Capitalization:** Sentence case for article/chapter titles
- **Bias-free language:** Strong emphasis on inclusive, respectful language

**Example sentence (APA):**
"The study (Smith, 2026) found that participants performed better on tasks requiring sustained attention."

**When to choose APA:**

- Research papers in social sciences
- Psychology, education, or nursing content
- When citations and references are central
- Academic blogs in these fields
- **NOT recommended for general Hugo sites** (too academic)

**Resources:**

- apastyle.apa.org (official site)
- "Publication Manual of the APA" (7th edition)

---

### 4. MLA Style (Modern Language Association)

**Best for:** Humanities, literature, arts, academic essays

**Philosophy:** Designed for literary analysis and humanities scholarship.

**Key Characteristics:**

- **Numbers:** Spell out numbers that can be written in one or two words
- **Dates:** Day Month Year (e.g., 21 January 2026)
- **Oxford comma:** YES
- **Citations:** In-text citations with (Author Page) format
- **Titles:** Italics for longer works, quotes for shorter works
- **Emphasis on author names** in citations

**Example sentence (MLA):**
"According to Smith, 'the data suggests a significant correlation' (45)."

**When to choose MLA:**

- Literary analysis or humanities content
- Academic writing in arts, literature, philosophy
- **NOT recommended for general Hugo sites** (too academic)

**Resources:**

- style.mla.org (official site)
- "MLA Handbook" (9th edition)

---

### 5. Google Developer Style Guide

**Best for:** Technical documentation, developer-focused content, API docs

**Philosophy:** Clear, consistent, accessible. Designed for global developer audiences.

**Key Characteristics:**

- **Numbers:** Use numerals for most numbers (follows general web convention)
- **Oxford comma:** YES (for clarity)
- **Active voice:** Strongly preferred
- **Present tense:** Preferred for instructions
- **Second person:** Use "you" for instructions
- **Accessibility:** Strong emphasis on inclusive language
- **Code formatting:** Specific rules for code samples, commands, UI elements
- **Capitalization:** Sentence case for most headings

**Example sentence (Google):**
"To deploy your app, run the following command in your terminal:"

**Special focuses:**

- Inclusive language (avoid "master/slave", "blacklist/whitelist")
- Clear instructions for non-native English speakers
- Consistent formatting for code and UI elements
- Accessibility considerations

**When to choose Google:**

- Technical documentation
- Developer-focused Hugo sites
- API documentation
- Tutorials and how-to guides for developers
- When accessibility and global audience matter

**Resources:**

- developers.google.com/style (free and comprehensive)
- Open source and community-maintained

---

### 6. Mailchimp Content Style Guide

**Best for:** Marketing, conversational brand content, modern startups

**Philosophy:** Friendly, human, conversational. Make marketing feel less like marketing.

**Key Characteristics:**

- **Tone:** Conversational but professional
- **Voice:** Clear, genuine, friendly
- **Grammar:** Follow standard rules but prioritize clarity
- **Numbers:** Use numerals for clarity
- **Oxford comma:** YES (for clarity)
- **Contractions:** Use them (they're more conversational)
- **Active voice:** Strongly preferred
- **Plain language:** Avoid jargon, explain technical terms

**Example sentence (Mailchimp):**
"You'll love this feature. It's simple, powerful, and it works right out of the box."

**Principles:**

1. **Write for all readers** - Assume readers are intelligent but busy
2. **Be clear** - Say what you mean, mean what you say
3. **Be concise** - Respect reader's time
4. **Be human** - Write like a person, not a corporation

**When to choose Mailchimp:**

- Modern marketing sites
- SaaS and startup websites
- Content marketing and blogs
- When you want conversational, friendly tone
- When you're building a relatable brand

**Resources:**

- styleguide.mailchimp.com (free, excellent resource)
- One of the best examples of a modern brand style guide

---

## Quick Reference Comparison

| Feature          | AP          | Chicago    | APA       | MLA        | Google     | Mailchimp      |
| ---------------- | ----------- | ---------- | --------- | ---------- | ---------- | -------------- |
| **Oxford comma** | No          | Yes        | Yes       | Yes        | Yes        | Yes            |
| **Numbers 1-10** | Spell out   | Spell out  | Spell out | Spell out  | Numerals   | Numerals       |
| **"percent"**    | %           | percent    | %         | percent    | %          | %              |
| **Date format**  | Jan. 21     | January 21 | Jan 21    | 21 January | January 21 | January 21     |
| **Contractions** | Formal only | Rare       | Rare      | Rare       | OK         | Encouraged     |
| **Tone**         | Neutral     | Formal     | Academic  | Academic   | Clear      | Conversational |
| **Best for**     | Web/news    | Books      | Research  | Humanities | Tech docs  | Marketing      |

## Common Differences That Matter

### Oxford Comma (Serial Comma)

**Definition:** Comma before "and" in a series of three or more items.

**Without Oxford comma (AP):**
"We offer web design, development and consulting."

**With Oxford comma (Chicago, most others):**
"We offer web design, development, and consulting."

**Why it matters:** Can change meaning in ambiguous sentences.

**Confusing example without Oxford comma:**
"I'd like to thank my parents, Oprah Winfrey and God."
(Implies your parents ARE Oprah and God)

**Clear with Oxford comma:**
"I'd like to thank my parents, Oprah Winfrey, and God."
(Three separate entities)

**Recommendation:** Use Oxford comma for clarity unless you commit to AP style.

### Numbers

**AP Style:**

- "They hired nine employees and 12 contractors."
- "The project costs $5 million."

**Chicago Style:**

- "They hired nine employees and twelve contractors."
- "The project costs $5 million."

**Why it matters:** Consistency in your content. Choose one approach.

### Capitalization of Titles

**Headline Style (Chicago):**
"How to Write Better Headlines for Your Blog Posts"

**Sentence Case (APA, Google):**
"How to write better headlines for your blog posts"

**Why it matters:** Affects all your post titles, navigation, headings.

## How to Document Your Choice

Once you choose a style guide, document it in `hugo/CLAUDE.md`:

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

**Resources:**

- [AP Stylebook](https://www.apstylebook.com/)
- Quick reference: [link to internal style guide]

**Last updated:** 2026-01-21
```

See `assets/hugo-claude-template.md` for complete template.

## Integration with Copywriter Voice

**Remember:** Style guide + copywriter voice = complete content standards

**Style guide provides:**

- Grammar rules
- Punctuation conventions
- Number formatting
- Capitalization rules
- Date/time formats

**Copywriter voice provides:**

- Tone and personality
- Sentence structure patterns
- Word choice preferences
- Persuasion techniques
- Readability targets

**Example:**

- **Style guide:** AP Stylebook (mechanics)
- **Copywriter voice:** Joanna Wiebe (voice and tone)
- **Result:** Voice-driven, persuasive copy with AP-compliant mechanics

## When Guides Conflict

If style guide conventions conflict with your copywriter voice:

**Priority:**

1. **Clarity first** - Choose whatever makes meaning clearest
2. **Brand consistency** - Your brand voice matters more than strict rules
3. **Reader needs** - Optimize for your specific audience
4. **Document exceptions** - Note when and why you deviate from style guide

**Example conflict:**

- AP style says no Oxford comma
- But Gary Halbert style uses short sentences where clarity matters
- **Solution:** Use Oxford comma when needed for clarity, document this exception

## Updating Your Style Guide Choice

If you need to change style guides:

1. **Document the decision** in `hugo/CLAUDE.md`
2. **Note the transition date**
3. **Update existing content gradually** (or note that old content uses previous style)
4. **Create a quick reference** of key differences for your team

**Don't:** Try to perfectly update all old content at once. Focus on new content and update old content opportunistically.

## Common Questions

**Q: Can I mix style guides?**
A: Not recommended. Choose one as your primary. Document specific exceptions if needed.

**Q: What if I'm writing for a specific publication?**
A: Use their style guide for that content. Document it as an exception.

**Q: Do I need to buy the official style guide?**
A: Not necessarily. Many free resources available online. But official guides provide comprehensive references.

**Q: What about British vs. American English?**
A: Choose one. Document it. Affects spelling (colour vs color), punctuation, date formats.

**Q: Can I create my own hybrid style?**
A: Yes, but document everything clearly. Start with an established guide and note exceptions.

## Resources

**Free resources:**

- **AP:** @APStylebook on Twitter, free online guides
- **Chicago:** Basic guidelines at chicagomanualofstyle.org
- **Google:** Full guide at developers.google.com/style
- **Mailchimp:** Full guide at styleguide.mailchimp.com

**Paid resources:**

- **AP Stylebook:** APStylebook.com ($30/year online)
- **Chicago:** ChicagoManualofStyle.org ($40/year online)
- **APA:** apastyle.apa.org, Publication Manual (~$30)
- **MLA:** style.mla.org, MLA Handbook (~$20)

**For Hugo sites specifically:**
Most Hugo sites should use **AP Stylebook** or **Mailchimp Content Style Guide** depending on tone (professional vs. conversational).

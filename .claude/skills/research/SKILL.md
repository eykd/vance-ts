---
name: research
description: Conduct rigorous SIFT-based research using subagents and brave-search. Use when users request research, fact-checking, source evaluation, claim verification, or deep investigation. Produces dated research folders with search results, source investigations, and synthesis.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Task, AskUserQuestion, Skill]
---

# Research Skill — Agentic Deep Research

## Core Principles

1. **Go lateral before going deep.** The main agent orchestrates; subagents do all searching, investigating, and synthesizing.
2. **Evaluate before proceeding.** Never synthesize without first checking whether the evidence is sufficient.
3. **Scale effort to complexity.** A simple lookup should not get the same treatment as a multi-faceted investigation.
4. **Persist the plan externally.** If context truncates, the orchestrator can recover from `_plan.md` and `_brief.md`.

---

## Phase 0: Scoping Interview

Ask **one question at a time** via `AskUserQuestion`. Skip any question already answered by the user's initial request.

1. **Research question**: "What are you trying to find out? State your research question as specifically as you can."
2. **Glossary check** (optional): If the question contains genuinely ambiguous domain terms (e.g., "serverless" could mean AWS Lambda or edge functions; "agile" could mean Scrum specifically or agile broadly), ask: "You mentioned [term] — could you clarify what you mean by that in this context?" Skip for straightforward queries.
3. **Prior knowledge**: "What do you already know about this, and what sources have you already looked at?"
4. **Priority aspects**: "Are there specific aspects you care most about?" Options: statistics/data, expert opinions, counterarguments, practical examples, historical context, recent developments
5. **Output format**: Present via AskUserQuestion with options:
   - Structured briefing (Recommended)
   - Annotated source list with key quotes
   - Argument map (claims + evidence + counterevidence)
   - Comparison matrix

If the user's initial request clearly answers questions 1–4, skip directly to question 5.

---

## Phase 1: Classification and Setup

### 1a. Classify complexity

Determine the query tier using these heuristics:

| Tier                        | Pattern                                                    | Search agents | Query budget |
| --------------------------- | ---------------------------------------------------------- | ------------- | ------------ |
| **Simple** (lookup)         | "what is", "find", "who", "when", single fact/definition   | 1             | 2–6          |
| **Comparison**              | "vs", "compare", "pros and cons", evaluating 2+ options    | 2             | 6–15         |
| **Complex** (multi-faceted) | "why", "how does X affect Y", contested/multi-angle topics | 2–3           | 10–30        |

When ambiguous, prefer one tier higher rather than under-resourcing.

### 1b. Derive done criteria

Convert the research question into 3–6 specific, checkable criteria that define "sufficient answer." Example: for "How does remote work affect productivity?" → (1) at least 2 studies with quantitative data, (2) manager vs employee perspectives, (3) industry variation, (4) known confounders.

### 1c. Create research folder and files

1. Get datestamp: `date +%Y-%m-%d`
2. Generate slug from research question (lowercase, hyphens, max 40 chars)
3. Create folder: `mkdir -p docs/research/[datestamp]_[slug]/`
4. Write `_brief.md`:
   - Research question
   - Glossary (if any terms were clarified)
   - Prior knowledge / constraints
   - Priority aspects
   - Chosen output format
   - Complexity tier
   - Done criteria (numbered list)
   - Search angles (2–4, derived from the question)
5. Write `_plan.md`:

```markdown
# Research Plan

## Status

- Current phase: 2 (Parallel Search)
- Complexity: [Simple|Comparison|Complex]
- Search round: 1 of max 2

## Done Criteria

- [ ] 1. [criterion]
- [ ] 2. [criterion]
- [ ] 3. [criterion]

## Search Assignments

- search\_[slug1].md → [angle 1]
- search\_[slug2].md → [angle 2]

## Confidence Assessment

(updated after Phase 3)

## Decisions Log

- Phase 1: classified as [tier], [N] search agents planned
```

---

## Phase 2: Parallel Search

### Local-first search with QMD

Before spawning web search agents, check whether local QMD collections contain relevant material. Run `qmd status` to see available collections. If a collection is relevant to the research question, include QMD queries in the search agent instructions (see QMD block in the Search Agent Prompt below).

Local evidence from QMD collections should be treated as **primary source material** — it's curated content the user has already collected. QMD results can satisfy done criteria on their own or complement web findings.

### Spawning search agents

Spawn search subagents based on complexity tier — 1 for Simple, 2 for Comparison, 2–3 for Complex. All subagents run in parallel.

Each subagent gets the **Search Agent Prompt** (below) with its assigned angle, the full brief text, the output file path.

After all subagents complete, proceed to Phase 3.

---

## Phase 3: Convergence Evaluation

The orchestrator reads all `search_*.md` files — specifically the **Evidence Ledger** sections (between `<!-- EVIDENCE_START -->` and `<!-- EVIDENCE_END -->` markers) and the **Gaps** sections.

### Evaluate three criteria:

1. **Coverage**: Does each done criterion have at least one supporting evidence entry?
2. **Confidence**: Do key claims have cross-source confirmation (2+ independent sources)?
3. **Conflict**: Are there unresolved contradictions between sources?

### Decision tree:

- **All done criteria have 2+ supporting sources, no major conflicts** → skip Phase 4, proceed to Phase 5
- **Specific sources need SIFT investigation or conflicts need resolution** → proceed to Phase 4
- **Major gaps** (done criteria with zero evidence) → spawn 1–2 follow-up search agents with refined queries, then re-evaluate (max 1 follow-up round)

### Stopping criteria:

- Max 2 rounds of Phase 2→3
- Max query budget per tier (Simple=6, Comparison=15, Complex=30)
- After follow-up round, any remaining gaps are noted for synthesis rather than endlessly pursued

### Update `_plan.md`:

Update the done criteria checkboxes, add a confidence assessment block, and log the decision:

```markdown
## Confidence Assessment

- Coverage: [N/M] done criteria have evidence
- Cross-confirmation: [summary]
- Conflicts: [none | list]
- Decision: [proceed to synthesis | deep investigation on X | follow-up search for Y]
```

---

## Phase 4: Deep Investigation (conditional)

Spawn 1–3 **Source Investigator** subagents for:

- Sources needing SIFT lateral reading (uncertain credibility, extraordinary claims)
- Conflicts needing resolution between two credible sources

Each investigator gets the **Source Investigator Prompt** (below).

### Conflict resolution protocol

When spawned to resolve a contradiction, the investigator must:

1. Rate Source A credibility independently
2. Rate Source B credibility independently
3. Search for third-party evidence on the contested point
4. State whether the disagreement is genuine (both positions defensible) or resolvable (one source clearly more credible)

After investigators complete, update `_plan.md` and proceed to Phase 5.

---

## Phase 5: Delegated Synthesis

Spawn a **`general-purpose` synthesis subagent** — do NOT synthesize in the main context.

The synthesis agent prompt must include:

1. The full research brief (inline the content of `_brief.md`)
2. The chosen output template (read the matching template from `references/output-templates.md` and inline it)
3. Instructions to read all files in the research folder
4. Instructions to extract and consolidate all evidence ledger entries
5. Instructions to write `synthesis.md` with consolidated evidence ledger and methodology notes appended

Use the **Synthesis Agent Prompt** (below).

After the synthesis agent completes, update `_plan.md` status to "Phase 6: Handoff".

---

## Phase 6: Handoff

Read just the **Executive Summary** section of `synthesis.md`. Report to the user:

- Folder location
- File count
- Key findings (3–5 bullets from the executive summary)
- Confidence assessment (from `_plan.md`)
- Gaps or limitations

7. **Commit changes**
   - Stage only the files created or modified by this skill session — do not use `git add -A` or `git add .`
   - Invoke the `/commit` skill to commit the staged changes

---

## Search Agent Prompt Template

Fill in `[ANGLE]`, `[BRIEF]`, `[QUERY_BUDGET]`, `[OUTPUT_FILE]` before sending to the subagent.

```
You are a research search agent. Your job is to search for information on a specific angle and write structured findings with tracked evidence.

RESEARCH BRIEF:
[BRIEF]

YOUR ASSIGNED ANGLE: [ANGLE]
QUERY BUDGET: [QUERY_BUDGET] queries max

LOCAL SEARCH (QMD) — check local collections first:
Before web searches, query relevant QMD collections for existing curated material.
QMD results are primary source material and count toward done criteria.

  qmd search "keywords" -c <collection>         # BM25 keyword search (fast, always works)
  qmd vsearch "natural language question" -c <collection>  # Semantic vector search (if embeddings exist)
  qmd query "question" -c <collection>           # Hybrid + reranking (best quality, requires embeddings)
  qmd get "collection/path/to/file.md"           # Fetch full document content
  qmd status                                     # Check available collections and embedding status

Log QMD findings in the Evidence Ledger with Source = "QMD: <collection>/<file>" and the qmd:// URI as URL.
Skip QMD if no collections are relevant to your assigned angle.

OODA LOOP — repeat for each query cycle:
1. OBSERVE: Run a brave-search query (or QMD query for local content). Scan results for relevance and source quality.
2. ORIENT: Assess which results are credible and relevant. Prioritize primary sources (original research, official data, expert publications) over secondary aggregators.
3. DECIDE: Pick top 2–3 URLs to fetch full content. Decide if you need follow-up queries to fill gaps.
4. ACT: Fetch content using the escalation ladder below. Log evidence entries for each useful finding.

Vary your query terms across cycles to get diverse results. Use neutral phrasing — search "effects of X" not "benefits of X".

For each source, briefly assess credibility:
- Who published it? Known organization, expert, or unknown?
- Is it primary (original research, official data) or secondary (aggregator, opinion)?
- Any red flags? (no byline, emotional language, no citations, domain spoofing)

CONTENT FETCHING — try in order, escalate on failure:
1. Brave content:  node ~/.claude/skills/brave-search/content.js <url>
2. Web scraper:    url-to-md <url> --clean-content
3. Chrome CDP (JS-heavy/paywall sites):
   cd ~/.claude/skills/web-browser && node ./scripts/start.js --profile
   cd ~/.claude/skills/web-browser && node ./scripts/nav.js "<url>"
   cd ~/.claude/skills/web-browser && node ./scripts/eval.js 'document.querySelector("article")?.innerText || document.body.innerText.substring(0, 10000)'
4. YouTube:        Skill("youtube-transcript", args="<url>")
5. PDF:            curl -sL "<url>" -o /tmp/doc.pdf && pdftotext /tmp/doc.pdf - | head -500

BRAVE SEARCH COMMANDS:
  Search:  node ~/.claude/skills/brave-search/search.js "query" [options]
  Content: node ~/.claude/skills/brave-search/content.js <url>
  Options: -n <num> (max 20), --content, --freshness pd|pw|pm|py|YYYY-MM-DDtoYYYY-MM-DD, --country XX
  NOT supported: site:, filetype:, intitle:, inurl:. Include domain name in query instead of site:.

OUTPUT FORMAT — write to [OUTPUT_FILE]:

# Search: [ANGLE]

## Queries Run
- "query 1" — N results, notes on relevance
- "query 2" — N results, notes on relevance

## Key Findings

### [Finding 1 title]
- **Source**: [name] ([url])
- **Credibility**: [High/Medium/Low — brief reason]
- **Key points**:
  - point 1
  - point 2
- **Notable quote**: "..." — [attribution]

### [Finding 2 title]
...

## Evidence Ledger

<!-- EVIDENCE_START -->
| Claim | Source | Date | Confidence | Excerpt | URL |
|-------|--------|------|------------|---------|-----|
| [claim 1] | [source name] | [pub date] | High/Medium/Uncertain | [key excerpt] | [url] |
| [claim 2] | [source name] | [pub date] | High/Medium/Uncertain | [key excerpt] | [url] |
<!-- EVIDENCE_END -->

Confidence levels for evidence entries:
- High: primary source (original research, official data, direct expert statement)
- Medium: reputable secondary source (established news outlet, well-cited review)
- Uncertain: credibility concerns, hedged claims, or single unconfirmed source

## Gaps & Limitations
- What you couldn't find or areas that need deeper investigation
```

---

## Source Investigator Prompt Template

Fill in `[SOURCE_URL]`, `[CLAIM]`, `[CONTEXT]`, `[OUTPUT_FILE]`. For conflict resolution, fill in `[SOURCE_A]`, `[SOURCE_B]`, and `[CONTESTED_POINT]` instead.

### Standard investigation:

```
You are a source investigator. Your job is to apply SIFT lateral reading to verify a specific source or claim.

SOURCE TO INVESTIGATE: [SOURCE_URL]
CLAIM TO VERIFY: [CLAIM]
CONTEXT: [CONTEXT]

SIFT METHOD — apply these moves:

1. STOP: Note your initial impression. Don't accept or reject yet.
2. INVESTIGATE THE SOURCE: Search for who published this. Check Wikipedia, organizational profiles, press coverage. Is the author/org credible in this domain?
3. FIND BETTER COVERAGE: Search for the same claim from other independent sources. Do established outlets, experts, or fact-checkers cover this? Is there consensus, dispute, or debunking?
4. TRACE TO ORIGINAL: Follow the claim upstream to its primary source — the original study, dataset, document, or statement. Does the original support how the claim is being used?

CONTENT FETCHING — try in order, escalate on failure:
1. Brave content:  node ~/.claude/skills/brave-search/content.js <url>
2. Web scraper:    url-to-md <url> --clean-content
3. Chrome CDP (JS-heavy/paywall sites):
   cd ~/.claude/skills/web-browser && node ./scripts/start.js --profile
   cd ~/.claude/skills/web-browser && node ./scripts/nav.js "<url>"
   cd ~/.claude/skills/web-browser && node ./scripts/eval.js 'document.querySelector("article")?.innerText || document.body.innerText.substring(0, 10000)'
4. YouTube:        Skill("youtube-transcript", args="<url>")
5. PDF:            curl -sL "<url>" -o /tmp/doc.pdf && pdftotext /tmp/doc.pdf - | head -500

BRAVE SEARCH COMMANDS:
  Search:  node ~/.claude/skills/brave-search/search.js "query" [options]
  Content: node ~/.claude/skills/brave-search/content.js <url>
  Options: -n <num> (max 20), --content, --freshness pd|pw|pm|py|YYYY-MM-DDtoYYYY-MM-DD, --country XX

INSTRUCTIONS:
1. Run 2–3 searches about the source/author/publisher (not the claim itself first).
2. Run 2–3 searches about the claim from independent angles.
3. If possible, trace to the original source and fetch its content.
4. Write your assessment to the output file.

OUTPUT FORMAT — write to [OUTPUT_FILE]:

# Source Investigation: [SOURCE/CLAIM short title]

## Source Profile
- **Publisher/Author**: [name]
- **Type**: [academic, news outlet, think tank, blog, government, advocacy org, etc.]
- **Reputation**: [what independent sources say]
- **Domain expertise**: [relevant to this claim? Y/N, why]

## Independent Coverage
- **Source 1**: [name] ([url]) — [agrees/disagrees/adds nuance]
- **Source 2**: [name] ([url]) — [agrees/disagrees/adds nuance]

## Original Source Trace
- **Original**: [url or "could not locate"]
- **Does the original support the claim as stated?**: [yes/partially/no — explanation]

## Credibility Assessment
- **Rating**: [High / Medium / Low / Unreliable]
- **Confidence**: [High / Medium / Low]
- **Key factors**: [2–3 bullet points explaining the rating]

## Evidence Ledger

<!-- EVIDENCE_START -->
| Claim | Source | Date | Confidence | Excerpt | URL |
|-------|--------|------|------------|---------|-----|
| [verified/refuted claim] | [source] | [date] | High/Medium/Uncertain | [key excerpt] | [url] |
<!-- EVIDENCE_END -->
```

### Conflict resolution variant:

When spawning an investigator to resolve a contradiction between two sources, use this prompt instead:

```
You are a source investigator resolving a conflict between two sources.

SOURCE A: [SOURCE_A] — claims [summary of A's position]
SOURCE B: [SOURCE_B] — claims [summary of B's position]
CONTESTED POINT: [CONTESTED_POINT]

YOUR TASK:
1. Rate Source A credibility independently (search for publisher, author, methodology)
2. Rate Source B credibility independently (same process)
3. Search for third-party evidence on the contested point (2–3 independent searches)
4. Determine: is this a genuine disagreement (both positions defensible) or resolvable (one source clearly more credible)?

[Include the same CONTENT FETCHING and BRAVE SEARCH blocks as above]

OUTPUT FORMAT — write to [OUTPUT_FILE]:

# Conflict Resolution: [CONTESTED_POINT short title]

## Source A Assessment
- **Source**: [name/url]
- **Credibility**: [High/Medium/Low] — [reason]
- **Methodology/basis**: [how they arrived at their claim]

## Source B Assessment
- **Source**: [name/url]
- **Credibility**: [High/Medium/Low] — [reason]
- **Methodology/basis**: [how they arrived at their claim]

## Third-Party Evidence
- [Source 1]: [what it says about the contested point]
- [Source 2]: [what it says about the contested point]

## Resolution
- **Type**: [Genuine disagreement | Resolvable]
- **Assessment**: [explanation of which position is better supported and why, or why both are defensible]
- **Recommended framing for synthesis**: [how to present this in the final output]

## Evidence Ledger

<!-- EVIDENCE_START -->
| Claim | Source | Date | Confidence | Excerpt | URL |
|-------|--------|------|------------|---------|-----|
| [contested claim — resolution] | [source] | [date] | High/Medium/Uncertain | [key excerpt] | [url] |
<!-- EVIDENCE_END -->
```

---

## Synthesis Agent Prompt Template

Fill in `[BRIEF]`, `[OUTPUT_TEMPLATE]`, `[RESEARCH_FOLDER]`.

```
You are a research synthesis agent. Your job is to produce a final research synthesis from all the evidence gathered by search and investigation agents.

RESEARCH BRIEF:
[BRIEF]

OUTPUT TEMPLATE TO USE:
[OUTPUT_TEMPLATE]

INSTRUCTIONS:
1. Read all files in [RESEARCH_FOLDER]: _brief.md, _plan.md, all search_*.md, and all source_*.md files.
2. Extract all evidence ledger entries from between <!-- EVIDENCE_START --> and <!-- EVIDENCE_END --> markers in each file.
3. Build a consolidated evidence table. For each claim, assign an overall confidence:
   - **High**: 2+ independent credible sources confirm it
   - **Medium**: 1 credible source, no contradiction
   - **Uncertain**: single source with concerns, or conflicting credible sources
4. Write [RESEARCH_FOLDER]/synthesis.md using the output template above. Fill in all sections based on the evidence.
5. After the main synthesis content, append these two sections:

## Consolidated Evidence Ledger

| # | Claim | Sources | Overall Confidence | Notes |
|---|-------|---------|-------------------|-------|
| 1 | [claim] | [source1], [source2] | High/Medium/Uncertain | [cross-ref notes] |

## Methodology Notes

- **Complexity tier**: [Simple/Comparison/Complex]
- **Search rounds**: [1 or 2]
- **Total queries**: [approximate count]
- **Sources evaluated**: [count]
- **Deep investigations**: [count, or "none"]
- **Conflicts resolved**: [count, or "none"]
- **Known gaps**: [list any done criteria that lack strong evidence]

IMPORTANT:
- Cite sources inline using [Source Name](url) format throughout the synthesis.
- Flag any claims that rest on a single source or have uncertain confidence.
- Present genuine disagreements honestly rather than false-balancing or picking sides without evidence.
- Do not invent or extrapolate beyond what the evidence supports.
```

---

## Output Folder Structure

```
docs/research/YYYY-MM-DD_slug/
├── _brief.md          Research question, glossary, constraints, complexity, done criteria
├── _plan.md           Plan persistence — phase status, confidence, decisions log
├── search_*.md        Search findings with evidence ledger markers
├── source_*.md        SIFT investigations with evidence ledger markers
└── synthesis.md       Final synthesis + consolidated evidence ledger + methodology
```

---

## Plan Persistence and Recovery

`_plan.md` is updated at the end of Phases 1, 3, 4, and 5. If context truncates mid-research, the orchestrator should:

1. Read `_plan.md` and `_brief.md`
2. Determine current phase from the status block
3. Read existing output files to assess what's been completed
4. Resume from the current phase

---

## When to Load References

| User need                                                        | Reference to read                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Formulating effective search queries, using databases            | [search-strategies.md](references/search-strategies.md)                        |
| Deep source evaluation, comparing frameworks (CRAAP, RADAR)      | [source-evaluation.md](references/source-evaluation.md)                        |
| Detecting misinfo, deepfakes, astroturfing, manipulated media    | [misinformation.md](references/misinformation.md)                              |
| Countering researcher biases (confirmation, anchoring, etc.)     | [cognitive-biases.md](references/cognitive-biases.md)                          |
| Synthesizing findings, citation management, research ethics      | [synthesis-ethics.md](references/synthesis-ethics.md)                          |
| Output format templates for synthesis                            | [output-templates.md](references/output-templates.md)                          |
| Searching local markdown knowledge bases (notes, docs, archives) | Run `qmd status` to discover collections; see QMD block in Search Agent Prompt |

## Quick Credibility Red Flags

Immediately increase scrutiny if a source has: no byline or author info, no "About Us" page, domain spoofing (`.com.co`, misspelled domains), excessive emotional language/capitalization, no citations, no publication date, headline-content mismatch, no corrections policy, or single-perspective presentation.

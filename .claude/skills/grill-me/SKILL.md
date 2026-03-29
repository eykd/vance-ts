---
name: grill-me
description: Stress-test a plan or design through relentless questioning. Use when the user wants adversarial review of their thinking, says "grill me", or needs decisions pressure-tested before implementation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

Interview the user relentlessly about every aspect of their plan or design until reaching shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one.

## Rules

1. For each question, provide your recommended answer so the user can accept, reject, or refine it.
2. If a question can be answered by exploring the codebase, explore the codebase instead of asking the user.
3. Resolve decisions one at a time — do not dump a wall of questions.
4. Track which branches of the decision tree are resolved vs open.
5. When all branches are resolved, summarize the final shared understanding.

---

Use subagents liberally and aggressively to conserve the main context window.

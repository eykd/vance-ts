---
name: ui-design-language
description: Describe front-end UI screens using a vocabulary-driven design language built on named color roles, a single size scale, and composable pattern sentences. Use when asked to describe, spec, sketch, wireframe, or define a UI screen layout in words — or when reviewing/critiquing a UI description. Triggers include "describe this screen", "UI spec", "design language", "screen description", "layout description", "interface vocabulary", or any request to express a UI as structured prose rather than code or pixels.
---

# UI Design Language

Describe interfaces with **words, not numbers**. Every UI element becomes a short sentence composed from four dimensions. The sentence is platform-agnostic.

## The Sentence Formula

```
[tone] [emphasis] [pattern] size [size]
```

| Dimension    | Quick reference                                                                |
| ------------ | ------------------------------------------------------------------------------ |
| **Tone**     | primary · secondary · accent · chrome · success · destructive · warning · info |
| **Emphasis** | solid · soft · outline · dash · ghost · link _(heaviest → lightest)_           |
| **Size**     | xs · sm · md · lg · xl _(2xl · 3xl for spacing only)_                          |
| **Shape**    | default · pill · square · circle                                               |

Examples: "primary solid button size large" · "chrome ghost button size small" · "destructive outline badge size medium" · "success soft alert" · "accent solid button size medium, pill shape"

Each word maps to exactly one design decision. Order is flexible. The result is unambiguous.

## Describing a Screen

Structure as an indented hierarchy of boxes and patterns:

```
Screen: Dashboard
├─ navbar: chrome, horizontal stack, pad medium
│  ├─ logo
│  └─ primary solid button size small "Sign Up"
├─ main: vertical stack, gap large, pad extra-large
│  ├─ heading extra-large bold
│  └─ horizontal wrap, gap medium
│     ├─ chrome outline card, pad large → stat: "Users" / "1,204"
│     └─ chrome outline card, pad large → stat: "Revenue" / "$48k"
└─ dock: chrome, size medium
   ├─ icon "home" (active: primary)
   └─ icon "profile"
```

## Key Principles

1. **Words, not numbers** — no pixel values, hex colors, or raw spacing numbers.
2. **Role, not value** — color by purpose (primary, destructive), not appearance (blue, red).
3. **One scale everywhere** — xs–3xl applies to every spatial property.
4. **Sentences are specs** — each resolves to exactly one visual result on any platform.
5. **Responsive via context** — optionally: "size small on mobile, size large on desktop."

## Related Design Skills

For layout composition strategy, see `/design-arrange`. For UX evaluation, see `/design-critique`. For design anti-patterns and the AI Slop Test, see `/design-frontend`.

## Reference Navigation

Load these on demand as needed:

| Need                                                            | Reference                                                            |
| --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Color role details, chrome surface levels, size scale specifics | [references/color-and-scale.md](references/color-and-scale.md)       |
| Emphasis level guidance, shape options, visual weight hierarchy | [references/emphasis-and-shape.md](references/emphasis-and-shape.md) |
| Box primitive properties, layout modes, full screen examples    | [references/box-and-layout.md](references/box-and-layout.md)         |
| Complete catalog of ~30 patterns across 6 categories            | [references/patterns.md](references/patterns.md)                     |

# Tone & Style

> Vancean voice: elaborate vocabulary, ironic distance, social comedy.

## Overview

All game text — encounters, descriptions, dialogue, UI copy — should feel like it belongs in a Jack Vance novel. This means a specific prose style that's distinctive, entertaining, and consistent.

## The Vancean Voice

_TODO: Expand from style preset_

Key characteristics:

- Elaborate, precise vocabulary (not purple prose — every word earns its place)
- Ironic distance from events (even dramatic moments described with detached amusement)
- Social comedy (cultures and their absurd customs played straight)
- Formal dialogue (characters speak with elaborate courtesy even when threatening each other)
- Understated violence and emotion
- Fascination with local custom, food, dress, and social hierarchy

## Writing Guidelines

_TODO: Define specific guidelines for game text authoring_

- Encounter text style
- Dialogue conventions
- Description patterns
- How to maintain tone in procedurally generated text

## Prestoplot as Tone Implementation

[Prestoplot](../systems/prestoplot/README.md) is the mechanical implementation of the Vancean voice. Grammar templates encode the vocabulary, sentence structures, and stylistic patterns that make game text feel Vancean. It operates in two modes:

### Mode 1: Direct Rendering

Prestoplot grammars produce player-facing text directly from templates and selection rules. This is fast, deterministic (same seed = same text), and needs no external services. Best for:

- Crew chatter and NPC dialogue variations (PICK mode for no-repeat, MARKOV for novel lines)
- Location flavor text (grammar modules per region)
- Trade gossip and market descriptions
- Ship system status and meter-state descriptions
- Any text that needs to be reproducible and cacheable

Vancean voice is encoded in the grammar templates themselves — elaborate vocabulary, formal sentence structures, ironic observations. A grammar author writes Vance-flavored templates; prestoplot ensures variety without breaking voice.

### Mode 2: LLM Prompt Generation

Prestoplot grammars produce structured prompts that an LLM expands into richer narrative. The grammar assembles context (character state, location details, quality values, cultural notes) into a well-structured prompt that guides the LLM toward Vancean output. Best for:

- Major storylet encounters requiring unique, contextual prose
- Culture-specific descriptions where PCG + LLM produces richer results than templates alone
- Complex NPC dialogue where personality, mood, and situation need nuanced expression
- Any text where the combinatorial explosion exceeds what grammar templates can cover

The grammar ensures the LLM receives consistent style direction, relevant context, and structural guidance — preventing generic AI prose while leveraging LLM fluency.

### Voice Consistency Across Modes

Both modes should produce text that feels like it belongs in the same game. Grammars for Mode 2 should include explicit Vancean style instructions in their prompt templates (vocabulary preferences, tone directives, example sentences). Mode 1 grammars embed the voice directly in their templates.

_TODO: Define which game text uses Mode 1 vs Mode 2. Rule of thumb: Mode 1 for high-frequency, low-stakes text; Mode 2 for low-frequency, high-stakes narrative moments._

## Connections

- **QBN Engine**: All storylet text must maintain Vancean voice
- **Prestoplot**: The mechanical implementation of voice — grammar templates for direct rendering and LLM prompt generation
- **Culture PCG**: Cultural descriptions are a key showcase for the voice; culture parameters feed prestoplot grammars
- **Crew**: Crew chatter system uses prestoplot for dialogue variation
- **All systems**: Every player-facing text needs this treatment

## Sources

- `docs/game-design/notes/jack_vance_style_preset.md` — existing style guide
- `docs/game-design/notes/baptized_vance_description.md` — setting concept
- `docs/spec/systems/prestoplot/README.md` — prestoplot system spec

# Mechanics Reference

The six dimensions of game mechanics. Use these to audit or design a game's formal system.

## 1. Space

The mathematical structure defining locations and their relationships.

- **Discrete** (grid, node graph) vs **continuous** (physics world)
- **Nested** spaces (room → dungeon → world)
- **Zero-dimensional** (no spatial component — pure card/dice games)

Design question: Does the space create interesting movement decisions? Does its shape imply strategy?

## 2. Time

- **Discrete** (turns) vs **continuous** (real-time)
- Time pressure as a mechanic (clocks, countdowns)
- Pacing: rhythm of tension and release
- Save states and their effect on player risk tolerance

Design question: Does time structure create meaningful urgency without unfairness?

## 3. Objects, Attributes & States

Every game has **objects** (entities), **attributes** (properties), and **states** (current values).

Critical design axis — **information visibility**:
| State | Effect |
|---|---|
| Public | All players know → coordination, direct competition |
| Hidden | One player knows → bluffing, deduction, surprise |
| Unknown | No one knows → luck, discovery, tension |

The richness of hidden information shapes whether a game feels like Chess, Poker, or Battleship.

## 4. Actions

- **Operative actions**: the game's verbs (move, shoot, trade, build)
- **Resultant actions**: emergent strategies players discover by combining operative actions

**The designer's goal**: a small, elegant operative vocabulary that generates vast resultant possibility. Chess has 6 piece types. The resultant space is effectively infinite. Aim for this ratio.

Design question: Are there interesting resultant actions players can discover, or does the game only support its operative actions?

## 5. Rules

- The objective is the most important rule. Without a clear goal, there is no game.
- What is _forbidden_ defines the game as much as what is permitted.
- **Modes**: many games have multiple rule states (setup, play, end). Manage transitions cleanly.

**Pareto Optimality test**: a game is balanced when no single strategy is strictly superior in all situations. If one strategy dominates, skilled players converge on it and depth collapses.

## 6. Skills Demanded

| Category | Examples                                                 |
| -------- | -------------------------------------------------------- |
| Physical | Dexterity, speed, coordination                           |
| Mental   | Memory, pattern recognition, prediction, problem-solving |
| Social   | Reading opponents, communication, deception, leadership  |

A game that challenges skills players _value_ feels meaningful. A game that challenges skills they don't care about, or skills that feel arbitrary, produces frustration.

Design question: Do the skills my game demands match what my target players find rewarding?

---

## Mechanic Design Checklist

- [ ] Is the space (or lack of space) intentional and does it create decisions?
- [ ] Does the time structure match the pacing I want?
- [ ] Is the information visibility creating the right tension?
- [ ] Do operative actions combine into interesting resultant strategies?
- [ ] Is the objective unambiguous?
- [ ] Are there modes, and are transitions smooth?
- [ ] Is there a dominant strategy? (bad) Or Pareto-optimal variety? (good)
- [ ] Are the demanded skills ones my audience values?

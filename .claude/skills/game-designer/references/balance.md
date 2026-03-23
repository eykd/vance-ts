# Balance Reference

## Symmetry

- **Symmetric**: all players start identically (Chess, Checkers) — easier to balance, less variety
- **Asymmetric**: players have different starting powers (MOBAs, many euros) — richer, much harder to balance

Asymmetric balance requires playtesting at scale. No amount of math substitutes for reps.

## Feedback Loops

| Type     | Mechanic                  | Risk                            | Use When                                      |
| -------- | ------------------------- | ------------------------------- | --------------------------------------------- |
| Positive | Winner gets stronger      | Runaway leader, snowball        | Early game momentum, punishing errors         |
| Negative | Leader gets disadvantaged | Feels unfair to skilled players | Keeping games competitive, catch-up mechanics |

Most well-balanced games use both. Positive loops create meaningful early decisions; negative loops preserve tension late.

## Balancing Methods (in priority order)

1. **Playtesting** — the only ground truth. Everything else is hypothesis.
2. **Spreadsheet modeling** — model math before building. Catch gross imbalances early.
3. **Dominant strategy analysis** — actively look for exploits. If you find one, players will too.
4. **Probability analysis** — for dice/card systems, calculate expected values explicitly.
5. **Feedback loop mapping** — diagram which mechanics amplify advantage vs. reduce it.

## Reward Design

Reward schedules from behavioral psychology (Skinner):

- **Fixed ratio**: reward every N actions → predictable, can feel grindy
- **Variable ratio**: reward at unpredictable intervals → most persistent behavior (slot machines, loot drops)
- **Fixed interval**: reward on a timer → players optimize around the schedule
- **Variable interval**: reward after unpredictable time → used in live service events

Variable ratio is the most powerful for engagement. Use it deliberately and ethically — it exploits compulsion loops.

## Difficulty Curve

The flow channel requires challenge to grow with skill:

- **Early game**: teach mechanics, forgive errors, reward exploration
- **Mid game**: introduce complexity, raise stakes, demand skill
- **Late game**: test mastery, deliver payoff

Common failure modes:

- **Difficulty cliff**: sudden spike that blocks players → caused by untested assumptions
- **Skill plateau**: challenge stops increasing → players get bored mid-game
- **Punishing start**: high early difficulty → kills retention before players invest

## Fairness Perception

Players tolerate mechanical unfairness if it _feels_ fair. They reject mathematical fairness that _feels_ unfair.

Rules for fairness perception:

- Players must understand _why_ they lost
- Losses from player error feel more acceptable than losses from system randomness
- Hidden information (fog of war) makes luck feel like skill gap — useful illusion
- Handicap systems work when players accept them socially (golf, bowling), not when imposed invisibly

## Balance Checklist

- [ ] Is there a dominant strategy? How do I know?
- [ ] Have I playtested at the extremes (best players vs. worst players)?
- [ ] Are feedback loops mapped and intentional?
- [ ] Do rewards match the schedule I intend (fixed vs. variable)?
- [ ] Is the difficulty curve tested at each phase?
- [ ] Do players understand why they lose?
- [ ] For asymmetric games: have all faction matchups been tested?

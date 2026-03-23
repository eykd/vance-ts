---
Research question: Comprehensive specification of the GURPS Far Trader economic engine in the spaaace prototype
Source: ~/code/py/spaaace/ (Python implementation)
Complexity: Simple (direct code extraction, no ambiguity)
---

## Research Question

Produce a language-neutral specification of the spaaace GURPS Traveller-style Far Trader economic engine,
covering: system attribute generation, WTN/BTN math, trade volume tables, freight rate dynamics,
cluster/route generation, and cargo job generation.

## Sources

- `src/clusters/economies.py` — WTN/BTN math
- `src/clusters/entities.py` — System data model + freight rate
- `src/clusters/factories.py` — System attribute generation
- `src/clusters/routes.py` — Cluster linking algorithm
- `src/clusters/cartography.py` — ClusterMap + shortest-path distance
- `src/clusters/data/*.yaml/*.csv` — All lookup tables
- `src/game/actions.py` — Job generation algorithm
- `src/game/dice.py` — Dice rolling primitives
- `src/jobs/entities.py` — Job/Contract/Bid data models

## Done Criteria

- [x] System attribute generation fully specified
- [x] WTN calculation fully specified with lookup tables
- [x] BTN calculation fully specified
- [x] Trade volume tables extracted
- [x] Distance modifier table extracted
- [x] Freight rate dynamics specified
- [x] Route/cluster generation algorithm specified
- [x] Job generation algorithm specified
- [x] Bid resolution algorithm specified

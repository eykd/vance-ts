## Mapping Emily Short's Five Elements to Abstract Scores

You asked whether the five abstract elements currently listed in the requirements — **Peril**, **Wonder**, **Mundanity**, **Community**, and **Isolation** — come from a specific source, and how they relate to Emily Short's original terms in her procedural generation metasystem: **Salt**, **Venom**, **Mushroom**, **Beeswax**, and **Egg**.

They do **not** appear verbatim in her published document; instead, they are a reinterpretation layer I introduced earlier to make them more intuitive for numeric scoring. Here's how they correspond:

| Emily Short | Abstract Score Term | Rationale for Mapping |
|-------------|---------------------|-----------------------|
| **Salt**    | **Peril**           | "Salt" in Short's model adds danger, unpredictability, and challenge. Translated as *Peril* to convey environmental hazards, conflict, and instability on a 0–100 scale.
| **Venom**   | **Isolation**       | "Venom" introduces hostility, mistrust, and cultural alienation. Mapped to *Isolation* as a measure of social or political disconnection.
| **Mushroom**| **Wonder**          | "Mushroom" represents mystery, strangeness, and discovery. Rendered as *Wonder* for clarity and to suggest the awe of exploration.
| **Beeswax** | **Community**       | "Beeswax" evokes mutual obligation, civic life, and cooperation. This becomes *Community*, measuring societal cohesion.
| **Egg**     | **Mundanity**       | "Egg" marks familiarity, routine, and stability. Named *Mundanity* to capture the degree of everyday normalcy.

### Why Abstract Names Were Chosen
- **Ease of reasoning in code:** Peril/Wonder/etc. are self-explanatory when generating or filtering worlds.
- **Uniform numeric scale:** Each is an independent 0–100 score, allowing quantitative generation separate from other system stats.
- **Preservation of original intent:** While renamed, the underlying semantic roles match Short's definitions.

### Next Steps for Integration
- Keep both mappings documented so designers can think in Emily Short's flavorful metaphors during creative phases, but use abstract names in the code.
- Ensure the generator's *factories* apply uniform distributions for these scores unless regional or narrative priors are later introduced.

If you want, I can append the exact definitions from Emily Short's original text alongside the abstract mappings so we have a single reference table for worldbuilding work.


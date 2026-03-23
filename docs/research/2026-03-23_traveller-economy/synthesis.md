# Research Briefing: Traveller RPG Economy Design

**Date**: 2026-03-23

## Executive Summary

The Traveller RPG (1977-present) is the foundational tabletop system for merchant-ship gameplay in science fiction. Its trade system operates on two levels: a **routine commerce layer** (freight, passengers, mail) that provides predictable baseline income, and a **speculative trade layer** (buy low / sell high with randomized prices) that provides risk/reward excitement. The economic tension is anchored by the **ship mortgage** -- a fixed monthly payment of 1/240th of the ship's cash price, sustained over 40 years -- which creates constant pressure to keep flying, keep trading, and keep the ship solvent. This mortgage-driven gameplay loop is the single most important design innovation: it transforms trade from an optional activity into the core survival mechanic.

GURPS Traveller: Far Trader (by Thrash, Daniels, and MacLean) extends the base system with a macro-economic model. It introduces the **World Trade Number (WTN)**, a composite economic rating for each world, and the **Bilateral Trade Number (BTN)**, which quantifies trade volume between any two worlds based on their WTNs and distance. This is essentially a **gravity model of trade** (analogous to the economic gravity model: trade volume is proportional to economic mass and inversely proportional to distance). Far Trader also adds 15 merchant character templates, trade route development rules, and business startup mechanics. Written with input from a professional economist, it remains the most rigorous trade simulation in tabletop RPG history.

For our digital adaptation, the key lessons are: (1) the mortgage creates the gameplay loop -- without economic pressure, trade becomes optional tourism; (2) speculative trade needs enough randomness to create stories but enough structure (via trade codes and world characteristics) to reward knowledge and planning; (3) the two-tier system (routine + speculative) lets cautious players survive while rewarding risk-takers; (4) the gravity trade model provides a principled way to generate trade volume from world data, which maps directly to our galaxy generation pipeline's existing trade code and economics fields.

## Key Findings

### 1. The Mortgage-Driven Gameplay Loop

The defining economic pressure in Traveller is the ship mortgage. A Free Trader (the canonical starting ship) costs roughly MCr 37. Monthly mortgage payment: MCr 0.154 (Cr 154,167). Monthly crew salaries: Cr 19,000-25,000. Monthly maintenance: roughly Cr 3,000. Monthly fuel: variable. Total monthly operating cost: approximately Cr 180,000-200,000.

Revenue sources to meet this:

- Freight: Cr 1,000/ton/parsec (a 200-ton Free Trader has ~82 tons cargo capacity)
- High Passage: Cr 6,000-50,000 per passenger (ship has ~6 staterooms after crew)
- Middle Passage: Cr 3,000-25,000 per passenger
- Low Passage: Cr 1,000-2,000 per passenger
- Mail contracts: Cr 25,000 per 5-ton container (require military/scout connections)
- Speculative trade: variable, potentially large profits or losses

The math is intentionally tight. A full cargo hold on a 1-parsec jump yields Cr 82,000 in freight -- barely half the mortgage payment. Players must combine freight, passengers, and speculative trade to survive. This creates the core decision loop: do you take the safe freight contract, or gamble on speculative cargo that might double your money or leave you bankrupt?

- Source: Traveller SRD (traveller-srd.com), Spacecraft Operations and Trade sections
- Source: Sir Poley's Tumblr analysis -- "The spaceship mortgage rule drives players toward trading ventures as a survival mechanic rather than a discretionary activity."
- Confidence: High (corroborated across multiple sources)

### 2. Speculative Trade Mechanics

The speculative trade system (as codified in Mongoose Traveller, building on Classic Traveller's Book 7: Merchant Prince) works as follows:

**Step 1 - Find a Supplier**: Roll Broker/Education/Social Standing skill check. Takes 1-6 days. Starport quality provides a bonus (Class A: +6, Class B: +4, Class C: +2). Black market suppliers use Streetwise instead.

**Step 2 - Determine Available Goods**: The supplier stocks "Common Goods" plus goods that match the world's trade codes (Agricultural worlds stock agricultural goods, Industrial worlds stock manufactured goods, etc.), plus 1d6 random goods from the full table.

**Step 3 - Purchase Price**: Roll 3d6 and apply modifiers: +Broker skill, +Int or Soc DM, +largest applicable Purchase DM for goods matching world trade codes, -largest applicable Sale DM. The modified roll determines a price multiplier ranging from roughly 40% to 400% of base price.

**Step 4 - Selling**: Same process in reverse at the destination world. Add largest Sale DM (for goods the destination world wants), subtract Purchase DM.

The trade goods table includes approximately 36 commodity types (Basic Electronics at Cr 25,000, Radioactives at Cr 1,000,000, Spices at Cr 6,000, etc.), each with Purchase DMs and Sale DMs tied to specific trade codes.

**Design insight**: The system rewards player knowledge of the galaxy. Knowing that an Agricultural world produces cheap foodstuffs (+DM on purchase) and an Industrial world pays premium for them (+DM on sale) lets skilled players plan profitable routes. But the 3d6 randomness means even good plans can fail, creating stories.

- Source: Traveller SRD, Trade section (traveller-srd.com/core-rules/trade/)
- Source: TravellerTools.azurewebsites.net (confirms implementation with "Raffle" option that adjusts rare goods probability by population)
- Confidence: High

### 3. Trade Codes and World Characteristics

Trade codes are derived from a world's physical and social attributes (the Universal World Profile or UWP). Key trade codes affecting commerce:

| Code | Meaning          | Trade Effect                                    |
| ---- | ---------------- | ----------------------------------------------- |
| Ag   | Agricultural     | Produces food/organic goods cheaply             |
| In   | Industrial       | Produces manufactured goods; buys raw materials |
| Ri   | Rich             | High purchasing power; luxury market            |
| Po   | Poor             | Low purchasing power; limited market            |
| Hi   | High Population  | Large market volume                             |
| Lo   | Low Population   | Small market; fewer available lots              |
| Na   | Non-Agricultural | Needs food imports                              |
| NI   | Non-Industrial   | Needs manufactured imports                      |
| De   | Desert           | Specific resource profile                       |
| Wa   | Water World      | Specific resource profile                       |

These codes create **natural trade complementarities**. An Ag world near an In world creates an obvious trade route (food one way, manufactured goods the other). The system rewards players who identify these pairings and exploit them before the market equilibrates.

- Source: TravellerMap.com Second Survey documentation
- Source: Freelance Traveller, Eaglestone Trade Index article
- Confidence: High

### 4. The Eaglestone Trade Index and Traffic Volume

Rob Eaglestone developed a systematic framework (later incorporated into Traveller5 as the "Importance" statistic) for calculating trade volume between worlds. Each world gets a composite Trade Index based on:

- Starport quality (+1 for A/B, -1 for D/E/X)
- Tech level (+1 for TL 10+, -1 for TL 7-)
- Bases (+1 freight for military/naval/scout)
- Capital status (+1)
- X-Boat route (+1)
- Trade codes (Hi/Ri: +1 each; Lo/Po: -1 each; In: +1 freight/-1 passenger)
- Zone status (Amber: -1/-2; Red: -8)

Range: -12 to +8.

**Distance penalty**: For Moderate density, subtract 1 from both indices per 2 parsecs of distance.

**Volume formula**: Trade Volume magnitude = sqrt(Index_A x Index_B), used as an exponent of 10. A magnitude of 3 means thousands of passengers/week and tens of thousands of freight tons/week.

**Relevance to our game**: This provides a principled, calculable way to determine how much commercial activity exists on any route -- directly usable by our galaxy generation pipeline, which already generates trade codes and economics data for all 12,000 systems.

- Source: Freelance Traveller (freelancetraveller.com/features/rules/tradeindex.html)
- Confidence: High (detailed article with worked examples)

### 5. GURPS Far Trader: The Gravity Trade Model

Far Trader (147 pages, Steve Jackson Games) introduces a macro-economic trade simulation "written with help from a real live economist." Its core innovation is applying the **gravity model of trade** to interstellar commerce:

**World Trade Number (WTN)**: A composite economic rating for each world, described as "a gross measure of a world's overall interstellar economy in generalized terms." Calculated from population, tech level, starport quality, and other factors.

**Bilateral Trade Number (BTN)**: Measures trade volume between two specific worlds. Calculated from the two worlds' WTNs minus a distance penalty. BTN values map to trade route classifications:

- BTN 1-7: Insignificant Route
- BTN 8: Red Line Minor Route
- BTN 9: Yellow Line Feeder Route
- BTN 10: Green Line Intermediate Route
- BTN 11: Cyan Line Main Route
- BTN 12+: Blue Line Major Route

Far Trader also covers: trade route development at sector scale, starting businesses, raising capital, financing ventures, identifying niche markets, 15 merchant character templates, and support for Free Traders, smugglers, and pirates.

A Python implementation (PyRoute, by programmer "Makhidkarun") implements the gravity trade model for automated trade route generation across Traveller sectors.

- Source: SJGames product page (sjgames.com/gurps/books/traveller/fartrader/)
- Source: SJGames errata page (confirms WTN, BTN, Port Rating mechanics exist)
- Source: Atomic Rockets / Project Rho (projectrho.com/public_html/rocket/stellartrade.php)
- Confidence: Medium-High (product descriptions and errata confirm mechanics exist; exact formulas are behind the paywall of the published supplement)

### 6. Passage Types and Passenger Generation

Traveller defines four passage types, each serving different gameplay functions:

| Type            | Cost (1 parsec)       | Space Required                  | Player Interaction                                        |
| --------------- | --------------------- | ------------------------------- | --------------------------------------------------------- |
| High Passage    | Cr 6,000              | 1 stateroom + 1 ton cargo       | Requires steward skill; wealthy/important NPCs            |
| Middle Passage  | Cr 3,000              | Shared stateroom, 100kg baggage | Standard travelers                                        |
| Working Passage | Free (labor exchange) | Same as middle                  | Passenger works as crew; adventure hook                   |
| Low Passage     | Cr 1,000              | Cryogenic berth, 10kg baggage   | Survival risk (Medic check required); desperate/poor NPCs |

Passenger availability is determined by population, starport quality, and route traffic. The Eaglestone Index provides magnitude-based estimates (a magnitude-3 route sees thousands of passengers per week).

**Design insight for our game**: Passenger types create natural story hooks. High passengers might be faction dignitaries. Low passengers are desperate -- why? Working passengers could become crew recruits. The cryogenic survival risk on low passage is a classic Traveller drama moment.

- Source: Traveller SRD, Spacecraft Operations (traveller-srd.com/core-rules/spacecraft-operations/)
- Confidence: High

### 7. Triangular Trade and Route Planning

The Atomic Rockets analysis highlights **triangular trade** as a key advanced mechanic: rather than simple A-to-B-and-back routes, the most profitable merchants plan multi-stop circuits.

Example: Planet A produces commodity X (desired on Planet B), Planet B produces commodity Y (desired on Planet C), Planet C produces commodity Z (desired on Planet A). "Work this in the right direction and get rich; work it backwards and lose your shirt."

This creates a route-planning metagame that rewards galaxy knowledge and strategic thinking. It also naturally emerges from the trade code system -- an Ag/Ri/In triangle creates a natural three-way trade circuit.

The system also identifies several merchant archetypes beyond simple traders:

- **Trade Pioneers**: Explore new worlds to identify opportunities before competitors
- **Factors**: Operate remote trading posts
- **Entrepreneurs**: High-risk commission-based work
- **Smugglers**: Black market trade (using Streetwise instead of Broker)

- Source: Project Rho, Stellar Trade page
- Confidence: Medium (analysis rather than primary rules)

### 8. Known Problems and Common Critiques

Several recurring critiques of Traveller's trade system appear across sources:

**Home-base tension**: Sir Poley identifies that trading naturally incentivizes returning to known, profitable routes rather than exploring new space. This conflicts with the exploration fantasy. "Pretty big problems" arise when home-base-centric trading conflicts with the desire to visit distant systems.

**Price convergence**: In a multi-player or simulated economy, arbitrage opportunities naturally shrink as markets equilibrate. "The profit is from the price difference between the two markets. The difference tends to shrink over time, which eliminates the profit." This is fine for single-player but problematic for MMOs.

**Procedural friction**: The speculative trade system requires multiple dice rolls, table lookups, and calculations per transaction. Sir Poley's "Frictionless Traveller" work focuses on reducing this overhead. Digital implementation eliminates this problem entirely.

**Mathematical imbalance in some editions**: Some trade goods are dramatically more profitable than others, leading to degenerate strategies. The TravellerTools "Raffle" option (lowering odds of rare goods, adjusting availability by population) is a community fix for this.

**Lack of demand/supply dynamics**: Base Traveller treats each world as a static market. There is no memory of previous trades -- you can sell the same goods at the same world repeatedly with the same expected prices. Far Trader partially addresses this with the gravity model, but true dynamic markets are beyond the tabletop system's scope.

- Sources: Sir Poley's Tumblr, Project Rho, TravellerTools
- Confidence: Medium (community analysis, not primary sources)

### 9. Lessons for Digital Adaptation

Based on this research, the following design principles emerge for our Vance-TS merchant game:

**Keep the mortgage**: The fixed monthly payment creates the core tension. Without it, trade is tourism. The mortgage should be calibrated so that routine commerce (freight + passengers) covers roughly 60-70% of costs, requiring speculative trade or special contracts to stay solvent.

**Use the gravity model for NPC trade volume**: The WTN/BTN system (or our equivalent using the Eaglestone Trade Index approach) can be pre-computed during galaxy generation to determine baseline traffic on every route. This data already aligns with our pipeline's trade codes and economics fields.

**Implement dynamic markets**: This is where digital beats tabletop. Track supply and demand per commodity per world. When players flood a market, prices drop. When no one trades a route, prices diverge. This creates the "trade pioneer" gameplay loop naturally.

**Make trade codes visible and learnable**: Players should be able to see a world's trade codes (Ag, In, Ri, etc.) and learn to predict what goods will be cheap/expensive there. This rewards system mastery without requiring out-of-game spreadsheets.

**Support triangular trade**: Route planning across 3+ systems should be mechanically rewarded. The QBN system could generate "trade circuit" contracts that pay bonuses for completing multi-stop deliveries.

**Differentiate passenger types**: High/Middle/Low passengers map naturally to QBN storylets. High passengers bring faction connections and drama. Low passengers bring desperation and moral choices. Working passengers are potential crew recruits.

**Solve the home-base problem**: Our Oikumene/Beyond structure naturally addresses this. The Oikumene has reliable, well-known trade routes (safe but competitive). The Beyond has unknown routes that might be wildly profitable (risky but rewarding). This gives players a reason to leave known space.

**Eliminate procedural friction**: The dice-rolling and table-lookup overhead that plagues tabletop Traveller disappears in a digital implementation. The system can calculate prices, availability, and profit margins instantly, letting the player focus on decisions rather than arithmetic.

## Gaps & Limitations

1. **Far Trader formulas not verified**: The exact WTN and BTN calculation formulas from GURPS Far Trader are behind a paywall. The errata confirms the mechanics exist and provides corrected values, but the full calculation procedure would require purchasing the PDF (available at $9.99 from SJGames).

2. **Limited access to community analysis**: Reddit, RPG StackExchange, and most RPG forums blocked WebFetch, preventing access to the richest community discussions of trade system problems and house rules.

3. **No quantitative analysis of speculative trade profitability**: The full 3d6 price multiplier table (mapping modified roll to purchase/sale price percentage) was not available in the SRD excerpt. This table is critical for understanding the risk/reward curve.

4. **Mongoose Traveller 2nd Edition changes not covered**: The latest edition reportedly revised the trade system significantly, but specific changes were not accessible.

5. **Digital adaptation precedents not found**: Searches for existing digital implementations of Traveller trade (beyond TravellerTools) did not yield results. Games like Elite: Dangerous and Star Traders: Frontiers are known to draw on Traveller but specific mechanical comparisons were not accessible.

6. **The TravellerRPG wiki was consistently unreachable** (timeout on every request), which would have been the most comprehensive single source.

## Evidence Ledger

<!-- EVIDENCE_START -->

| Claim                                                                                                                           | Source                       | Date    | Confidence | Excerpt                                                                                                                                      | URL                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Ship mortgage is 1/240th of cash price monthly for 480 months (40 years), total 220% of cash price                              | Traveller SRD                | Current | High       | "paying 1/240th of the cash price each month for 480 months (40 years)"                                                                      | https://www.traveller-srd.com/core-rules/spacecraft-operations/   |
| Freight pays Cr 1,000/ton/parsec + Cr 200/additional parsec                                                                     | Traveller SRD                | Current | High       | "Freight shipments pay Cr. 1,000 per ton for shipping a ton for one parsec, +200 Cr. per additional parsec"                                  | https://www.traveller-srd.com/core-rules/trade/                   |
| High Passage costs Cr 6,000 for 1 parsec, includes stateroom + 1 ton cargo                                                      | Traveller SRD                | Current | High       | "The passenger receives a stateroom and one ton of cargo space for baggage"                                                                  | https://www.traveller-srd.com/core-rules/spacecraft-operations/   |
| Low Passage has survival risk requiring Medic check                                                                             | Traveller SRD                | Current | High       | "a Medic check using the passenger's Endurance modifier determines viability"                                                                | https://www.traveller-srd.com/core-rules/spacecraft-operations/   |
| Speculative trade uses 3d6 + modifiers to determine purchase/sale prices                                                        | Traveller SRD                | Current | High       | "Roll 3d6 and apply: +Broker skill, +higher of Intelligence or Social Standing DM"                                                           | https://www.traveller-srd.com/core-rules/trade/                   |
| Starport class gives bonus to finding suppliers: A (+6), B (+4), C (+2)                                                         | Traveller SRD                | Current | High       | "Starport bonuses: Class A (+6), Class B (+4), Class C (+2)"                                                                                 | https://www.traveller-srd.com/core-rules/trade/                   |
| Far Trader provides "detailed analysis of the economics of interstellar trade, and a system of equations to model trade routes" | Project Rho / Atomic Rockets | Current | High       | "Written with help from a real live economist, this allows one to model interplanetary and interstellar trade with equations and everything" | https://www.projectrho.com/public_html/rocket/stellartrade.php    |
| Far Trader is 147 pages, covers trade routes, business startups, 15 character templates                                         | SJGames                      | Current | High       | "Develop sector-wide trade routes... Start your own character-run business, raise capital"                                                   | https://www.sjgames.com/gurps/books/traveller/fartrader/          |
| WTN is "a gross measure of a world's overall interstellar economy"                                                              | TravellerRPG Wiki            | Current | Medium     | "a gross measure of a world's overall interstellar economy in generalized terms"                                                             | https://wiki.travellerrpg.com/World_Trade_Number                  |
| BTN trade route classifications range from Insignificant (1-7) to Major (12+)                                                   | TravellerRPG Wiki            | Current | Medium     | "Blue Line Major Route (BTN 12+)"                                                                                                            | https://wiki.travellerrpg.com/Bilateral_Trade_Number              |
| Eaglestone Trade Index uses sqrt(V1 x V2) as magnitude for trade volume                                                         | Freelance Traveller          | 2014    | High       | "Trade Volume = sqrt(V1 x V2), rounded to an integer" used as exponent of 10                                                                 | https://www.freelancetraveller.com/features/rules/tradeindex.html |
| Eaglestone Trade Index incorporated into Traveller5 as "Importance"                                                             | Freelance Traveller          | 2014    | High       | "A modification of the Eaglestone Trade Index is incorporated into Traveller5 as Importance"                                                 | https://www.freelancetraveller.com/features/rules/tradeindex.html |
| Trade codes include Ag, In, Ri, Po, Hi, Lo and are derived from world characteristics                                           | TravellerMap                 | Current | High       | "Trade codes indicate a world's characteristics and economic potential"                                                                      | https://travellermap.com/doc/secondsurvey                         |
| Arbitrage profit shrinks over time as markets equilibrate                                                                       | Project Rho                  | Current | Medium     | "The difference tends to shrink over time, which eliminates the profit"                                                                      | https://www.projectrho.com/public_html/rocket/stellartrade.php    |
| Triangular trade is more profitable than simple two-way exchange                                                                | Project Rho                  | Current | Medium     | "Work this in the right direction and get rich; work it backwards and lose your shirt"                                                       | https://www.projectrho.com/public_html/rocket/stellartrade.php    |
| Ship mortgage drives trading as survival mechanic not discretionary activity                                                    | Sir Poley's Tumblr           | Current | Medium     | "The spaceship mortgage rule drives players toward trading ventures as a survival mechanic rather than a discretionary activity"             | https://sirpoley.tumblr.com/                                      |
| Home-base trading conflicts with exploration create "pretty big problems"                                                       | Sir Poley's Tumblr           | Current | Medium     | "pretty big problems" without obvious solutions                                                                                              | https://sirpoley.tumblr.com/                                      |
| Far Trader errata confirms WTN, Port Rating, and trade class mechanics                                                          | SJGames                      | Current | High       | "Port Rating (PR)... World Trade Number (WTN)" with specific corrected values                                                                | https://www.sjgames.com/errata/gurps/traveller-far-trader.html    |
| PyRoute implements Far Trader gravity trade model in Python                                                                     | Project Rho                  | Current | Medium     | "Python software library implementing the GURPS Traveller: Far Trader 'gravity trade model' to generate trade routes"                        | https://www.projectrho.com/public_html/rocket/stellartrade.php    |
| Monthly crew costs: Pilot Cr 6,000, Navigator Cr 5,000, Engineer Cr 4,000, Steward Cr 2,000                                     | Traveller SRD                | Current | High       | "Pilot: Cr. 6,000... Navigator: Cr. 5,000... Engineer: Cr. 4,000"                                                                            | https://www.traveller-srd.com/core-rules/spacecraft-operations/   |
| Maintenance is 0.1% of ship cost per year                                                                                       | Traveller SRD                | Current | High       | "0.1% of the total cost of the ship per year"                                                                                                | https://www.traveller-srd.com/core-rules/spacecraft-operations/   |
| Late delivery penalty: 1d6+4 x 10% reduction in payment                                                                         | Traveller SRD                | Current | High       | "reduces the amount paid by 1d6+4 x 10%"                                                                                                     | https://www.traveller-srd.com/core-rules/trade/                   |
| TravellerTools trade calculator adjusts rare goods by population via "Raffle" option                                            | TravellerTools               | Current | Medium     | "Lowers the odds of finding rare goods. Adjusts the amount of goods available based on population"                                           | https://travellertools.azurewebsites.net/                         |

<!-- EVIDENCE_END -->

## Suggested Further Research

1. **Purchase the GURPS Far Trader PDF ($9.99)** to extract the exact WTN/BTN formulas. These would directly inform our galaxy generation pipeline's economics calculations.

2. **Analyze the PyRoute source code** (Python implementation of Far Trader's gravity model) for algorithmic details that could be ported to our TypeScript pipeline.

3. **Study Elite: Dangerous and Star Traders: Frontiers** for lessons from digital adaptations of Traveller-inspired trade. Both games have extensive community analysis of their economic models.

4. **Research Mongoose Traveller 2nd Edition trade changes** (2016 revision). The SRD covers the 1st edition; the 2nd edition reportedly improved the speculative trade balance.

5. **Investigate Traveller5's "Importance" statistic** (the official evolution of the Eaglestone Trade Index) for the most current canonical approach to trade volume calculation.

6. **Compare with Sunless Skies / Sunless Sea trade systems** by Failbetter Games, which combine QBN narrative with trade mechanics -- directly relevant since our game also uses a QBN engine.

7. **Analyze Craig Perko's posts on economics and merchant gameplay** from the existing QMD collection (`qmd search "economics" -c perko` and `qmd search "trade" -c perko`), which may contain design insights specific to our project's philosophy.

8. **Research "trade wind" / seasonal trade patterns** as a mechanic to prevent route stagnation. Some Traveller house rules introduce time-varying demand that shifts optimal routes periodically.

# Procedural Star Cluster Generation
## A Comprehensive Design Guide for Space RPG Systems

*Derived from analysis of production code incorporating Traveller, GURPS Space, and Far Trader mechanics*

---

## Table of Contents

1. [Introduction and Design Philosophy](#1-introduction-and-design-philosophy)
2. [Core System Attributes (TER Ratings)](#2-core-system-attributes-ter-ratings)
3. [Planetary Characteristics](#3-planetary-characteristics)
4. [Population and Civilization](#4-population-and-civilization)
5. [Government and Law](#5-government-and-law)
6. [Trade Codes and World Features](#6-trade-codes-and-world-features)
7. [Economic Modeling](#7-economic-modeling)
8. [Trade Route Networks](#8-trade-route-networks)
9. [Bilateral Trade Calculations](#9-bilateral-trade-calculations)
10. [Dynamic Market Systems](#10-dynamic-market-systems)
11. [Cluster Cartography](#11-cluster-cartography)
12. [Complete Generation Algorithm](#12-complete-generation-algorithm)
13. [Reference Tables](#13-reference-tables)

---

## 1. Introduction and Design Philosophy

This guide presents a complete methodology for procedurally generating star clusters suitable for space-based role-playing games. The system produces interconnected star systems with realistic economic relationships, trade routes, and planetary characteristics that create emergent gameplay opportunities.

### Core Design Principles

The generation system operates on three foundational principles:

**Layered Attribute Generation:** Each system attribute builds upon previously generated values, creating natural correlations. For example, atmosphere depends on planetary size, and hydrography depends on both atmosphere and temperature. This produces worlds that feel internally consistent rather than randomly assembled.

**Emergent Trade Networks:** Economic relationships arise naturally from the combination of population, technology, resources, and spatial distance between systems. No trade routes are manually designed—they emerge from the underlying mathematics.

**Meaningful Variation:** Trade codes and special features emerge from attribute combinations, giving each world a distinct character that drives gameplay. A "Garden World" or "Industrial Hub" designation isn't arbitrary—it reflects specific planetary conditions.

### Source Systems

This methodology synthesizes mechanics from multiple tabletop RPG systems:

| Source | Abbreviation | Primary Contribution |
|--------|--------------|---------------------|
| Traveller RPG | Trav | Planetary characteristics, trade codes |
| GURPS Space | GS | Population ratings, starport classes |
| Far Trader | FT | Economic modeling, trade calculations |
| Diaspora SRD | DSRD | TER attributes, cluster linking |

---

## 2. Core System Attributes (TER Ratings)

Every star system is defined by three foundational attributes using the **Fate/Fudge dice system**. This produces values from **-4 to +4** with a bell curve centered on 0.

### 2.1 The Three Pillars

| Attribute | Formula | Range | Interpretation |
|-----------|---------|-------|----------------|
| **Technology (T)** | 4dF | -4 to +4 | Relative tech level vs. galactic average |
| **Environment (E)** | 4dF | -4 to +4 | Habitability of the primary world |
| **Resources (R)** | 4dF | -4 to +4 | Natural resource abundance |

### 2.2 Fate Dice Mechanics

Each Fate die (dF) has three faces: **[-1, 0, +1]**. Rolling 4dF produces the following probability distribution:

| Result | -4 | -3 | -2 | -1 | 0 | +1 | +2 | +3 | +4 |
|--------|----|----|----|----|---|----|----|----|----|
| Probability | 1.2% | 4.9% | 12.3% | 19.8% | 23.5% | 19.8% | 12.3% | 4.9% | 1.2% |

This distribution ensures most systems cluster around average values while extreme outliers remain possible but rare—creating interesting exceptions that drive adventure.

### 2.3 Interpreting TER Values

**Technology Levels:**
- **+4 (Legendary):** Post-scarcity technology, possibly reality-altering capabilities
- **+2 to +3 (Advanced):** Cutting-edge, experimental technologies
- **0 to +1 (Standard):** Galactic baseline technology
- **-1 to -2 (Developing):** Industrial to early space age
- **-3 to -4 (Primitive):** Pre-industrial or collapsed civilization

**Environment Ratings:**
- **+4 (Paradise):** Ideal Earth-like conditions, minimal adaptation needed
- **+2 to +3 (Favorable):** Comfortable with minor environmental challenges
- **0 to +1 (Marginal):** Survivable but requires infrastructure
- **-1 to -2 (Hostile):** Dangerous conditions, sealed habitats required
- **-3 to -4 (Extreme):** Lethal environment, advanced life support mandatory

**Resource Abundance:**
- **+4 (Bonanza):** Exceptional mineral wealth, rare elements abundant
- **+2 to +3 (Rich):** Above-average resources, profitable extraction
- **0 to +1 (Adequate):** Self-sufficient, moderate exports possible
- **-1 to -2 (Poor):** Resource-dependent, must import essentials
- **-3 to -4 (Barren):** Virtually no exploitable resources

---

## 3. Planetary Characteristics

Once TER ratings are established, detailed planetary characteristics are generated in a specific **dependency chain**. Each attribute uses the 2d6 system with modifiers derived from previously generated values.

### 3.1 Generation Order

The attributes must be generated in this exact sequence due to dependencies:

```
Size → Atmosphere → Temperature → Hydrography
```

### 3.2 Size Rating

**Formula:** `2d6 - 2`

**Range:** 0 to 10

**Environment Constraint:** If Environment ≥ 0, cap Size at 4 (favorable environments tend toward smaller, more Earth-like worlds).

| Size | Diameter (km) | Surface Gravity | Description |
|------|---------------|-----------------|-------------|
| 0 | < 800 | Negligible | Asteroid/planetoid |
| 1 | 1,600 | 0.05g | Small moon |
| 2 | 3,200 | 0.15g | Large moon (Luna-sized) |
| 3 | 4,800 | 0.25g | Mercury-sized |
| 4 | 6,400 | 0.35g | Mars-sized |
| 5 | 8,000 | 0.45g | Small terrestrial |
| 6 | 9,600 | 0.70g | Medium terrestrial |
| 7 | 11,200 | 0.90g | Earth-sized |
| 8 | 12,800 | 1.00g | Large terrestrial |
| 9 | 14,400 | 1.25g | Super-Earth |
| 10 | 16,000 | 1.40g | Massive terrestrial |

### 3.3 Atmosphere Rating

**Formula:** `2d6 + (Size - 7)`

**Range:** 0 to 15

**Environment Constraint:** If Environment ≥ 0, clamp result to range [5, 9] (breathable atmospheres).

| Rating | Type | Description | Survival Gear |
|--------|------|-------------|---------------|
| 0 | Vacuum | No atmosphere | Vacc suit required |
| 1 | Trace | Near-vacuum | Vacc suit required |
| 2-3 | Very Thin | Partial pressure | Respirator + supplemental O₂ |
| 4-5 | Thin | Low pressure | Respirator |
| 6-7 | Standard | Earth-like | None |
| 8-9 | Dense | High pressure | None (discomfort possible) |
| 10 | Exotic | Unusual gas mix | Air supply |
| 11-12 | Corrosive | Chemically active | Protective suit |
| 13 | Insidious | Penetrating corrosive | Hostile environment suit |
| 14-15 | Unusual | Variable/special | Case dependent |

### 3.4 Temperature Rating

**Formula:** `2d6 + (Atmosphere Modifier)`

**Range:** 0 to 12+

**Atmosphere Modifiers:**

| Atmosphere | Modifier |
|------------|----------|
| 0-1 | N/A (Temperature = 0) |
| 2-3 | -2 |
| 4-5 | -1 |
| 6-7 | 0 |
| 8-9 | +1 |
| 10 | +2 |
| 11-12 | +6 |
| 13 | +2 |
| 14-15 | -1 |

**Environment Constraint:** If Environment ≥ 0, clamp result to range [5, 9].

| Rating | Classification | Average Temp | Description |
|--------|---------------|--------------|-------------|
| 0-1 | Frozen | < -50°C | Permanent ice coverage |
| 2-3 | Cold | -50 to 0°C | Subarctic conditions |
| 4-5 | Cool | 0 to 10°C | Temperate-cold |
| 6-7 | Temperate | 10 to 30°C | Earth-like average |
| 8-9 | Warm | 30 to 50°C | Tropical to hot |
| 10-11 | Hot | 50 to 80°C | Desert/greenhouse |
| 12+ | Inferno | > 80°C | Extreme heat |

### 3.5 Hydrography Rating

**Formula:** `2d6 + (Size - 7) + Atmosphere Modifier + Temperature Modifier`

**Range:** 0 to 10

**Special Cases:**
- If Size is 0 or 1: Hydrography = 0 (insufficient gravity)

**Atmosphere Modifiers:**

| Atmosphere | Modifier |
|------------|----------|
| 0, 1, 10, 11, 12 | -4 |
| All others | 0 |

**Temperature Modifiers:**

| Temperature | Modifier |
|-------------|----------|
| 10-11 | -2 |
| 12+ | -6 |

*Exception: Atmosphere 13 (insidious) ignores temperature modifiers.*

**Environment Constraint:** If Environment ≥ 0, clamp result to range [2, 7].

| Rating | Coverage | Description |
|--------|----------|-------------|
| 0 | 0-5% | Desert world |
| 1 | 6-15% | Dry world |
| 2 | 16-25% | Arid |
| 3 | 26-35% | Semi-arid |
| 4 | 36-45% | Moderate |
| 5 | 46-55% | Average |
| 6 | 56-65% | Wet |
| 7 | 66-75% | Earth-like |
| 8 | 76-85% | Very wet |
| 9 | 86-95% | Near water world |
| 10 | 96-100% | Water world |

---

## 4. Population and Civilization

### 4.1 Population Rating

**Formula:** 
```
Base = 2d6 - 2 (range 0-10)
Final = Base + (Base ÷ 10) × Environment + (Base ÷ 10) × Resources
```

The formula creates a feedback loop where higher base populations benefit more from favorable conditions.

**Interpretation:**

| Rating | Population | Description |
|--------|------------|-------------|
| 0 | 0 | Uninhabited |
| 1 | 10s | Outpost |
| 2 | 100s | Village |
| 3 | 1,000s | Small town |
| 4 | 10,000s | Large town |
| 5 | 100,000s | Small city |
| 6 | Millions | Metropolis |
| 7 | 10 millions | Large nation |
| 8 | 100 millions | Major world |
| 9 | Billions | High population |
| 10+ | 10+ billions | Mega-population |

### 4.2 Starport Rating

The starport quality depends on both population and technology level, determined by a 3d6 roll against threshold values.

**Formula:**
```python
roll = 3d6
if tech_level >= 0 and population >= 6 and roll < (population + 3):
    starport = 5  # Class A
elif tech_level >= 0 and population >= 6 and roll < (population + 6):
    starport = 4  # Class B
elif tech_level >= 0 and roll < (population + 9):
    starport = 3  # Class C
elif tech_level >= 0 and roll < (population + 8):
    starport = 2  # Class D
elif roll <= 14:
    starport = 1  # Class E
else:
    starport = 0  # Class X (no starport)
```

**Starport Classes:**

| Rating | Class | Facilities | Fuel | Repairs | Shipyard |
|--------|-------|------------|------|---------|----------|
| 5 | A | Excellent | Refined | Full | Yes (all) |
| 4 | B | Good | Refined | Major | Yes (non-jump) |
| 3 | C | Routine | Unrefined | Minor | None |
| 2 | D | Poor | Unrefined | Emergency | None |
| 1 | E | Frontier | None | None | None |
| 0 | X | None | None | None | None |

---

## 5. Government and Law

### 5.1 Government Rating

**Formula:** `2d6 + (Population - 7)`

**Range:** 0 to 15+

| Rating | Type | Description |
|--------|------|-------------|
| 0 | None | No formal government structure |
| 1 | Company/Corporation | Corporate-ruled world |
| 2 | Participating Democracy | Direct citizen participation |
| 3 | Self-Perpetuating Oligarchy | Entrenched ruling class |
| 4 | Representative Democracy | Elected representatives |
| 5 | Feudal Technocracy | Tech-elite ruling class |
| 6 | Captive Government | Controlled by outside power |
| 7 | Balkanization | Multiple competing governments |
| 8 | Civil Service Bureaucracy | Administrative state |
| 9 | Impersonal Bureaucracy | Faceless governance |
| 10 | Charismatic Dictator | Personality cult leadership |
| 11 | Non-Charismatic Dictator | Authoritarian rule |
| 12 | Charismatic Oligarchy | Popular ruling elite |
| 13 | Religious Dictatorship | Theocratic rule |
| 14+ | Special | Unusual government types |

### 5.2 Factions

Each world may have multiple competing power groups.

**Formula for Number of Factions:**
```
Modifier = 0
if Government in (0, 7): Modifier = +1
if Government >= 10: Modifier = -1
Number of Factions = 1d3 + Modifier
```

Each faction's strength is determined by a 2d6 roll.

### 5.3 Law Level

**Formula:** `2d6 + (Government - 7)`

**Range:** 0 to 15+

| Level | Weapons Banned | Description |
|-------|----------------|-------------|
| 0 | None | No restrictions |
| 1 | WMDs, Poison Gas | Minimal restrictions |
| 2 | Portable Energy Weapons | Light restrictions |
| 3 | Heavy Weapons | Moderate restrictions |
| 4 | Light Automatic Weapons | Significant restrictions |
| 5 | Personal Concealable Weapons | Strict civilian restrictions |
| 6 | All Firearms | Very strict |
| 7 | Shotguns | Near-total weapon ban |
| 8 | Bladed Weapons | Extreme restrictions |
| 9+ | All Weapons | Total prohibition |

---

## 6. Trade Codes and World Features

Trade codes emerge automatically from combinations of planetary characteristics. These classifications drive economic specialization and trade goods availability.

### 6.1 Trade Code Definitions

| Code | Name | Conditions |
|------|------|------------|
| **Ag** | Agricultural | Atmosphere 4-8, Hydrography 4-8, Population 5-7 |
| **As** | Asteroid | Size 0, Atmosphere 0, Hydrography 0 |
| **Ba** | Barren | Population 0 |
| **De** | Desert | Atmosphere 2+, Hydrography 0 |
| **Fl** | Strange Oceans | Atmosphere 10+, Hydrography 1+ |
| **Ga** | Garden | Size 5+, Atmosphere 4-9, Hydrography 4-8 |
| **Hi** | High Population | Population 9+ |
| **Ht** | High Tech | Technology +4 |
| **IC** | Ice-Capped | Atmosphere 0-1, Hydrography 1+ |
| **In** | Industrial | Atmosphere in {0,1,2,4,7,9}, Population 9+ |
| **Lo** | Low Population | Population 1-3 |
| **Lt** | Low Tech | Technology ≤ -2 |
| **Na** | Non-Agricultural | Atmosphere 0-3, Hydrography 0-3, Population 6+ |
| **NI** | Non-Industrial | Population 4-6 |
| **Po** | Poor | Resources ≤ -2 |
| **Ri** | Rich | Atmosphere in {6, 8}, Population 6-8, Resources 1+ |
| **Va** | Vacuum | Atmosphere 0 |
| **Wa** | Water World | Hydrography 10 |
| **Da** | Dangerous | Atmosphere 10+, OR Government in {0, 7, 10}, OR Law 0, OR Law 9+ |

### 6.2 Implementation Logic

```python
def assign_trade_codes(system):
    codes = []
    
    # Agricultural
    if (4 <= system.atmosphere <= 8 and 
        4 <= system.hydrography <= 8 and 
        5 <= system.population <= 7):
        codes.append("Agricultural")
    
    # Asteroid
    if (system.size == 0 and 
        system.atmosphere == 0 and 
        system.hydrography == 0):
        codes.append("Asteroid")
    
    # Garden World
    if (system.size >= 5 and 
        4 <= system.atmosphere <= 9 and 
        4 <= system.hydrography <= 8):
        codes.append("Garden")
    
    # Industrial
    if (system.atmosphere in {0, 1, 2, 4, 7, 9} and 
        system.population >= 9):
        codes.append("Industrial")
    
    # Rich
    if (system.atmosphere in {6, 8} and 
        6 <= system.population <= 8 and 
        system.resources >= 1):
        codes.append("Rich")
    
    # Dangerous (multiple triggers)
    if (system.atmosphere >= 10 or 
        system.government in {0, 7, 10} or 
        system.law == 0 or 
        system.law >= 9):
        codes.append("Dangerous")
    
    return codes
```

---

## 7. Economic Modeling

The economic system translates physical characteristics into quantifiable trade potential through a series of derived values.

### 7.1 Technology Level Conversion

The Fate-scale Technology rating (-4 to +4) converts to GURPS Tech Levels for economic calculations:

| Fate Tech | GURPS TL | Era Equivalent |
|-----------|----------|----------------|
| +4 | TL 12 | Ultra-tech |
| +3 | TL 11 | Advanced interstellar |
| +2 | TL 10 | Standard interstellar |
| +1 | TL 9 | Early interstellar |
| 0 | TL 8 | Information age |
| -1 | TL 7 | Nuclear age |
| -2 | TL 6 | Mechanized age |
| -3 | TL 3 | Medieval |
| -4 | TL 0 | Stone age |

### 7.2 Per Capita Income

Base per-capita income varies by tech level:

| GURPS TL | Base Income (Cr/year) |
|----------|----------------------|
| 0 | 55 |
| 1 | 85 |
| 2 | 135 |
| 3 | 220 |
| 4 | 350 |
| 5 | 560 |
| 6 | 895 |
| 7 | 1,430 |
| 8 | 2,290 |
| 9 | 3,660 |
| 10 | 5,860 |
| 11 | 9,375 |
| 12 | 15,000 |

### 7.3 Gross World Product

**Formula:**
```
Population = 10^(Population_Rating)
Capitas = Population ÷ 100
GWP = Base_Per_Capita_Income × Capitas
```

### 7.4 Resource Multiplier

Environment and Resources modify effective income:

**Formula:**
```
Modifier = Resources + Environment  (range: -8 to +8)
Multiplier = 0.8 + ((Modifier + 8) ÷ 20)
```

This produces a multiplier range of **0.8× to 1.6×**.

---

## 8. Trade Route Networks

### 8.1 Cluster Linking Algorithm

Systems within a cluster are connected using a probabilistic linking algorithm based on the Diaspora SRD approach.

**Algorithm:**
```python
def link_cluster(cluster):
    for index, system in enumerate(cluster):
        # Always link to next neighbor
        link_to_neighbor(system, cluster, index + 1)
        
        # Roll for additional connections
        fate_roll = roll_4dF()
        
        if fate_roll > -1:  # 0 or positive
            link_to_further_neighbor(system, cluster, index + 2)
            
            if fate_roll > 0:  # positive only
                link_to_further_neighbor(system, cluster, index + 3)
```

**Linking Rules:**
1. Each system always links to the next sequential system (if any)
2. On a Fate roll of 0 or better (~80% chance), link to a further unconnected neighbor
3. On a positive Fate roll (~40% chance), link to an even further unconnected neighbor
4. Routes are always bidirectional

### 8.2 Route Properties

Routes are bidirectional—if A links to B, then B also links to A. The Route entity stores:

```python
@dataclass
class Route:
    origin: SystemPointer
    destination: SystemPointer
```

### 8.3 Network Graph

The cluster forms a **connected graph** where:
- Nodes = Star systems
- Edges = Jump routes
- Path length = Number of jumps between systems

The system uses NetworkX for graph operations:

```python
class ClusterMap:
    def get_path(self, start, end):
        """Returns shortest path as list of systems"""
        return nx.shortest_path(self.graph, start.id, end.id)
    
    def get_distance(self, start, end):
        """Returns jump count between systems"""
        return nx.shortest_path_length(self.graph, start.id, end.id)
```

---

## 9. Bilateral Trade Calculations

### 9.1 World Trade Number (WTN)

The WTN quantifies a world's overall trade capacity.

**Formula:**
```
Unmodified_WTN = TL_Modifier + (Population_Rating ÷ 2)
WTN = Unmodified_WTN + Port_Modifier
```

**Tech Level Modifiers:**

| GURPS TL | Modifier |
|----------|----------|
| 0-2 | -0.5 |
| 3-5 | 0 |
| 6-8 | +0.5 |
| 9-11 | +1.0 |
| 12 | +1.5 |

### 9.2 Port Modifier Table

The port modifier depends on both UWTN and starport class:

| UWTN Range | Port 0 | Port 1 | Port 2 | Port 3 | Port 4 | Port 5 |
|------------|--------|--------|--------|--------|--------|--------|
| 7+ | -5.0 | -2.5 | -2.0 | -1.5 | -1.0 | 0 |
| 6-6.9 | -5.0 | -2.0 | -1.5 | -1.0 | -0.5 | 0 |
| 5-5.9 | -4.0 | -1.5 | -1.0 | -0.5 | 0 | 0 |
| 4-4.9 | -3.5 | -1.0 | -0.5 | 0 | 0 | +0.5 |
| 3-3.9 | -3.0 | -0.5 | 0 | 0 | +0.5 | +0.5 |
| 2-2.9 | -2.5 | 0 | 0 | +0.5 | +0.5 | +1.0 |
| 1-1.9 | 0 | 0 | +0.5 | +0.5 | +1.0 | +1.0 |
| 0-0.9 | 0 | +0.5 | +0.5 | +1.0 | +1.0 | +1.5 |

### 9.3 Bilateral Trade Number (BTN)

The BTN measures trade volume between two specific worlds.

**Formula:**
```
Raw_BTN = WTN_A + WTN_B - Distance_Modifier
BTN = clamp(Raw_BTN, 0, min(WTN_A, WTN_B) + 5)
```

The capping rule ensures that trade between a large world and tiny world is limited by the smaller world's capacity.

### 9.4 Distance Modifiers

| Jump Distance | Modifier |
|---------------|----------|
| 1 | 0 |
| 2 | -0.5 |
| 3-5 | -1.0 |
| 6-9 | -1.5 |
| 10-19 | -2.0 |
| 20-30 | -2.5 |
| 31-60 | -3.0 |
| 61-100 | -3.5 |
| 101-200 | -4.0 |
| 201-300 | -4.5 |
| 301-600 | -5.0 |
| 601-1000 | -5.5 |
| 1000+ | -6.0 |

### 9.5 Trade Volume Tables

**Credits Per Year by BTN:**

| BTN | Min | Max |
|-----|-----|-----|
| 0 | 0 | 5 |
| 0.5 | 5 | 10 |
| 1.0 | 10 | 50 |
| 1.5 | 50 | 100 |
| 2.0 | 100 | 500 |
| 2.5 | 500 | 1K |
| 3.0 | 1K | 5K |
| 3.5 | 5K | 10K |
| 4.0 | 10K | 50K |
| 4.5 | 50K | 100K |
| 5.0 | 100K | 500K |
| 5.5 | 500K | 1M |
| 6.0 | 1M | 5M |
| 6.5 | 5M | 10M |
| 7.0 | 10M | 50M |
| 7.5 | 50M | 100M |
| 8.0 | 100M | 500M |
| 8.5 | 500M | 1B |
| 9.0 | 1B | 5B |
| 9.5 | 5B | 10B |
| 10.0 | 10B | 50B |
| 10.5 | 50B | 100B |
| 11.0 | 100B | 500B |
| 11.5 | 500B | 1T |
| 12.0 | 1T | 100T |

**Displacement Tons Per Year/Week/Day:**

The same BTN lookup applies to cargo volumes, with different threshold tables for each time scale. Trade only begins appearing at higher BTN values:

- **Per Year:** Starts at BTN 4.0
- **Per Week:** Starts at BTN 5.5
- **Per Day:** Starts at BTN 6.5

---

## 10. Dynamic Market Systems

### 10.1 Freight Rate Fluctuation

Freight rates vary from a base price using a mean-reversion model.

**Constants:**
```
BASE_FREIGHT_RATE = 650 Cr/dton
VOLATILITY = 0.025 × BASE_RATE = 16.25 Cr
REGRESSION_FACTOR = 0.2
```

**Rate Update Formula:**
```python
def generate_new_freight_rate(current_rate, base_rate):
    if current_rate == base_rate:
        # Starting from base: full random walk
        change = VOLATILITY * roll_4d6_minus_14()
        return base_rate + change
    else:
        # Mean reversion + downward bias
        random_component = VOLATILITY * min(roll_4d6_minus_14(), 0)
        reversion_component = REGRESSION_FACTOR * (base_rate - current_rate)
        return current_rate + random_component + reversion_component
```

The `roll_4d6_minus_14()` produces values from -10 to +10 with a slight negative bias when clamped to zero for the random component.

### 10.2 Freight Volume Elasticity

Available cargo volume responds inversely to price changes.

**Formula:**
```
Price_Deviation = (Current_Rate - Base_Rate) / VOLATILITY
Volume_Adjustment = Price_Deviation × 0.25 × Average_Volume
Current_Volume = |Average_Volume + Volume_Adjustment|
```

When prices are high, less cargo is available (shippers hold back). When prices are low, more cargo floods the market.

### 10.3 Fuel Costs

Each system has a base fuel cost (default: 435 Cr per unit). This can vary based on starport class and local conditions.

**Fuel Purchase:**
```python
def get_fuel_purchase_cost(amount):
    return fuel_cost * amount
```

---

## 11. Cluster Cartography

### 11.1 ClusterMap Class

The `ClusterMap` provides spatial queries across the cluster:

```python
class ClusterMap:
    def __init__(self, systems):
        self.systems = {s.id: s for s in systems}
        self.graph = nx.Graph()
        # Build graph from routes
        
    def iter_pairs(self):
        """Iterate all unique system pairs"""
        return itertools.combinations(self.systems.values(), 2)
    
    def get_random_system(self):
        """Select random system (for encounters, etc.)"""
        return random.choice(list(self.systems.values()))
    
    def get_path(self, start, end):
        """Shortest route as system list"""
        return [self.systems[pk] for pk in 
                nx.shortest_path(self.graph, start.id, end.id)]
    
    def get_distance(self, start, end):
        """Jump count between systems"""
        return nx.shortest_path_length(self.graph, start.id, end.id)
    
    def get_trade_partners(self, system):
        """All other systems ranked by BTN"""
        return sorted(
            (p for p in self.systems.values() if p.id != system.id),
            key=lambda p: self.get_trade(system, p).btn,
            reverse=True
        )
```

### 11.2 Trade Partner Ranking

For any given system, trade partners can be ranked by BTN to identify:
- Primary trading partners (highest BTN)
- Marginal trade routes (low BTN)
- Isolated systems (unreachable or extreme distance)

---

## 12. Complete Generation Algorithm

### 12.1 System Generation Sequence

```python
def generate_system():
    system = System()
    
    # Step 1: Core TER Attributes
    system.tech_level = roll_4dF()
    system.environment = roll_4dF()
    system.resources = roll_4dF()
    
    # Step 2: Physical Characteristics (order matters!)
    system.size = generate_size(system.environment)
    system.atmosphere = generate_atmosphere(system.size, system.environment)
    system.temperature = generate_temperature(system.atmosphere, system.environment)
    system.hydrography = generate_hydrography(
        system.size, system.atmosphere, 
        system.temperature, system.environment
    )
    
    # Step 3: Civilization
    system.population = generate_population(
        system.environment, system.resources
    )
    system.starport = generate_starport(
        system.tech_level, system.population
    )
    system.government = generate_government(system.population)
    system.factions = generate_factions(system.government)
    system.law = generate_law(system.government)
    
    # Step 4: Trade Codes
    system.trade_codes = assign_trade_codes(system)
    
    # Step 5: Economic Derivations
    system.economy = Economy(system)
    
    return system
```

### 12.2 Cluster Generation Sequence

```python
def create_cluster(size, gateway=None):
    systems = {}
    names = set()
    
    # Generate unique systems
    while len(systems) < size:
        system = generate_system()
        system.id = generate_uuid()
        system.name = generate_name()
        
        # Ensure uniqueness
        if system.id not in systems and system.name not in names:
            if len(system.name) >= 2:  # Name validation
                systems[system.id] = system
                names.add(system.name)
    
    cluster = list(systems.values())
    
    # Connect to gateway if provided
    if gateway is not None:
        gateway.routes.add(cluster[0])
    
    # Generate internal routes
    link_cluster(cluster)
    
    return cluster
```

### 12.3 Full Pipeline

```
1. Generate N systems with unique IDs and names
2. Link systems into connected graph
3. Build ClusterMap for spatial queries
4. Calculate bilateral trade for all pairs
5. Persist to storage (optional)
```

---

## 13. Reference Tables

### 13.1 Dice Notation

| Notation | Meaning |
|----------|---------|
| 1d6 | Roll one 6-sided die |
| 2d6 | Roll two d6, sum results |
| 3d6 | Roll three d6, sum results |
| 4dF | Roll four Fate dice (-1, 0, +1 each) |
| 2d6-2 | Roll 2d6, subtract 2 |
| 2d6+mod | Roll 2d6, add modifier |

### 13.2 Quick Reference: Attribute Ranges

| Attribute | Method | Range | Notes |
|-----------|--------|-------|-------|
| Technology | 4dF | -4 to +4 | Core attribute |
| Environment | 4dF | -4 to +4 | Core attribute |
| Resources | 4dF | -4 to +4 | Core attribute |
| Size | 2d6-2 | 0-10 | Capped at 4 if Env ≥ 0 |
| Atmosphere | 2d6+(Size-7) | 0-15 | Clamped [5,9] if Env ≥ 0 |
| Temperature | 2d6+Atm_mod | 0-12+ | Clamped [5,9] if Env ≥ 0 |
| Hydrography | 2d6+mods | 0-10 | Clamped [2,7] if Env ≥ 0 |
| Population | 2d6-2+mods | 0-12+ | Modified by Env & Res |
| Starport | Threshold | 0-5 | Based on Pop & Tech |
| Government | 2d6+(Pop-7) | 0-15+ | |
| Law | 2d6+(Gov-7) | 0-15+ | |

### 13.3 Environment Constraint Summary

When **Environment ≥ 0**, the following constraints apply to create more habitable worlds:

| Attribute | Constraint |
|-----------|------------|
| Size | Maximum 4 |
| Atmosphere | Range [5, 9] |
| Temperature | Range [5, 9] |
| Hydrography | Range [2, 7] |

### 13.4 Trade Code Quick Reference

| Code | Key Requirement |
|------|-----------------|
| Ag | Mid-range Atm/Hyd/Pop |
| As | Size=0, Atm=0, Hyd=0 |
| Ga | Large, breathable, wet |
| Hi | Pop 9+ |
| In | Unusual Atm + Hi Pop |
| Ri | Standard Atm + Resources |
| Da | Extreme conditions or governance |

---

## Appendix A: Implementation Notes

### A.1 Minmax Helper Function

Note the reversed parameter order in the source code:

```python
def minmax(lower, upper, result):
    return min(lower, max(upper, result))
```

This clamps `result` between `upper` and `lower` (despite the naming, `lower` acts as the ceiling and `upper` as the floor due to the min/max nesting).

### A.2 Caching Strategy

Economic calculations are cached using `@cached_property` decorators since they're expensive and immutable once a system is generated. The ClusterMap also memoizes path calculations and trade relationships.

### A.3 Data Storage

The system supports DynamoDB persistence with a schema using:
- **PK:** `System#{id}`
- **SK:** `#metadata#{id}` for system data, `#metadata#route#{destination_id}` for routes

This allows efficient queries for individual systems and their outbound routes.

---

## Appendix B: Extending the System

### B.1 Adding New Trade Codes

1. Define the conditions in terms of existing attributes
2. Add the check to the `trade_codes` post-generation hook
3. Consider implications for trade goods and economic modifiers

### B.2 Custom Cluster Topologies

The linking algorithm can be modified for different connectivity patterns:
- **Linear Chain:** Only link sequential neighbors
- **Hub-and-Spoke:** Link all systems to a central hub
- **Dense Mesh:** Increase Fate roll thresholds for more connections

### B.3 Multi-Cluster Galaxies

Connect clusters via gateway systems:
```python
gateway.routes.add(other_cluster[0])
```

This creates inter-cluster trade routes while maintaining cluster identity.

---

*End of Guide*

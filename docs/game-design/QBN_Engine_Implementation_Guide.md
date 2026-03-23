# Implementing a Custom Quality-Based Narrative Engine

## A Comprehensive Guide Using the Three-Engine Architecture

---

## Introduction

Quality-Based Narrative (QBN) represents a paradigm shift in interactive storytelling. Rather than authoring stories as branching flowcharts where each choice leads to a predetermined next scene, QBN treats narrative as a collection of **storylets**—self-contained content chunks—that become available based on the player's accumulated **qualities** (state variables). The result is a dynamic, modular narrative system where story emerges from state rather than explicit links.

This guide provides a comprehensive blueprint for implementing a custom QBN engine from scratch. Following Bruno Dias' architectural insight, we divide the system into three cooperating engines:

1. **The Narrative Engine** — Decides *which* storylet to present based on game state
2. **The Text Engine** — Assembles and formats *what* the player reads
3. **The UI Engine** — Handles *how* content is presented and how player input is captured

This separation of concerns allows each component to be developed, tested, and potentially replaced independently. A well-designed narrative engine can work with different text engines (from simple string templates to sophisticated NLG systems), and either can be paired with various UI implementations (web, mobile, game engine integration).

---

## Part I: Foundational Concepts

### What Makes QBN Different

In traditional branching narrative, scenes connect via explicit links:

```
Scene A → [Choice 1] → Scene B
        → [Choice 2] → Scene C
```

In QBN, scenes (storylets) float freely, connected only by state conditions:

```
Storylet A: requires nothing, sets HasMap = true
Storylet B: requires HasMap = true, sets ExploredCave = true  
Storylet C: requires ExploredCave = true AND Perception >= 5
```

The player might experience A → B → C, or they might do other storylets between them. The sequence emerges from how qualities change, not from hard-coded links.

### Core Terminology

| Term | Definition |
|------|------------|
| **Quality** | A named variable representing any aspect of game state—skills, resources, flags, relationships, progress counters |
| **Storylet** | An atomic unit of narrative content with prerequisites (conditions for availability) and effects (state changes upon completion) |
| **Prerequisites** | Conditions that must be true for a storylet to be available (e.g., `Location == "Tavern" AND Gold >= 10`) |
| **Effects** | State modifications that occur when a storylet completes (e.g., `Gold -= 10, HasRumor = true`) |
| **Branch** | A choice within a storylet (Failbetter terminology); each branch may have its own prerequisites and effects |
| **Deck** | A filtered pool of available storylets, possibly with random selection mechanics |

### The Uniform Quality Principle

A key insight from Failbetter's design: treat all state uniformly. Whether tracking a character's Perception skill, their gold count, a story flag like `HasMetTheQueen`, or a relationship value like `TrustWithMerchant`—they're all just qualities with names and values. This uniformity means:

- Any storylet can check any quality as a prerequisite
- Any storylet can modify any quality as an effect
- The engine needs only one mechanism for state management
- Writers think in terms of one consistent system

---

## Part II: The Narrative Engine

The Narrative Engine is the core of a QBN system. Its job is to answer the question: **"Given the current state, which storylets are available?"**

### 2.1 Data Model

#### Quality State

The simplest representation is a key-value store:

```javascript
// Quality state as a simple object/map
const qualities = {
  // Character attributes
  Perception: 5,
  Dangerous: 3,
  
  // Resources
  Gold: 47,
  Rations: 12,
  
  // Story flags (using 0/1 or boolean)
  HasMap: 1,
  MetTheQueen: 0,
  
  // Progress counters
  MainQuest_Progress: 2,
  Investigation_Progress: 0,
  
  // Relationships (-100 to 100 scale, or whatever fits)
  Trust_Merchant: 25,
  
  // Location/context
  CurrentLocation: "Tavern",
  TimeOfDay: "Night"
};
```

Design considerations for quality values:

- **Numeric qualities** work well for stats, resources, and progress counters
- **String qualities** can represent locations, faction allegiances, or enumerated states
- **Boolean-as-integer** (0/1) keeps the system uniform while supporting flag-style qualities
- Consider whether qualities can go negative (debt? negative reputation?)
- Define sensible defaults for unset qualities (typically 0 or empty string)

#### Storylet Definition

Each storylet needs:

```javascript
const storylet = {
  id: "mysterious_stranger",
  
  // Content (or reference to content in text engine)
  title: "A Mysterious Stranger",
  content: "A hooded figure beckons from the corner...",
  
  // Prerequisites - conditions for availability
  prerequisites: [
    { quality: "CurrentLocation", op: "==", value: "Tavern" },
    { quality: "TimeOfDay", op: "==", value: "Night" },
    { quality: "Suspicion", op: "<", value: 5 }
  ],
  
  // Branches (choices within the storylet)
  branches: [
    {
      id: "approach",
      text: "Approach the stranger",
      prerequisites: [], // always available if storylet is
      effects: [
        { quality: "HasMap", op: "set", value: 1 },
        { quality: "Suspicion", op: "add", value: 1 }
      ],
      outcome: "The stranger slides a worn map across the table..."
    },
    {
      id: "ignore",
      text: "Ignore them and finish your drink",
      prerequisites: [],
      effects: [],
      outcome: "You turn away. Some secrets are better left buried."
    },
    {
      id: "report",
      text: "Report the suspicious figure to the guard",
      prerequisites: [
        { quality: "Trust_CityGuard", op: ">=", value: 10 }
      ],
      effects: [
        { quality: "Trust_CityGuard", op: "add", value: 5 },
        { quality: "MysteriousStranger_Arrested", op: "set", value: 1 }
      ],
      outcome: "The guards thank you for your vigilance..."
    }
  ],
  
  // Metadata
  tags: ["side_content", "location:tavern", "mood:mysterious"],
  
  // Repeatability
  repeatable: false,  // or: "always", "daily", "weekly"
  
  // Priority/weight for selection algorithms
  priority: 1,
  weight: 100
};
```

### 2.2 Prerequisite Evaluation

The prerequisite evaluator is the heart of storylet selection:

```javascript
class PrerequisiteEvaluator {
  constructor(qualities) {
    this.qualities = qualities;
  }
  
  // Get quality value, with default for missing qualities
  getQuality(name, defaultValue = 0) {
    return this.qualities[name] ?? defaultValue;
  }
  
  // Evaluate a single condition
  evaluateCondition(condition) {
    const currentValue = this.getQuality(condition.quality);
    const targetValue = condition.value;
    
    switch (condition.op) {
      case "==": return currentValue === targetValue;
      case "!=": return currentValue !== targetValue;
      case ">":  return currentValue > targetValue;
      case ">=": return currentValue >= targetValue;
      case "<":  return currentValue < targetValue;
      case "<=": return currentValue <= targetValue;
      case "has": return currentValue > 0;  // quality exists and is positive
      case "!has": return currentValue <= 0;
      default:
        console.warn(`Unknown operator: ${condition.op}`);
        return false;
    }
  }
  
  // Evaluate all prerequisites (AND logic by default)
  evaluatePrerequisites(prerequisites) {
    if (!prerequisites || prerequisites.length === 0) {
      return true;
    }
    return prerequisites.every(cond => this.evaluateCondition(cond));
  }
}
```

**Advanced prerequisite patterns:**

For more complex logic (OR conditions, nested logic), consider a recursive expression evaluator:

```javascript
// Example: (Location == "Tavern" OR Location == "Inn") AND Gold >= 10
const complexPrereq = {
  op: "AND",
  conditions: [
    {
      op: "OR",
      conditions: [
        { quality: "Location", op: "==", value: "Tavern" },
        { quality: "Location", op: "==", value: "Inn" }
      ]
    },
    { quality: "Gold", op: ">=", value: 10 }
  ]
};
```

### 2.3 Storylet Selection

With prerequisite evaluation in place, storylet selection becomes:

```javascript
class NarrativeEngine {
  constructor(storyletDatabase, qualities) {
    this.storylets = storyletDatabase;
    this.qualities = qualities;
    this.evaluator = new PrerequisiteEvaluator(qualities);
    this.playedStorylets = new Set();  // Track non-repeatable storylets
  }
  
  // Get all currently available storylets
  getAvailableStorylets() {
    return this.storylets.filter(storylet => {
      // Check if already played (for non-repeatable)
      if (!storylet.repeatable && this.playedStorylets.has(storylet.id)) {
        return false;
      }
      
      // Check prerequisites
      return this.evaluator.evaluatePrerequisites(storylet.prerequisites);
    });
  }
  
  // Get available storylets filtered by tag
  getAvailableByTag(tag) {
    return this.getAvailableStorylets()
      .filter(s => s.tags && s.tags.includes(tag));
  }
  
  // Get available storylets for current location
  getAvailableForLocation() {
    const location = this.qualities.CurrentLocation;
    return this.getAvailableStorylets()
      .filter(s => {
        // Check if storylet has location requirement matching current
        const locReq = s.prerequisites?.find(p => p.quality === "CurrentLocation");
        return !locReq || locReq.value === location;
      });
  }
  
  // Mark a storylet as played
  markPlayed(storyletId) {
    this.playedStorylets.add(storyletId);
  }
  
  // Get available branches within a storylet
  getAvailableBranches(storylet) {
    return storylet.branches.filter(branch => 
      this.evaluator.evaluatePrerequisites(branch.prerequisites)
    );
  }
}
```

### 2.4 Selection Strategies

Different games need different ways to surface available storylets:

#### Strategy 1: Full List (Player Choice)

Present all available storylets and let the player choose:

```javascript
function presentAllAvailable(engine) {
  const available = engine.getAvailableStorylets();
  // Sort by priority, then alphabetically
  available.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return a.title.localeCompare(b.title);
  });
  return available;
}
```

#### Strategy 2: Opportunity Deck (Random Draw)

Randomly select from available storylets, simulating card draws:

```javascript
function drawFromDeck(engine, count = 3) {
  const available = engine.getAvailableStorylets();
  const hand = [];
  const pool = [...available];  // Copy to avoid mutation
  
  for (let i = 0; i < count && pool.length > 0; i++) {
    // Weighted random selection
    const totalWeight = pool.reduce((sum, s) => sum + (s.weight || 100), 0);
    let random = Math.random() * totalWeight;
    
    for (let j = 0; j < pool.length; j++) {
      random -= (pool[j].weight || 100);
      if (random <= 0) {
        hand.push(pool[j]);
        pool.splice(j, 1);
        break;
      }
    }
  }
  
  return hand;
}
```

#### Strategy 3: Priority Queue (Drama Manager)

Select the highest-priority available storylet, useful for ensuring critical story beats happen:

```javascript
function selectHighestPriority(engine) {
  const available = engine.getAvailableStorylets();
  if (available.length === 0) return null;
  
  return available.reduce((best, current) => 
    (current.priority > best.priority) ? current : best
  );
}
```

#### Strategy 4: Salience-Based Selection

Choose storylets based on relevance to recent events:

```javascript
function selectBySalience(engine, recentQualities) {
  const available = engine.getAvailableStorylets();
  
  // Score each storylet by how many of its prerequisites
  // involve recently-changed qualities
  const scored = available.map(storylet => {
    let salience = storylet.priority || 1;
    
    for (const prereq of (storylet.prerequisites || [])) {
      if (recentQualities.includes(prereq.quality)) {
        salience += 10;  // Boost for relevance
      }
    }
    
    return { storylet, salience };
  });
  
  scored.sort((a, b) => b.salience - a.salience);
  return scored[0]?.storylet || null;
}
```

### 2.5 Effect Application

When a player completes a storylet branch, apply its effects:

```javascript
class EffectProcessor {
  constructor(qualities) {
    this.qualities = qualities;
  }
  
  applyEffects(effects) {
    const changes = [];  // Track what changed for UI feedback
    
    for (const effect of effects) {
      const oldValue = this.qualities[effect.quality] ?? 0;
      let newValue;
      
      switch (effect.op) {
        case "set":
          newValue = effect.value;
          break;
        case "add":
          newValue = oldValue + effect.value;
          break;
        case "subtract":
          newValue = oldValue - effect.value;
          break;
        case "multiply":
          newValue = oldValue * effect.value;
          break;
        case "random":
          // Random between min and max
          newValue = effect.min + Math.floor(
            Math.random() * (effect.max - effect.min + 1)
          );
          break;
        case "clamp":
          // Set value but clamp to range
          newValue = Math.max(effect.min, Math.min(effect.max, effect.value));
          break;
        default:
          console.warn(`Unknown effect operation: ${effect.op}`);
          continue;
      }
      
      this.qualities[effect.quality] = newValue;
      changes.push({
        quality: effect.quality,
        oldValue,
        newValue,
        delta: newValue - oldValue
      });
    }
    
    return changes;
  }
}
```

### 2.6 Handling Repeatability

Storylets can have different repeatability rules:

```javascript
class RepeatabilityManager {
  constructor() {
    this.playHistory = new Map();  // storyletId -> { count, lastPlayed }
  }
  
  canPlay(storylet) {
    const history = this.playHistory.get(storylet.id);
    
    if (!history) return true;  // Never played
    
    switch (storylet.repeatable) {
      case true:
      case "always":
        return true;
        
      case false:
      case "never":
        return false;
        
      case "daily":
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return history.lastPlayed < oneDayAgo;
        
      case "weekly":
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return history.lastPlayed < oneWeekAgo;
        
      default:
        // Numeric: maximum play count
        if (typeof storylet.repeatable === "number") {
          return history.count < storylet.repeatable;
        }
        return false;
    }
  }
  
  recordPlay(storyletId) {
    const existing = this.playHistory.get(storyletId) || { count: 0 };
    this.playHistory.set(storyletId, {
      count: existing.count + 1,
      lastPlayed: Date.now()
    });
  }
}
```

---

## Part III: The Text Engine

The Text Engine transforms storylet data into readable text. It handles template expansion, conditional text, and formatting.

### 3.1 Basic Template Expansion

At minimum, support quality value insertion:

```javascript
class TextEngine {
  constructor(qualities) {
    this.qualities = qualities;
  }
  
  // Expand {QualityName} placeholders
  expandTemplate(template) {
    return template.replace(/\{(\w+)\}/g, (match, qualityName) => {
      const value = this.qualities[qualityName];
      return value !== undefined ? String(value) : match;
    });
  }
}
```

### 3.2 Conditional Text

More sophisticated text engines support conditional blocks:

```javascript
class ConditionalTextEngine {
  constructor(qualities) {
    this.qualities = qualities;
  }
  
  // Process [if Quality > 5]text[/if] blocks
  processConditionals(text) {
    // Pattern: [if Quality op Value]content[/if]
    const pattern = /\[if\s+(\w+)\s*(==|!=|>|>=|<|<=)\s*(\w+)\]([\s\S]*?)\[\/if\]/g;
    
    return text.replace(pattern, (match, quality, op, value, content) => {
      const qualityValue = this.qualities[quality] ?? 0;
      let targetValue = isNaN(value) ? value : Number(value);
      
      let condition = false;
      switch (op) {
        case "==": condition = qualityValue == targetValue; break;
        case "!=": condition = qualityValue != targetValue; break;
        case ">":  condition = qualityValue > targetValue; break;
        case ">=": condition = qualityValue >= targetValue; break;
        case "<":  condition = qualityValue < targetValue; break;
        case "<=": condition = qualityValue <= targetValue; break;
      }
      
      return condition ? content : "";
    });
  }
  
  // Process [either]option1[or]option2[/either] (picks randomly)
  processEither(text) {
    const pattern = /\[either\]([\s\S]*?)\[\/either\]/g;
    
    return text.replace(pattern, (match, content) => {
      const options = content.split(/\[or\]/);
      return options[Math.floor(Math.random() * options.length)].trim();
    });
  }
  
  // Full processing pipeline
  process(text) {
    let result = text;
    result = this.processConditionals(result);
    result = this.processEither(result);
    result = this.expandTemplate(result);
    return result;
  }
}
```

### 3.3 Pronoun and Grammar Handling

For character-driven narratives, handle pronouns dynamically:

```javascript
class PronounEngine {
  constructor(qualities) {
    this.qualities = qualities;
    
    this.pronounSets = {
      male: { they: "he", them: "him", their: "his", theirs: "his", themself: "himself" },
      female: { they: "she", them: "her", their: "her", theirs: "hers", themself: "herself" },
      neutral: { they: "they", them: "them", their: "their", theirs: "theirs", themself: "themself" }
    };
  }
  
  // Expand [they], [them], [their], etc. based on Gender quality
  expandPronouns(text, genderQuality = "Gender") {
    const gender = this.qualities[genderQuality] || "neutral";
    const pronouns = this.pronounSets[gender] || this.pronounSets.neutral;
    
    let result = text;
    for (const [placeholder, pronoun] of Object.entries(pronouns)) {
      // Handle both [they] and [They] for capitalization
      result = result.replace(
        new RegExp(`\\[${placeholder}\\]`, "gi"),
        (match) => match[1] === match[1].toUpperCase() 
          ? pronoun.charAt(0).toUpperCase() + pronoun.slice(1)
          : pronoun
      );
    }
    
    return result;
  }
}
```

### 3.4 Quality Change Descriptions

Generate human-readable descriptions of state changes:

```javascript
class QualityDescriber {
  constructor() {
    // Define how to describe each quality
    this.descriptions = {
      Gold: {
        name: "Gold",
        icon: "💰",
        increaseVerb: "gained",
        decreaseVerb: "spent",
        unit: "coins"
      },
      Suspicion: {
        name: "Suspicion",
        icon: "👁️",
        increaseVerb: "attracted",
        decreaseVerb: "allayed",
        thresholds: {
          0: "You are beneath notice.",
          3: "Someone is watching.",
          7: "The authorities grow suspicious.",
          10: "You are being actively hunted!"
        }
      },
      // ... more qualities
    };
  }
  
  describeChange(quality, oldValue, newValue) {
    const desc = this.descriptions[quality];
    if (!desc) {
      return `${quality}: ${oldValue} → ${newValue}`;
    }
    
    const delta = newValue - oldValue;
    const verb = delta > 0 ? desc.increaseVerb : desc.decreaseVerb;
    
    let result = `${desc.icon || ""} You ${verb} ${Math.abs(delta)} ${desc.unit || desc.name}`;
    
    // Add threshold description if applicable
    if (desc.thresholds) {
      const threshold = Object.entries(desc.thresholds)
        .reverse()
        .find(([t, _]) => newValue >= Number(t));
      if (threshold) {
        result += `. ${threshold[1]}`;
      }
    }
    
    return result;
  }
}
```

---

## Part IV: The UI Engine

The UI Engine presents content to the player and captures their input. This layer is most dependent on your target platform.

### 4.1 Core UI Interface

Define an abstract interface that any UI implementation must fulfill:

```javascript
// Abstract UI interface
class UIEngine {
  // Display a storylet and its available branches
  async presentStorylet(storylet, availableBranches) {
    throw new Error("Not implemented");
  }
  
  // Get player's branch selection
  async getBranchSelection(branches) {
    throw new Error("Not implemented");
  }
  
  // Display the outcome of a branch
  async presentOutcome(outcome, qualityChanges) {
    throw new Error("Not implemented");
  }
  
  // Display available storylets for selection (list mode)
  async presentStoryletList(storylets) {
    throw new Error("Not implemented");
  }
  
  // Display the opportunity deck hand
  async presentDeck(hand, canDraw) {
    throw new Error("Not implemented");
  }
  
  // Show quality changes with descriptions
  async showQualityChanges(changes) {
    throw new Error("Not implemented");
  }
}
```

### 4.2 Web/HTML Implementation

A simple HTML-based UI:

```javascript
class WebUIEngine extends UIEngine {
  constructor(containerId) {
    super();
    this.container = document.getElementById(containerId);
  }
  
  async presentStorylet(storylet, availableBranches, textEngine) {
    const content = textEngine.process(storylet.content);
    
    let html = `
      <div class="storylet">
        <h2 class="storylet-title">${storylet.title}</h2>
        <div class="storylet-content">${content}</div>
        <div class="branches">
    `;
    
    for (const branch of availableBranches) {
      html += `
        <button class="branch-button" data-branch-id="${branch.id}">
          ${branch.text}
        </button>
      `;
    }
    
    html += `</div></div>`;
    this.container.innerHTML = html;
    
    // Return promise that resolves when player clicks a branch
    return new Promise(resolve => {
      this.container.querySelectorAll(".branch-button").forEach(btn => {
        btn.addEventListener("click", () => {
          resolve(btn.dataset.branchId);
        });
      });
    });
  }
  
  async presentOutcome(outcome, qualityChanges, textEngine, describer) {
    const content = textEngine.process(outcome);
    
    let html = `
      <div class="outcome">
        <div class="outcome-content">${content}</div>
        <div class="quality-changes">
    `;
    
    for (const change of qualityChanges) {
      const description = describer.describeChange(
        change.quality, change.oldValue, change.newValue
      );
      const changeClass = change.delta > 0 ? "increase" : "decrease";
      html += `<div class="quality-change ${changeClass}">${description}</div>`;
    }
    
    html += `
        </div>
        <button class="continue-button">Continue</button>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    return new Promise(resolve => {
      this.container.querySelector(".continue-button")
        .addEventListener("click", resolve);
    });
  }
  
  async presentStoryletList(storylets) {
    let html = `<div class="storylet-list"><h2>What would you like to do?</h2>`;
    
    for (const storylet of storylets) {
      html += `
        <div class="storylet-option" data-storylet-id="${storylet.id}">
          <h3>${storylet.title}</h3>
          ${storylet.teaser ? `<p>${storylet.teaser}</p>` : ""}
        </div>
      `;
    }
    
    html += `</div>`;
    this.container.innerHTML = html;
    
    return new Promise(resolve => {
      this.container.querySelectorAll(".storylet-option").forEach(el => {
        el.addEventListener("click", () => {
          resolve(el.dataset.storyletId);
        });
      });
    });
  }
}
```

### 4.3 Console/Terminal Implementation

For testing or text-based games:

```javascript
class ConsoleUIEngine extends UIEngine {
  constructor(readline) {
    super();
    this.rl = readline;  // Node.js readline interface
  }
  
  async presentStorylet(storylet, availableBranches, textEngine) {
    console.log("\n" + "=".repeat(50));
    console.log(storylet.title);
    console.log("=".repeat(50));
    console.log(textEngine.process(storylet.content));
    console.log("\nWhat do you do?\n");
    
    availableBranches.forEach((branch, i) => {
      console.log(`  ${i + 1}. ${branch.text}`);
    });
    
    const answer = await this.prompt("\nChoice: ");
    const index = parseInt(answer) - 1;
    
    if (index >= 0 && index < availableBranches.length) {
      return availableBranches[index].id;
    }
    
    console.log("Invalid choice, try again.");
    return this.presentStorylet(storylet, availableBranches, textEngine);
  }
  
  async prompt(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }
  
  async presentOutcome(outcome, qualityChanges, textEngine, describer) {
    console.log("\n" + textEngine.process(outcome));
    
    if (qualityChanges.length > 0) {
      console.log("\n--- Effects ---");
      for (const change of qualityChanges) {
        console.log(describer.describeChange(
          change.quality, change.oldValue, change.newValue
        ));
      }
    }
    
    await this.prompt("\nPress Enter to continue...");
  }
}
```

---

## Part V: Putting It All Together

### 5.1 The Game Loop

The main game loop orchestrates all three engines:

```javascript
class QBNGame {
  constructor(storyletDatabase, initialQualities) {
    this.qualities = { ...initialQualities };
    
    this.narrativeEngine = new NarrativeEngine(storyletDatabase, this.qualities);
    this.textEngine = new ConditionalTextEngine(this.qualities);
    this.effectProcessor = new EffectProcessor(this.qualities);
    this.qualityDescriber = new QualityDescriber();
    this.repeatabilityManager = new RepeatabilityManager();
    
    // UI engine set separately based on platform
    this.ui = null;
  }
  
  setUI(uiEngine) {
    this.ui = uiEngine;
  }
  
  async run() {
    while (true) {
      // 1. Get available storylets
      const available = this.narrativeEngine.getAvailableStorylets()
        .filter(s => this.repeatabilityManager.canPlay(s));
      
      if (available.length === 0) {
        await this.ui.showMessage("No more stories available. The End.");
        break;
      }
      
      // 2. Let player select a storylet (or use deck draw, etc.)
      const storyletId = await this.ui.presentStoryletList(available);
      const storylet = available.find(s => s.id === storyletId);
      
      // 3. Present the storylet and get available branches
      const availableBranches = this.narrativeEngine.getAvailableBranches(storylet);
      
      // 4. Present storylet and get player's branch choice
      const branchId = await this.ui.presentStorylet(
        storylet, 
        availableBranches, 
        this.textEngine
      );
      
      const branch = availableBranches.find(b => b.id === branchId);
      
      // 5. Apply effects
      const changes = this.effectProcessor.applyEffects(branch.effects || []);
      
      // 6. Present outcome
      await this.ui.presentOutcome(
        branch.outcome,
        changes,
        this.textEngine,
        this.qualityDescriber
      );
      
      // 7. Record play for repeatability
      this.repeatabilityManager.recordPlay(storylet.id);
      
      // 8. Check for game-ending conditions
      if (this.checkEndConditions()) {
        break;
      }
    }
  }
  
  checkEndConditions() {
    // Override in subclass or configure with conditions
    return this.qualities.GameOver === 1;
  }
}
```

### 5.2 Save/Load System

Persist game state:

```javascript
class SaveSystem {
  constructor(game) {
    this.game = game;
  }
  
  save(slot = "default") {
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      qualities: { ...this.game.qualities },
      playHistory: Array.from(
        this.game.repeatabilityManager.playHistory.entries()
      )
    };
    
    localStorage.setItem(`qbn_save_${slot}`, JSON.stringify(saveData));
  }
  
  load(slot = "default") {
    const json = localStorage.getItem(`qbn_save_${slot}`);
    if (!json) return false;
    
    const saveData = JSON.parse(json);
    
    // Restore qualities
    Object.assign(this.game.qualities, saveData.qualities);
    
    // Restore play history
    this.game.repeatabilityManager.playHistory = new Map(saveData.playHistory);
    
    return true;
  }
  
  listSaves() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("qbn_save_")) {
        const data = JSON.parse(localStorage.getItem(key));
        saves.push({
          slot: key.replace("qbn_save_", ""),
          timestamp: data.timestamp,
          version: data.version
        });
      }
    }
    return saves;
  }
}
```

---

## Part VI: Narrative Design Patterns

With the engine built, here are proven patterns for structuring content:

### 6.1 Linear Sequences (Gauntlets)

Enforce sequential progression with a progress quality:

```javascript
const gauntletStorylets = [
  {
    id: "heist_1_planning",
    title: "The Heist: Planning",
    prerequisites: [{ quality: "Heist_Progress", op: "==", value: 0 }],
    branches: [{
      id: "begin",
      text: "Begin planning the heist",
      effects: [{ quality: "Heist_Progress", op: "set", value: 1 }],
      outcome: "You gather your crew and begin laying out the plan..."
    }]
  },
  {
    id: "heist_2_reconnaissance",
    title: "The Heist: Reconnaissance",
    prerequisites: [{ quality: "Heist_Progress", op: "==", value: 1 }],
    branches: [{
      id: "scout",
      text: "Scout the location",
      effects: [{ quality: "Heist_Progress", op: "set", value: 2 }],
      outcome: "Under cover of darkness, you survey the target..."
    }]
  },
  // ... continues in sequence
];
```

### 6.2 Branch and Bottleneck

Allow divergent paths that reconverge:

```javascript
const branchingStorylets = [
  // The choice point
  {
    id: "alliance_choice",
    title: "Choose Your Alliance",
    prerequisites: [{ quality: "MainQuest", op: "==", value: 3 }],
    branches: [
      {
        id: "join_rebels",
        text: "Join the Rebellion",
        effects: [
          { quality: "Alliance", op: "set", value: "Rebels" },
          { quality: "MainQuest", op: "set", value: 4 }
        ]
      },
      {
        id: "join_empire",
        text: "Support the Empire",
        effects: [
          { quality: "Alliance", op: "set", value: "Empire" },
          { quality: "MainQuest", op: "set", value: 4 }
        ]
      }
    ]
  },
  
  // Rebel-specific content
  {
    id: "rebel_mission",
    prerequisites: [
      { quality: "MainQuest", op: "==", value: 4 },
      { quality: "Alliance", op: "==", value: "Rebels" }
    ],
    // ...
  },
  
  // Empire-specific content
  {
    id: "empire_mission",
    prerequisites: [
      { quality: "MainQuest", op: "==", value: 4 },
      { quality: "Alliance", op: "==", value: "Empire" }
    ],
    // ...
  },
  
  // Bottleneck: both paths lead here
  {
    id: "final_confrontation",
    title: "The Final Battle",
    prerequisites: [{ quality: "MainQuest", op: "==", value: 10 }],
    content: "[if Alliance == Rebels]Your rebel allies stand beside you.[/if][if Alliance == Empire]Imperial troops form ranks behind you.[/if] The enemy approaches..."
  }
];
```

### 6.3 Loop and Grow (Cyclical Narrative)

Structure content around repeating cycles with progression:

```javascript
const cyclicalStorylets = [
  // Monthly event that recurs
  {
    id: "market_day",
    title: "Market Day",
    prerequisites: [{ quality: "DayOfMonth", op: "==", value: 1 }],
    repeatable: true,
    content: "[if Year == 1]The market is bustling—you're still learning the vendors' faces.[/if][if Year >= 2]The familiar market stalls welcome you back.[/if]",
    branches: [
      {
        id: "trade",
        text: "Trade goods",
        prerequisites: [{ quality: "Goods", op: ">=", value: 5 }],
        effects: [
          { quality: "Goods", op: "subtract", value: 5 },
          { quality: "Gold", op: "add", value: 15 }
        ]
      }
    ]
  },
  
  // Year-end advancement
  {
    id: "new_year",
    prerequisites: [{ quality: "DayOfMonth", op: "==", value: 365 }],
    effects: [
      { quality: "Year", op: "add", value: 1 },
      { quality: "DayOfMonth", op: "set", value: 1 }
    ]
  }
];
```

### 6.4 Menace and Consequence

Track negative states that trigger special content:

```javascript
const menaceStorylets = [
  // Normal storylet that increases menace
  {
    id: "risky_theft",
    title: "A Risky Theft",
    branches: [{
      id: "attempt",
      text: "Attempt the theft",
      effects: [
        { quality: "Gold", op: "add", value: 50 },
        { quality: "Suspicion", op: "add", value: 3 }
      ]
    }]
  },
  
  // Menace consequence: triggers when Suspicion is high
  {
    id: "arrested",
    title: "Arrested!",
    priority: 100,  // High priority ensures this fires
    prerequisites: [{ quality: "Suspicion", op: ">=", value: 10 }],
    content: "The city guard has finally caught up with you...",
    branches: [{
      id: "go_quietly",
      text: "Go quietly",
      effects: [
        { quality: "Suspicion", op: "set", value: 0 },
        { quality: "InJail", op: "set", value: 1 },
        { quality: "Gold", op: "set", value: 0 }  // Confiscated!
      ]
    }]
  },
  
  // Jail content
  {
    id: "jail_escape",
    title: "Planning Your Escape",
    prerequisites: [{ quality: "InJail", op: "==", value: 1 }],
    // ... escape storylets
  }
];
```

### 6.5 Parallel Storylines

Run multiple independent arcs simultaneously:

```javascript
// Each storyline has its own progress tracker
const parallelStorylets = [
  // Main quest line
  {
    id: "main_1",
    prerequisites: [{ quality: "MainQuest_Progress", op: "==", value: 0 }],
    effects: [{ quality: "MainQuest_Progress", op: "set", value: 1 }],
    tags: ["main_quest"]
  },
  
  // Romance arc (independent progress)
  {
    id: "romance_1",
    prerequisites: [{ quality: "Romance_Progress", op: "==", value: 0 }],
    effects: [{ quality: "Romance_Progress", op: "set", value: 1 }],
    tags: ["romance"]
  },
  
  // Faction reputation arc
  {
    id: "guild_1",
    prerequisites: [{ quality: "Guild_Progress", op: "==", value: 0 }],
    effects: [{ quality: "Guild_Progress", op: "set", value: 1 }],
    tags: ["guild"]
  },
  
  // Cross-arc interaction: romance affects main quest
  {
    id: "main_5_with_ally",
    prerequisites: [
      { quality: "MainQuest_Progress", op: "==", value: 5 },
      { quality: "Romance_Progress", op: ">=", value: 3 }
    ],
    content: "Your companion stands with you, their presence giving you courage..."
  }
];
```

### 6.6 Resource Gating

Gate content behind resource accumulation:

```javascript
const resourceGatedStorylets = [
  // Repeatable earning storylet
  {
    id: "odd_jobs",
    title: "Work for Hire",
    repeatable: true,
    prerequisites: [],
    branches: [{
      id: "work",
      text: "Take on odd jobs",
      effects: [{ quality: "Gold", op: "add", value: 10 }]
    }]
  },
  
  // Gated by resource
  {
    id: "buy_ship",
    title: "Purchase a Ship",
    prerequisites: [{ quality: "Gold", op: ">=", value: 500 }],
    branches: [{
      id: "buy",
      text: "Buy the ship",
      effects: [
        { quality: "Gold", op: "subtract", value: 500 },
        { quality: "HasShip", op: "set", value: 1 }
      ]
    }]
  },
  
  // Gated by previous purchase
  {
    id: "sail_away",
    title: "Set Sail",
    prerequisites: [{ quality: "HasShip", op: "==", value: 1 }]
    // Opens up entire new section of content
  }
];
```

---

## Part VII: Advanced Topics

### 7.1 Optimizing Storylet Selection

For large storylet databases (hundreds or thousands), naive iteration becomes slow:

```javascript
class IndexedStoryletDatabase {
  constructor(storylets) {
    this.storylets = storylets;
    this.byQuality = new Map();  // quality -> storylets that check it
    this.byTag = new Map();      // tag -> storylets with that tag
    
    this.buildIndices();
  }
  
  buildIndices() {
    for (const storylet of this.storylets) {
      // Index by prerequisite qualities
      for (const prereq of (storylet.prerequisites || [])) {
        if (!this.byQuality.has(prereq.quality)) {
          this.byQuality.set(prereq.quality, []);
        }
        this.byQuality.get(prereq.quality).push(storylet);
      }
      
      // Index by tags
      for (const tag of (storylet.tags || [])) {
        if (!this.byTag.has(tag)) {
          this.byTag.set(tag, []);
        }
        this.byTag.get(tag).push(storylet);
      }
    }
  }
  
  // Get candidate storylets that might be affected by a quality change
  getCandidatesForQuality(qualityName) {
    return this.byQuality.get(qualityName) || [];
  }
  
  // Incremental update: only re-evaluate affected storylets
  updateAvailability(changedQualities, evaluator) {
    const candidates = new Set();
    
    for (const quality of changedQualities) {
      for (const storylet of this.getCandidatesForQuality(quality)) {
        candidates.add(storylet);
      }
    }
    
    // Only evaluate the affected storylets
    const nowAvailable = [];
    for (const storylet of candidates) {
      if (evaluator.evaluatePrerequisites(storylet.prerequisites)) {
        nowAvailable.push(storylet);
      }
    }
    
    return nowAvailable;
  }
}
```

### 7.2 Domain-Specific Language (DSL) for Content

Instead of writing storylets in raw JavaScript/JSON, consider a more author-friendly format:

```
=== mysterious_stranger
title: A Mysterious Stranger
location: Tavern
when: TimeOfDay == Night, Suspicion < 5

A hooded figure beckons from the corner of the tavern.
[if Perception >= 5]You notice a glint of steel beneath their cloak.[/if]

-> approach: Approach the stranger
   => HasMap = 1, Suspicion + 1
   The stranger slides a worn map across the table...

-> ignore: Ignore them and finish your drink
   You turn away. Some secrets are better left buried.

-> report: Report to the guard (requires Trust_CityGuard >= 10)
   => Trust_CityGuard + 5, MysteriousStranger_Arrested = 1
   The guards thank you for your vigilance...
```

A parser converts this to your internal format:

```javascript
class StoryletParser {
  parse(text) {
    const storylets = [];
    const blocks = text.split(/^===/gm).filter(b => b.trim());
    
    for (const block of blocks) {
      storylets.push(this.parseStorylet(block));
    }
    
    return storylets;
  }
  
  parseStorylet(block) {
    // Implementation parses the DSL format
    // ...returns storylet object
  }
}
```

### 7.3 Testing and Debugging

Build tools for testing your content:

```javascript
class StoryletDebugger {
  constructor(database, qualities) {
    this.database = database;
    this.qualities = qualities;
    this.evaluator = new PrerequisiteEvaluator(qualities);
  }
  
  // Why is a storylet unavailable?
  diagnoseStorylet(storyletId) {
    const storylet = this.database.find(s => s.id === storyletId);
    if (!storylet) return { error: "Storylet not found" };
    
    const failures = [];
    for (const prereq of (storylet.prerequisites || [])) {
      if (!this.evaluator.evaluateCondition(prereq)) {
        failures.push({
          condition: prereq,
          currentValue: this.qualities[prereq.quality],
          required: `${prereq.op} ${prereq.value}`
        });
      }
    }
    
    return {
      storyletId,
      available: failures.length === 0,
      failedPrerequisites: failures
    };
  }
  
  // What qualities would make this storylet available?
  suggestQualityChanges(storyletId) {
    const diagnosis = this.diagnoseStorylet(storyletId);
    const suggestions = [];
    
    for (const failure of diagnosis.failedPrerequisites) {
      suggestions.push({
        quality: failure.condition.quality,
        currentValue: failure.currentValue,
        suggestion: `Set to ${failure.condition.value} or ${failure.required}`
      });
    }
    
    return suggestions;
  }
  
  // Find all storylets that would become available if a quality changed
  whatIf(qualityName, newValue) {
    const testQualities = { ...this.qualities, [qualityName]: newValue };
    const testEvaluator = new PrerequisiteEvaluator(testQualities);
    
    const wouldUnlock = [];
    for (const storylet of this.database) {
      const currentlyAvailable = this.evaluator.evaluatePrerequisites(storylet.prerequisites);
      const wouldBeAvailable = testEvaluator.evaluatePrerequisites(storylet.prerequisites);
      
      if (!currentlyAvailable && wouldBeAvailable) {
        wouldUnlock.push(storylet);
      }
    }
    
    return wouldUnlock;
  }
  
  // Validate all storylets for common issues
  validateDatabase() {
    const issues = [];
    
    for (const storylet of this.database) {
      // Check for unreachable storylets
      const prereqQualities = new Set(
        (storylet.prerequisites || []).map(p => p.quality)
      );
      
      // Check if any storylet sets the required qualities
      const canBeReached = this.database.some(other => 
        other.branches?.some(branch =>
          branch.effects?.some(effect =>
            prereqQualities.has(effect.quality)
          )
        )
      );
      
      if (prereqQualities.size > 0 && !canBeReached) {
        issues.push({
          storyletId: storylet.id,
          issue: "Prerequisites may be unreachable",
          qualities: Array.from(prereqQualities)
        });
      }
      
      // Check for empty branches
      if (!storylet.branches || storylet.branches.length === 0) {
        issues.push({
          storyletId: storylet.id,
          issue: "No branches defined"
        });
      }
    }
    
    return issues;
  }
}
```

### 7.4 Analytics and Telemetry

Track player behavior to improve content:

```javascript
class AnalyticsEngine {
  constructor() {
    this.events = [];
  }
  
  logStoryletViewed(storyletId, qualities) {
    this.events.push({
      type: "storylet_viewed",
      storyletId,
      timestamp: Date.now(),
      qualitiesSnapshot: { ...qualities }
    });
  }
  
  logBranchChosen(storyletId, branchId, qualities) {
    this.events.push({
      type: "branch_chosen",
      storyletId,
      branchId,
      timestamp: Date.now(),
      qualitiesSnapshot: { ...qualities }
    });
  }
  
  // Analyze which storylets are rarely seen
  getUnderplayedStorylets(allStorylets, threshold = 0.1) {
    const viewCounts = new Map();
    const totalSessions = this.getSessionCount();
    
    for (const event of this.events) {
      if (event.type === "storylet_viewed") {
        viewCounts.set(
          event.storyletId,
          (viewCounts.get(event.storyletId) || 0) + 1
        );
      }
    }
    
    return allStorylets.filter(s => {
      const views = viewCounts.get(s.id) || 0;
      return views / totalSessions < threshold;
    });
  }
  
  // Find common quality states when players abandon the game
  analyzeDropoffPoints() {
    // Implementation analyzes session endings
  }
}
```

---

## Part VIII: Platform Integration Examples

### 8.1 Unity Integration

```csharp
// C# wrapper for the QBN engine
public class QBNManager : MonoBehaviour
{
    private Dictionary<string, float> qualities = new Dictionary<string, float>();
    private List<Storylet> storylets;
    
    public event Action<Storylet> OnStoryletAvailable;
    public event Action<string, float, float> OnQualityChanged;
    
    public void SetQuality(string name, float value)
    {
        float oldValue = qualities.ContainsKey(name) ? qualities[name] : 0;
        qualities[name] = value;
        OnQualityChanged?.Invoke(name, oldValue, value);
        RefreshAvailableStorylets();
    }
    
    public List<Storylet> GetAvailableStorylets()
    {
        return storylets.Where(s => EvaluatePrerequisites(s.prerequisites)).ToList();
    }
    
    // Called from Unity UI
    public void SelectBranch(string storyletId, string branchId)
    {
        var storylet = storylets.Find(s => s.id == storyletId);
        var branch = storylet.branches.Find(b => b.id == branchId);
        
        foreach (var effect in branch.effects)
        {
            ApplyEffect(effect);
        }
        
        // Trigger UI to show outcome
        StartCoroutine(ShowOutcome(branch.outcome));
    }
}
```

### 8.2 Twine/SugarCube Integration

For prototyping in Twine:

```javascript
// In your story JavaScript
window.QBN = {
  storylets: [],
  
  register: function(storylet) {
    this.storylets.push(storylet);
  },
  
  getAvailable: function() {
    return this.storylets.filter(s => {
      return s.prerequisites.every(p => {
        const value = State.variables[p.quality] || 0;
        switch(p.op) {
          case ">=": return value >= p.value;
          case "==": return value === p.value;
          // ... other operators
        }
      });
    });
  },
  
  renderChoices: function() {
    const available = this.getAvailable();
    let html = "";
    for (const s of available) {
      html += `<<link "${s.title}" "${s.passage}">><</link>><br>`;
    }
    return html;
  }
};

// In a Twine passage:
// <<= QBN.renderChoices()>>
```

---

## Conclusion

Building a QBN engine from scratch is a substantial but rewarding undertaking. By separating concerns into Narrative, Text, and UI engines, you create a flexible architecture that can evolve with your project's needs.

The key insights to remember:

1. **Qualities are universal** — Model everything as state variables
2. **Storylets are atomic** — Each should stand alone and be self-contained
3. **Prerequisites encode dependencies** — Let state drive availability, not explicit links
4. **Effects drive progression** — State changes open and close narrative paths
5. **Patterns provide structure** — Use gauntlets, branches, loops, and menaces to shape player experience
6. **Modularity enables scale** — New content slots in without rewriting existing material

The QBN approach trades the precision of branching narrative for the flexibility of emergent story. When well-designed, the result feels both authored and personal—players discover *their* story within the possibility space you've created.

---

## Further Reading

- Emily Short's blog posts on storylets and QBN structures
- Failbetter Games' design diaries on *Fallen London* and StoryNexus
- Alexis Kennedy's writing on "resource narrative"
- Bruno Dias' analysis of QBN system architecture
- Max Kreminski's academic work on storylet design spaces

---

*This guide synthesizes research from the interactive fiction community, particularly the pioneering work of Failbetter Games and the analytical contributions of Emily Short, Alexis Kennedy, Bruno Dias, and others who have shaped our understanding of quality-based narrative systems.*

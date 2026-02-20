# Ubiquitous Language Glossary

This glossary captures the domain terminology for this project. Each term represents a concept in the business domain and should be used consistently throughout code, documentation, and discussions.

**Format**: `**Term** (part of speech): Definition. [Docs: link] [See: related]`

**Rules**:

- Each concept has exactly ONE canonical term (no synonyms allowed)
- Definitions are concise (1-2 sentences maximum)
- Part of speech is always specified
- Related terms are linked using `[See: term]`
- Detailed documentation is linked using `[Docs: path]`

---

## Terms

**Aggregate Root** (noun): An entity that serves as the entry point to an aggregate, enforcing consistency boundaries for a cluster of related objects. [See: entity]

**Application Service** (noun): Cross-cutting application layer concern spanning multiple use cases, such as authorization or notification orchestration. [See: use-case]

**Domain Error** (noun): Base error class representing business rule violations, with a machine-readable error code. [See: result-type]

**Domain Service** (noun): Stateless business logic that operates on multiple entities or aggregates and doesn't belong to any single entity. [See: entity]

**Entity** (noun): Domain object with persistent identity, defined by ID rather than attributes. [See: value-object, aggregate-root]

**Rate Limiting** (noun): Mechanism to restrict the number of requests a client can make within a time window, preventing abuse and brute-force attacks. [See: lockout]

**Repository** (noun): Interface defining persistence operations for an aggregate root. [See: aggregate-root]

**Result Type** (noun): Discriminated union type representing an operation that can succeed or fail, used by use cases to make error handling explicit. [See: domain-error]

**Use Case** (noun): Application layer orchestrator that implements a single user action by coordinating domain entities and repository interfaces. [See: application-service]

**Value Object** (noun): Immutable domain object defined by its attributes rather than identity. [See: entity]

## Authentication Domain

**Account** (noun): Synonym for User in the context of authentication and identity management. [See: user]

**Authentication** (noun): The process of verifying that a user is who they claim to be through credentials. [See: credential, session]

**Authorization** (noun): The process of determining what actions an authenticated user is permitted to perform. [See: authentication]

**Credential** (noun): Evidence presented to prove identity, such as email and password combination. [See: password-hash]

**Lockout** (noun): Temporary prohibition on login attempts after exceeding the failed attempt threshold, protecting against brute-force attacks. [See: rate-limiting, authentication]

**CSRF Token** (noun): Random value tied to a session used to prevent Cross-Site Request Forgery attacks by validating request origin. [See: session]

**Password Hash** (noun): One-way cryptographic transformation of a password stored in the database, never the plaintext password itself. [See: salt, credential]

**Principal** (noun): Authenticated entity (typically a User) making a request within the system. [See: user, authentication]

**Salt** (noun): Random data combined with a password before hashing to prevent rainbow table attacks (embedded in modern password hash formats like Argon2id). [See: password-hash]

**Session** (noun): Server-managed authentication state that persists across multiple requests, identified by a session ID. [See: session-id, csrf-token]

**Session ID** (noun): Unique random identifier referencing a session, typically stored in an HttpOnly cookie. [See: session]

**Token** (noun): Generic term for credentials or identifiers; in this system refers to either session-id or csrf-token. [See: session-id, csrf-token]

**User** (noun): Entity representing a person with authentication credentials and persistent identity in the system. [See: principal, account]

## Galaxy Generation Domain

**Star System** (noun): A unique location in the galaxy defined by integer (x, y) coordinates, with a unique ID, name, classification, and generated attributes. [See: oikumene, the-beyond, classification]

**Oikumene** (noun): The tight network of approximately 250 civilized, high-tech, well-connected star systems strung along a spiral arm. Routes between Oikumene systems are known and pre-computed. [See: the-beyond, star-system]

**The Beyond** (noun): All star systems outside the Oikumene (~11,750 systems), mostly uninhabited, with scattered Lost Colonies and Hidden Enclaves. Routes must be discovered by players. [See: oikumene, lost-colony, hidden-enclave]

**Classification** (noun): A star system's political/narrative category determining attribute generation biases — one of Oikumene, Uninhabited, Lost Colony, or Hidden Enclave. [See: star-system, oikumene]

**Lost Colony** (noun): A Beyond star system with a civilization that was cut off from the Oikumene and regressed technologically (Technology clamped to maximum -2). [See: classification, hidden-enclave]

**Hidden Enclave** (noun): A small, secretive, technologically advanced Beyond outpost — pirate haven, research station, or reclusive enclave (Technology at least +2, Population at most 4). [See: classification, lost-colony]

**Cost Map** (noun): A 2D grid of traversal costs overlaid on the galaxy coordinate space, determining how expensive it is to travel through each cell. Composed from Perlin noise and cellular automata layers. [See: route]

**Route** (noun): A pre-computed navigable path between two star systems, containing origin/destination IDs, total traversal cost, and an ordered sequence of grid coordinates. [See: cost-map, star-system]

**TER Rating** (noun): A star system's Technology, Environment, and Resources scores, each generated by rolling 4dF (Fate dice) with classification biases and density modifiers. [See: star-system, stellar-density]

**Stellar Density** (noun): The count of neighboring star systems within a configurable radius around a given system, used to derive a negative environment modifier. [See: ter-rating, star-system]

**Trade Code** (noun): A derived category assigned to a star system based on combinations of its attributes (e.g., Rich, Garden, Industrial). [See: star-system, ter-rating]

**Bridge Route** (noun): A longer-distance route added by the pipeline to connect disconnected components of the Oikumene network, computed via A\* without a distance cap to guarantee connectivity. [See: route, oikumene]

**Core Exclusion Zone** (noun): The dense central region of the galaxy from which Oikumene systems are excluded, characterized by high stellar density and harsh environments. [See: oikumene, stellar-density]

**Fate Dice (4dF)** (noun): A dice roll mechanism producing values from -4 to +4 by rolling four dice each with outcomes of -1, 0, or +1. Used for TER attribute generation. [See: ter-rating]

**Spiral Arm** (noun): A logarithmic spiral curve along which star systems are clustered, defining the visible structure of the galaxy. Configurable by arm count, turn angle, and degree. [See: star-system, oikumene]

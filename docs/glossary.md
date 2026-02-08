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

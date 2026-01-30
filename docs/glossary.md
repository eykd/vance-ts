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

**Domain Service** (noun): Stateless business logic that operates on multiple entities or aggregates and doesn't belong to any single entity. [See: entity]

**Entity** (noun): Domain object with persistent identity, defined by ID rather than attributes. [See: value-object, aggregate-root]

**Repository** (noun): Interface defining persistence operations for an aggregate root. [See: aggregate-root]

**Use Case** (noun): Application layer orchestrator that implements a single user action by coordinating domain entities and repository interfaces. [See: application-service]

**Value Object** (noun): Immutable domain object defined by its attributes rather than identity. [See: entity]

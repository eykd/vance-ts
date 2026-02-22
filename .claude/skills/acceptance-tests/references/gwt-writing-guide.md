# GWT Spec Writing Guide

## Format Syntax

### File Structure

```
;=============================================
; Scenario: First scenario description
;=============================================
GIVEN precondition one.
WHEN action one.
THEN outcome one.

;=============================================
; Scenario: Second scenario description
;=============================================
GIVEN precondition two.
WHEN action two.
THEN outcome two.
```

### Rules

- **Separator lines**: Only `;` and `=` characters (e.g., `;=============================================`)
- **Description lines**: Start with `;` followed by text (between separator pairs)
- **Step keywords**: `GIVEN`, `WHEN`, `THEN` — ALL CAPS, at the start of the line
- **Periods**: Every step line ends with a period
- **Blank lines**: Allowed between scenarios, ignored by parser
- **No trailing whitespace**: Keep lines clean
- **One scenario per separator block**: Opening separator, description line(s), closing separator, then steps

### Multi-Scenario Files

A single spec file can contain multiple scenarios. Each scenario gets its own
`it()` test when generated. Use multiple scenarios to cover variations of
the same user story (happy path, edge cases, error cases).

## Domain Language Discipline

Specs must use the vocabulary of the **user's domain**, not the implementation.

### Web Application Domain Vocabulary

| Say this                                     | NOT this                                   |
| -------------------------------------------- | ------------------------------------------ |
| there are no registered users                | the users table is empty                   |
| the user logs in                             | a POST request is sent to /api/auth/login  |
| the response shows the item                  | the JSON response body contains the record |
| an error message says the item was not found | the server returns 404                     |
| the user is redirected to the dashboard      | the response has a Location header         |
| the list shows 3 items                       | stdout/JSON array has length 3             |
| the user's session is active                 | the session cookie is set                  |
| the item is saved                            | INSERT is executed in D1                   |

### Good/Bad Examples

**1. Describing preconditions**

Good:

```
GIVEN a project with two items named "Task A" and "Task B".
```

Bad:

```
GIVEN the D1 database has two rows in the items table.
```

**2. Describing user actions**

Good:

```
WHEN the user adds an item titled "New Task".
```

Bad:

```
WHEN a POST request is sent to /app/_/items with JSON body {"title":"New Task"}.
```

**3. Describing outcomes**

Good:

```
THEN the list shows three items.
THEN "New Task" appears last.
```

Bad:

```
THEN the response body contains a JSON array with 3 elements.
THEN the items[2].title equals "New Task".
```

**4. Describing errors**

Good:

```
THEN an error message says the email address is already registered.
```

Bad:

```
THEN the server returns status 409 with JSON error field.
```

**5. Multi-step setup**

Good:

```
GIVEN a user is registered with email "alice@example.com".
GIVEN the user is logged in.
WHEN the user updates their display name to "Alice".
THEN the profile shows the display name "Alice".
```

Bad:

```
GIVEN a row exists in the users table with email "alice@example.com".
GIVEN a session cookie is set in the browser.
WHEN a PATCH request is sent to /api/profile with body {"displayName":"Alice"}.
THEN the database row has displayName = "Alice".
```

## Spec Review Checklist

Before committing a spec file, verify:

1. **File name** matches `specs/acceptance-specs/US<N>-<kebab-case-title>.txt`
2. **Separator syntax** uses only `;` and `=` characters
3. **Keywords** are ALL CAPS (`GIVEN`, `WHEN`, `THEN`)
4. **Every step** ends with a period
5. **No implementation language** — no code identifiers, no infrastructure terms
6. **Scenarios are independent** — each can run without the others
7. **Outcomes are observable** — describe what the user sees, not internal state
8. **Error cases are covered** — include a scenario for error preconditions
9. **Bootstrap scenarios exist** — if an action can be a user's first interaction, spec the cold-start path

Run `/spec-check` to automate leakage detection on committed specs.

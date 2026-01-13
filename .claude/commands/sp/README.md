# Github Spec Kit Commands

Organized workflow commands for specification-driven development.

## Command Workflow

Use these commands in sequence for feature development:

1. **`/sp:01-constitution`** - Create or update project constitution (principles and standards)
2. **`/sp:02-specify`** - Create feature specification from natural language description
3. **`/sp:03-clarify`** - Ask targeted clarification questions about the spec
4. **`/sp:04-plan`** - Generate implementation plan using the plan template
5. **`/sp:05-checklist`** - Generate custom checklist for the feature
6. **`/sp:06-tasks`** - Generate actionable, dependency-ordered tasks
7. **`/sp:07-implement`** - Execute the implementation plan
8. **`/sp:08-analyze`** - Cross-artifact consistency and quality analysis
9. **`/sp:09-taskstoissues`** - Convert tasks to GitHub issues

## Typical Usage

**Starting a new feature:**

```
/sp:02-specify
/sp:03-clarify (if needed)
/sp:04-plan
/sp:06-tasks
/sp:07-implement
```

**Converting to GitHub workflow:**

```
/sp:09-taskstoissues
```

**Quality assurance:**

```
/sp:08-analyze
```

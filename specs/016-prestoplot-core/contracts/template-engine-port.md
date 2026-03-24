# Contract: TemplateEnginePort

**Layer**: Application (port interface)
**File**: `src/application/prestoplot/ports.ts`

## Interface

```typescript
/** Port for evaluating template expressions in rendered text. */
interface TemplateEnginePort {
  /**
   * Evaluate template expressions in the given text.
   * Resolves references against the provided context (rule outputs, variables).
   * Returns plain text with all expressions replaced.
   * Throws TemplateError on unresolvable references or syntax errors.
   */
  evaluate(template: string, context: Readonly<Record<string, string>>, depth: number): string;
}
```

## Implementations

| Adapter         | File                                               | Syntax                                              |
| --------------- | -------------------------------------------------- | --------------------------------------------------- |
| FtemplateEngine | `src/infrastructure/prestoplot/ftemplateEngine.ts` | `{expression}` — single braces                      |
| Jinja2Engine    | `src/infrastructure/prestoplot/jinja2Engine.ts`    | `{{ expression }}` — double braces, no control flow |

## Behavior

- `depth` parameter tracks recursion level; implementations throw `TemplateError` when depth exceeds MAX_DEPTH (50)
- `context` keys are rule names or variable names; values are already-rendered strings
- Dot access supported: `{{ planet.name }}` resolves `planet` from context, then accesses `.name`
- Unknown references throw `TemplateError` (not silently ignored)

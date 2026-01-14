# PII Redaction

**Use when:** Implementing systematic PII and secret redaction for defense-in-depth data protection in logs.

## Overview

This skill provides comprehensive patterns for protecting sensitive data in logs through multiple redaction layers. It covers sensitive data classification (never log vs always redact vs conditionally log), pattern-based detection using regex for API keys/tokens/credit cards/PII, field-level detection based on key names, redaction functions for values/objects/strings/URLs, and URL sanitization to remove query parameters and path segments containing tokens.

## Decision Tree

### Need to identify what data to redact?

**When**: Classifying data sensitivity and determining redaction requirements
**Go to**: [references/sensitive-patterns.md](./references/sensitive-patterns.md)

### Need to detect sensitive fields?

**When**: Implementing field-level detection based on key names
**Go to**: [references/field-detection.md](./references/field-detection.md)

### Need to implement redaction functions?

**When**: Building redactValue, redactObject, redactString, and maskString utilities
**Go to**: [references/redaction-functions.md](./references/redaction-functions.md)

### Need to sanitize URLs?

**When**: Redacting query parameters and path segments in logged URLs
**Go to**: [references/url-sanitization.md](./references/url-sanitization.md)

## Quick Example

```typescript
// src/infrastructure/logging/redaction.ts
export function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (typeof value === 'object') {
    return redactObject(value as Record<string, unknown>);
  }

  return value;
}

function redactString(str: string): string {
  let result = str;
  // Apply pattern replacements for API keys, tokens, credit cards, etc.
  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}
```

## Cross-References

- **[structured-logging](../structured-logging/SKILL.md)**: Integrate redaction into SafeLogger for automatic PII protection in all logs

## Reference Files

- [references/sensitive-patterns.md](./references/sensitive-patterns.md) - Data classification and regex patterns for sensitive data detection
- [references/field-detection.md](./references/field-detection.md) - Field-level detection based on key names for redaction and masking
- [references/redaction-functions.md](./references/redaction-functions.md) - Core redaction utilities for values, objects, strings, and masking
- [references/url-sanitization.md](./references/url-sanitization.md) - URL sanitization patterns for query parameters and path segments

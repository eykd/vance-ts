# Sensitive Data Patterns

**Purpose**: Classify data sensitivity and provide regex patterns for detecting sensitive information in logs.

## Data Classification

| Category              | Examples                                               | Action                                      |
| --------------------- | ------------------------------------------------------ | ------------------------------------------- |
| **Never Log**         | Passwords, API keys, tokens, credit card numbers, SSNs | Block at source                             |
| **Always Redact**     | Email addresses, phone numbers, IP addresses, names    | Mask or hash                                |
| **Conditionally Log** | User IDs, session IDs, request paths                   | Log in non-production, redact in production |
| **Safe to Log**       | Timestamps, error codes, aggregate counts, colo codes  | Log freely                                  |

## Pattern-Based Detection

### API Keys and Tokens

```typescript
export const SENSITIVE_PATTERNS = {
  // API Keys and Tokens
  apiKey:
    /(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token)['":\s]*[=:]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
  bearerToken: /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
```

**Rationale**: API keys typically follow predictable patterns with 20+ alphanumeric characters. JWT tokens always start with `eyJ` (base64-encoded `{"alg"`). Bearer tokens follow OAuth 2.0 format.

### AWS Credentials

```typescript
  // AWS Credentials
  awsAccessKey: /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/g,
  awsSecretKey: /[a-zA-Z0-9/+=]{40}/g,
```

**Rationale**: AWS access keys have specific prefixes (AKIA for IAM, ASIA for STS, etc.) followed by 16 uppercase alphanumeric characters. Secret keys are exactly 40 characters from base64 alphabet.

### Credit Cards

```typescript
  // Credit Cards
  creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
```

**Rationale**: Detects 16-digit credit card numbers with optional spaces or hyphens as separators (e.g., `4111-1111-1111-1111` or `4111111111111111`).

### PII Patterns

```typescript
  // PII
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
```

**Rationale**:

- Email: Standard RFC 5322 simplified pattern
- Phone: US phone numbers with optional country code, area code, and various separators
- SSN: US Social Security Numbers in `XXX-XX-XXXX` format (with optional separators)
- IPv4: Dotted quad notation (note: may need validation to avoid false positives like version numbers)

### Generic Secrets

```typescript
  // Generic Secrets
  password: /(?:password|passwd|pwd)['":\s]*[=:]\s*['"]?([^'"\s]+)['"]?/gi,
  secret: /(?:secret|private[_-]?key)['":\s]*[=:]\s*['"]?([^'"\s]+)['"]?/gi,
};
```

**Rationale**: Catches common field names for passwords and secrets in various formats (JSON, query strings, logs).

## Pattern Usage

```typescript
function redactString(str: string): string {
  let result = str;

  // Apply all pattern replacements
  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    result = result.replace(pattern, '[REDACTED]');
  }

  return result;
}
```

## False Positive Mitigation

**IPv4 Addresses**: The IPv4 pattern may match version numbers like `1.2.3.4`. Consider context-aware detection:

```typescript
// Only redact if preceded by IP-related keywords
const contextualIpPattern =
  /(?:ip|address|client|remote)['":\s]*[=:]\s*['"]?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})['"]?/gi;
```

**AWS Secret Keys**: The 40-character pattern may match other base64 strings. Consider requiring the key to follow an AWS access key in context.

## Pattern Testing

Always validate patterns against test cases:

```typescript
describe('SENSITIVE_PATTERNS', () => {
  it('detects API keys', () => {
    const input = 'api_key: "sk_live_abcdef123456789012345678"';
    const result = redactString(input);
    expect(result).toBe('api_key: "[REDACTED]"');
  });

  it('detects JWT tokens', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const result = redactString(jwt);
    expect(result).toBe('[REDACTED]');
  });

  it('detects credit card numbers', () => {
    const input = 'Card: 4111-1111-1111-1111';
    const result = redactString(input);
    expect(result).toBe('Card: [REDACTED]');
  });
});
```

## Compliance Alignment

These patterns align with:

- **OWASP Logging Cheat Sheet**: Never log authentication credentials, session tokens, credit cards, or PII
- **NIST SP 800-122**: PII must be protected through redaction or encryption in logs
- **GDPR Article 32**: Implement appropriate technical measures to ensure security of personal data
- **PCI DSS Requirement 3**: Protect stored cardholder data (includes logs)

## Limitations

- **Patterns are not exhaustive**: New token formats emerge regularly
- **Context matters**: Some patterns may need domain-specific customization
- **Performance impact**: Regex operations on every log entry add overhead (benchmark in your environment)
- **No semantic analysis**: Cannot detect sensitive data described in natural language (e.g., "my password is hunter2")

## Extension Pattern

To add custom patterns:

```typescript
export const SENSITIVE_PATTERNS = {
  ...SENSITIVE_PATTERNS,
  customToken: /your-pattern-here/g,
};
```

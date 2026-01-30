# External Service Adapters

Integrations with third-party APIs (email, payments, etc.).

## Patterns

- Implement domain service interfaces
- Handle API errors gracefully
- Log external calls for debugging

## Skills

- `/glossary` - Ensure service names match domain terminology
- `/vitest-integration-testing` - Mock external APIs

## Examples

- `MailgunEmailService.ts` - Email delivery
- `StripePaymentService.ts` - Payment processing

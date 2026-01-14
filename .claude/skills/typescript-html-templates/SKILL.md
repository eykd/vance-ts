---
name: typescript-html-templates
description: 'Use when: (1) creating TypeScript HTML response functions, (2) implementing escapeHtml utilities, (3) building template literals for HTMX partials, (4) returning HX-Trigger headers for notifications.'
---

# TypeScript HTML Templates

Create TypeScript functions that return HTML strings for HTMX responses with proper escaping and notification triggers.

## Quick Reference

| Template Type     | Purpose                            | Reference                                                 |
| ----------------- | ---------------------------------- | --------------------------------------------------------- |
| Template function | Return HTML string for a component | [template-functions.md](references/template-functions.md) |
| Response helpers  | Wrap HTML with correct headers     | [response-patterns.md](references/response-patterns.md)   |
| Error responses   | Validation and server errors       | [error-responses.md](references/error-responses.md)       |

## Core Pattern

```typescript
/** Escape HTML special characters to prevent XSS */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/** Create HTML response with optional HX-Trigger */
function htmlResponse(html: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers },
  });
}
```

## HX-Trigger Pattern

Send notifications to Alpine.js toast container:

```typescript
return htmlResponse(successHtml, 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Saved successfully!', type: 'success' },
  }),
});
```

## Template Function Pattern

```typescript
interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

function commentItem(comment: Comment): string {
  return `
    <article class="card bg-base-100 shadow">
      <div class="card-body">
        <h4 class="font-bold">${escapeHtml(comment.author)}</h4>
        <p>${escapeHtml(comment.content)}</p>
        <time class="text-sm opacity-60">
          ${comment.createdAt.toLocaleDateString()}
        </time>
      </div>
    </article>
  `;
}
```

## Workflow

1. **Need HTML output?** → Create a template function returning string
2. **Including user data?** → Always use `escapeHtml()` on dynamic values
3. **Need notification?** → Add `HX-Trigger` header with notify object
4. **Form validation error?** → Return 400 with alert HTML

## Detailed References

- [Template Functions](references/template-functions.md) - Component patterns, lists, conditional rendering
- [Response Patterns](references/response-patterns.md) - Status codes, headers, HX-Trigger
- [Error Responses](references/error-responses.md) - Validation errors, server errors, empty states

## Related Skills

- [worker-request-handler](../worker-request-handler/SKILL.md) - Route handlers that call template functions
- [tailwind-daisyui-design](../tailwind-daisyui-design/SKILL.md) - DaisyUI classes for templates
- [htmx-pattern-library](../htmx-pattern-library/SKILL.md) - HTMX attributes in HTML output

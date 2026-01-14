# Error Responses

Patterns for validation errors, server errors, and empty states.

## Validation Error Response

```typescript
function validationError(errors: string[]): Response {
  const html = `
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <ul class="list-disc list-inside">
        ${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}
      </ul>
    </div>
  `;
  return htmlResponse(html, 400);
}
```

## Single Field Error

```typescript
function fieldError(message: string): Response {
  return htmlResponse(
    `<div class="alert alert-error"><span>${escapeHtml(message)}</span></div>`,
    400
  );
}

// Usage
if (!title || title.trim().length < 3) {
  return fieldError('Title must be at least 3 characters');
}
```

## Form Validation Pattern

```typescript
interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function validateContactForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || name.trim().length < 2) {
    errors['name'] = 'Name must be at least 2 characters';
  }

  if (!email || !email.includes('@')) {
    errors['email'] = 'Valid email address required';
  }

  if (!message || message.trim().length < 10) {
    errors['message'] = 'Message must be at least 10 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

async function handleContactForm(request: Request): Promise<Response> {
  const formData = await request.formData();
  const validation = validateContactForm(formData);

  if (!validation.valid) {
    const errorList = Object.values(validation.errors);
    return validationError(errorList);
  }

  // Process valid form...
}
```

## Server Error Response

```typescript
function serverError(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Internal server error';

  console.error('Server error:', error);

  return htmlResponse(
    `<div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>${escapeHtml(message)}</span>
    </div>`,
    500
  );
}
```

## Not Found Response

```typescript
function notFound(resource: string): Response {
  return htmlResponse(
    `<div class="text-center py-12">
      <h2 class="text-2xl font-bold text-error">Not Found</h2>
      <p class="mt-2 text-base-content/60">
        The ${escapeHtml(resource)} you're looking for doesn't exist.
      </p>
      <a href="/" class="btn btn-primary mt-4">Go Home</a>
    </div>`,
    404
  );
}
```

## Empty State Response

```typescript
function emptyState(
  title: string,
  description: string,
  actionUrl?: string,
  actionLabel?: string
): string {
  return `
    <div class="text-center py-12 bg-base-100 rounded-lg">
      <div class="text-4xl mb-4">📭</div>
      <h3 class="text-lg font-semibold">${escapeHtml(title)}</h3>
      <p class="text-base-content/60 mt-1">${escapeHtml(description)}</p>
      ${
        actionUrl
          ? `<a href="${escapeHtml(actionUrl)}" class="btn btn-primary btn-sm mt-4">
               ${escapeHtml(actionLabel ?? 'Get Started')}
             </a>`
          : ''
      }
    </div>
  `;
}

// Usage in search
if (results.length === 0) {
  return htmlResponse(
    emptyState('No results found', `We couldn't find anything matching "${escapeHtml(query)}"`)
  );
}
```

## Loading State (For Deferred Content)

```typescript
function loadingState(message = 'Loading...'): string {
  return `
    <div class="flex items-center justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-2">${escapeHtml(message)}</span>
    </div>
  `;
}
```

## Success Response with Icon

```typescript
function successMessage(message: string): string {
  return `
    <div class="alert alert-success">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

// Usage
return htmlResponse(successMessage(`Thank you, ${data.name}! We'll be in touch soon.`), 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Message sent!', type: 'success' },
  }),
});
```

## Try-Catch Handler Pattern

```typescript
async function handleRequest(request: Request): Promise<Response> {
  try {
    // Handler logic...
    return htmlResponse(successHtml, 200);
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationError(error.messages);
    }
    return serverError(error);
  }
}
```

## See Also

- [Template Functions](./template-functions.md) - Creating HTML strings
- [Response Patterns](./response-patterns.md) - Status codes and headers

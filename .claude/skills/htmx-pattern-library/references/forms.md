# Form Patterns

## Table of Contents

- [Basic Form Submission](#basic-form-submission)
- [Client-Side Validation with Alpine](#client-side-validation-with-alpine)
- [Server-Side Validation Errors](#server-side-validation-errors)
- [Inline Field Validation](#inline-field-validation)
- [Form Reset After Success](#form-reset-after-success)
- [Multi-Step Forms](#multi-step-forms)

---

## Basic Form Submission

```html
<form hx-post="/app/_/items" hx-target="#item-list" hx-swap="beforeend">
  <input type="text" name="title" required />
  <button type="submit">Add</button>
</form>
<ul id="item-list"></ul>
```

**Server returns:** New `<li>` element to append.

---

## Client-Side Validation with Alpine

Validate before sending to server:

```html
<form
  hx-post="/app/_/tasks"
  hx-target="#task-list"
  hx-swap="beforeend"
  x-data="{ 
        title: '',
        errors: {},
        validate() {
          this.errors = {};
          if (this.title.trim().length < 3) {
            this.errors.title = 'Must be at least 3 characters';
          }
          return Object.keys(this.errors).length === 0;
        }
      }"
  @submit="if (!validate()) $event.preventDefault()"
>
  <div class="form-control">
    <input
      type="text"
      name="title"
      x-model="title"
      class="input input-bordered"
      :class="{ 'input-error': errors.title }"
    />
    <span x-show="errors.title" x-text="errors.title" class="text-error text-sm"></span>
  </div>

  <button type="submit" class="btn btn-primary" :disabled="title.length < 3">Submit</button>
</form>
```

---

## Server-Side Validation Errors

### Option 1: Replace Form with Error State

```html
<!-- Original form with error target -->
<div id="form-container">
  <form hx-post="/app/_/users" hx-target="#form-container" hx-swap="innerHTML">
    <input type="email" name="email" required />
    <button type="submit">Register</button>
  </form>
</div>
```

**Server error response (400):**

```html
<form hx-post="/app/_/users" hx-target="#form-container" hx-swap="innerHTML">
  <div class="alert alert-error">Email already registered</div>
  <input type="email" name="email" value="user@example.com" class="input-error" required />
  <button type="submit">Register</button>
</form>
```

### Option 2: Separate Error Container

```html
<div id="form-errors"></div>
<form hx-post="/app/_/users" hx-target="#result" hx-target-error="#form-errors">
  <!-- fields -->
</form>
```

**Server error response:**

```html
<div class="alert alert-error">
  <ul>
    <li>Email is required</li>
    <li>Password must be 8+ characters</li>
  </ul>
</div>
```

---

## Inline Field Validation

Validate individual fields on blur:

```html
<form hx-post="/app/_/register" hx-target="#result">
  <div class="form-control">
    <input
      type="email"
      name="email"
      hx-post="/app/_/validate/email"
      hx-trigger="blur changed"
      hx-target="next .field-error"
      hx-swap="innerHTML"
    />
    <span class="field-error text-error text-sm"></span>
  </div>

  <div class="form-control">
    <input
      type="text"
      name="username"
      hx-post="/app/_/validate/username"
      hx-trigger="blur changed delay:200ms"
      hx-target="next .field-error"
      hx-swap="innerHTML"
      hx-indicator="next .field-loading"
    />
    <span class="field-loading htmx-indicator">Checking...</span>
    <span class="field-error text-error text-sm"></span>
  </div>

  <button type="submit">Register</button>
</form>
```

**Server validation responses:**

```typescript
// Valid
return new Response('', { status: 200 });

// Invalid
return new Response('Username already taken', { status: 200 });
// or with styling:
return new Response('<span class="text-error">Username already taken</span>', { status: 200 });
```

---

## Form Reset After Success

```html
<form
  hx-post="/app/_/items"
  hx-target="#item-list"
  hx-swap="beforeend"
  hx-on::after-request="if(event.detail.successful) this.reset()"
>
  <input type="text" name="title" />
  <button type="submit">Add</button>
</form>
```

### With Alpine State Reset

```html
<form
  hx-post="/app/_/items"
  hx-target="#item-list"
  hx-swap="beforeend"
  x-data="{ title: '', description: '' }"
  @htmx:after-request="if($event.detail.successful) { title = ''; description = ''; }"
>
  <input type="text" name="title" x-model="title" />
  <textarea name="description" x-model="description"></textarea>
  <button type="submit">Add</button>
</form>
```

---

## Multi-Step Forms

Use Alpine for step management, HTMX for step validation:

```html
<div
  x-data="{ 
  step: 1, 
  maxStep: 3,
  formData: {},
  canProceed: false
}"
>
  <!-- Progress indicator -->
  <div class="steps">
    <template x-for="s in maxStep">
      <span class="step" :class="{ 'step-primary': s <= step }"></span>
    </template>
  </div>

  <!-- Step 1: Basic Info -->
  <div x-show="step === 1">
    <form
      hx-post="/app/_/wizard/validate-step-1"
      hx-target="#step1-errors"
      hx-swap="innerHTML"
      @htmx:after-request="if($event.detail.successful) { step = 2; }"
    >
      <input type="text" name="name" x-model="formData.name" required />
      <input type="email" name="email" x-model="formData.email" required />
      <div id="step1-errors"></div>
      <button type="submit">Next</button>
    </form>
  </div>

  <!-- Step 2: Details -->
  <div x-show="step === 2">
    <form
      hx-post="/app/_/wizard/validate-step-2"
      hx-target="#step2-errors"
      hx-swap="innerHTML"
      @htmx:after-request="if($event.detail.successful) { step = 3; }"
    >
      <textarea name="bio" x-model="formData.bio"></textarea>
      <div id="step2-errors"></div>
      <button type="button" @click="step = 1">Back</button>
      <button type="submit">Next</button>
    </form>
  </div>

  <!-- Step 3: Confirm & Submit -->
  <div x-show="step === 3">
    <h3>Confirm Your Details</h3>
    <p>Name: <span x-text="formData.name"></span></p>
    <p>Email: <span x-text="formData.email"></span></p>
    <form hx-post="/app/_/wizard/submit" hx-target="#result" hx-vals="JSON.stringify(formData)">
      <button type="button" @click="step = 2">Back</button>
      <button type="submit">Submit</button>
    </form>
  </div>
</div>
```

---

## Server Handler Pattern

```typescript
async function handleFormSubmit(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = formData.get('title') as string;

  // Validation
  const errors: string[] = [];
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (errors.length > 0) {
    return new Response(`<div class="alert alert-error">${errors.join('<br>')}</div>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Create item
  const item = await createItem({ title: title.trim() });

  // Return new HTML fragment
  return new Response(`<li class="task-item">${escapeHtml(item.title)}</li>`, {
    status: 201,
    headers: {
      'Content-Type': 'text/html',
      'HX-Trigger': JSON.stringify({
        notify: { message: 'Item created!', type: 'success' },
      }),
    },
  });
}
```

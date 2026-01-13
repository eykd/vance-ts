# DaisyUI Component Patterns

## Contents

1. [Decision Framework](#decision-framework)
2. [Use As-Is Examples](#use-as-is-examples)
3. [Composition Patterns](#composition-patterns)
4. [Extension Patterns](#extension-patterns)
5. [Component Reference](#component-reference)

## Decision Framework

### When to Use As-Is

- Button variants (primary, secondary, ghost, outline)
- Form inputs (input, select, checkbox, radio, toggle)
- Feedback components (alert, toast, badge)
- Navigation (navbar, menu, breadcrumbs, tabs)
- Layout (card, divider, drawer)

### When to Compose

- Card with form inside
- Modal with multi-step content
- Navbar with dropdown menus
- Alert with action buttons

### When to Extend with Utilities

- Adjusting spacing: `btn btn-primary px-8`
- Custom widths: `input input-bordered w-72`
- Positioning: `badge badge-primary absolute top-0 right-0`
- Animation: `btn btn-primary transition-transform hover:scale-105`

### When to Customize (Rarely)

- Brand-specific button shapes not covered by modifiers
- Complex multi-part components with unique interactions
- When accessibility requirements differ from defaults

## Use As-Is Examples

### Buttons

```html
<!-- Size variants -->
<button class="btn btn-xs">Tiny</button>
<button class="btn btn-sm">Small</button>
<button class="btn">Normal</button>
<button class="btn btn-lg">Large</button>

<!-- Style variants -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>
<button class="btn btn-outline btn-primary">Outline</button>

<!-- States -->
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-primary"><span class="loading loading-spinner"></span>Loading</button>
```

### Alerts

```html
<div class="alert alert-info">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  <span>Info message here</span>
</div>
<div class="alert alert-success">Success!</div>
<div class="alert alert-warning">Warning!</div>
<div class="alert alert-error">Error!</div>
```

### Cards

```html
<div class="card bg-base-100 shadow-xl">
  <figure><img src="/image.jpg" alt="Description" /></figure>
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

## Composition Patterns

### Card with Form

```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Sign Up</h2>
    <form>
      <label class="form-control w-full">
        <div class="label"><span class="label-text">Email</span></div>
        <input type="email" class="input input-bordered" />
      </label>
      <label class="form-control w-full">
        <div class="label"><span class="label-text">Password</span></div>
        <input type="password" class="input input-bordered" />
      </label>
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary">Create Account</button>
      </div>
    </form>
  </div>
</div>
```

### Navbar with Dropdown

```html
<nav class="navbar bg-base-100 shadow">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl">Brand</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li><a>Home</a></li>
      <li>
        <details>
          <summary>Products</summary>
          <ul class="bg-base-100 rounded-t-none p-2 w-48">
            <li><a>Product A</a></li>
            <li><a>Product B</a></li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</nav>
```

### Alert with Actions

```html
<div class="alert alert-warning">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
  <span>Unsaved changes will be lost</span>
  <div>
    <button class="btn btn-sm btn-ghost">Cancel</button>
    <button class="btn btn-sm btn-warning">Discard</button>
  </div>
</div>
```

## Extension Patterns

### Adding Icons to Buttons

```html
<button class="btn btn-primary">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>
  Add Item
</button>
```

### Custom Spacing on Cards

```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body p-4 sm:p-6 lg:p-8">
    <!-- Responsive padding -->
  </div>
</div>
```

### Badge Positioning

```html
<div class="relative">
  <button class="btn">Notifications</button>
  <span class="badge badge-primary badge-sm absolute -top-2 -right-2">5</span>
</div>
```

## Component Reference

| Need               | Component      | Class                                  |
| ------------------ | -------------- | -------------------------------------- |
| Primary action     | Button         | `btn btn-primary`                      |
| Secondary action   | Button         | `btn btn-secondary` or `btn btn-ghost` |
| Destructive action | Button         | `btn btn-error`                        |
| Text input         | Input          | `input input-bordered`                 |
| Selection          | Select         | `select select-bordered`               |
| Boolean            | Toggle         | `toggle` or `checkbox`                 |
| Multiple choice    | Checkbox group | `checkbox`                             |
| Single choice      | Radio group    | `radio`                                |
| Content container  | Card           | `card bg-base-100`                     |
| Success message    | Alert          | `alert alert-success`                  |
| Error message      | Alert          | `alert alert-error`                    |
| Loading state      | Loading        | `loading loading-spinner`              |
| Navigation         | Navbar         | `navbar bg-base-100`                   |
| Sidebar nav        | Menu           | `menu bg-base-200`                     |

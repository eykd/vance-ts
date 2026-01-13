# Out-of-Band (OOB) Update Patterns

## Table of Contents

- [Core Concept](#core-concept)
- [OOB Swap Strategies](#oob-swap-strategies)
- [Pattern: Counters and Badges](#pattern-counters-and-badges)
- [Pattern: Notifications](#pattern-notifications)
- [Pattern: Related Content](#pattern-related-content)
- [Pattern: Form Responses](#pattern-form-responses)
- [Server-Side Implementation](#server-side-implementation)

## Core Concept

OOB updates allow a single server response to update multiple page regions. The primary target is swapped normally; additional elements with `hx-swap-oob="true"` are swapped into their matching IDs.

```html
<!-- Server response -->
<div id="primary-target">Main content</div>
<div id="sidebar" hx-swap-oob="true">Updated sidebar</div>
<span id="counter" hx-swap-oob="true">42</span>
```

**Rules:**

- OOB elements must have matching IDs in the page
- OOB swap happens automatically by ID lookup
- Primary target uses hx-target/hx-swap from request
- OOB elements default to outerHTML swap

## OOB Swap Strategies

```html
<!-- Default: outerHTML (replace entire element) -->
<div id="target" hx-swap-oob="true">New content</div>

<!-- innerHTML: replace contents only -->
<div id="target" hx-swap-oob="innerHTML">New inner</div>

<!-- beforeend: append -->
<ul id="list" hx-swap-oob="beforeend">
  <li>New item</li>
</ul>

<!-- afterbegin: prepend -->
<ul id="list" hx-swap-oob="afterbegin">
  <li>First item</li>
</ul>

<!-- delete: remove element -->
<div id="temp-message" hx-swap-oob="delete"></div>
```

## Pattern: Counters and Badges

### Cart Counter

```html
<!-- Page structure -->
<nav>
  <a href="/cart"> Cart <span id="cart-count" class="badge">0</span> </a>
</nav>
<div id="product-list">...</div>

<!-- Add to cart button -->
<button
  hx-post="/api/cart/add"
  hx-vals='{"product_id": "123"}'
  hx-target="#cart-feedback"
  hx-swap="innerHTML"
>
  Add to Cart
</button>
```

Server response:

```html
<div>Added to cart!</div>
<span id="cart-count" class="badge" hx-swap-oob="true">3</span>
```

### Notification Badge

```html
<!-- Header badge -->
<span id="notification-count" class="badge badge-error">5</span>

<!-- When marking notification read -->
<button hx-post="/api/notifications/123/read" hx-target="closest .notification" hx-swap="outerHTML">
  Mark Read
</button>
```

Server response:

```html
<div class="notification read">...</div>
<span id="notification-count" class="badge badge-error" hx-swap-oob="true">4</span>
```

## Pattern: Notifications

### Toast Injection

```html
<!-- Toast container -->
<div id="toast-container" class="toast toast-end"></div>

<!-- Any HTMX action -->
<form hx-post="/api/tasks" hx-target="#task-list" hx-swap="beforeend"></form>
```

Server response with toast:

```html
<li class="task">New task</li>
<div id="toast-container" hx-swap-oob="beforeend">
  <div class="alert alert-success">Task created!</div>
</div>
```

### Alternative: HX-Trigger Header

```typescript
// Server-side
return new Response(html, {
  headers: {
    'HX-Trigger': JSON.stringify({
      notify: { message: 'Saved!', type: 'success' },
    }),
  },
});
```

Client listens:

```html
<div x-data @notify.window="showToast($event.detail)"></div>
```

## Pattern: Related Content

### Sidebar Update

```html
<!-- Main content -->
<main id="content">...</main>
<aside id="sidebar">
  <h3>Related Items</h3>
  <ul id="related-items">
    ...
  </ul>
</aside>

<!-- Navigate to new item -->
<a hx-get="/items/456" hx-target="#content">View Item</a>
```

Server response:

```html
<div id="content">Item 456 details...</div>
<ul id="related-items" hx-swap-oob="true">
  <li>Related to 456...</li>
</ul>
```

### Stats Dashboard

```html
<div hx-post="/api/orders" hx-target="#order-confirmation"></div>
```

Server response:

```html
<div>Order confirmed!</div>
<span id="total-orders" hx-swap-oob="true">1,247</span>
<span id="revenue-today" hx-swap-oob="true">$12,450</span>
<div id="recent-orders" hx-swap-oob="afterbegin">
  <tr>
    New order row...
  </tr>
</div>
```

## Pattern: Form Responses

### Clear Form + Show Success

```html
<form id="contact-form" hx-post="/api/contact">
  <input name="email" />
  <button>Submit</button>
</form>
<div id="form-messages"></div>
```

Server response:

```html
<form id="contact-form" hx-post="/api/contact" hx-swap-oob="true">
  <input name="email" value="" />
  <button>Submit</button>
</form>
<div id="form-messages" hx-swap-oob="true">
  <div class="alert alert-success">Message sent!</div>
</div>
```

## Server-Side Implementation

### TypeScript/Workers

```typescript
function withOOB(primaryHtml: string, oobElements: string[]): string {
  return primaryHtml + oobElements.join('');
}

// Usage
const response = withOOB(taskItem(newTask), [
  `<span id="task-count" hx-swap-oob="true">${count}</span>`,
  `<div id="toast" hx-swap-oob="beforeend">
      <div class="alert">Task added!</div>
    </div>`,
]);
```

### Template Helper

```typescript
function oob(id: string, content: string, swap = 'true'): string {
  return `<div id="${id}" hx-swap-oob="${swap}">${content}</div>`;
}

// Usage
const html = taskItem(task) + oob('task-count', '5');
```

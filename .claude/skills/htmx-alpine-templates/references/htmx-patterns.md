# HTMX Patterns Reference

## Table of Contents

1. [Core Attributes](#core-attributes)
2. [Swap Strategies](#swap-strategies)
3. [Triggers](#triggers)
4. [Loading States](#loading-states)
5. [Out-of-Band Updates](#out-of-band-updates)
6. [Response Headers](#response-headers)
7. [Common Patterns](#common-patterns)

## Core Attributes

### Request Methods

```html
<button hx-get="/api/data">GET</button>
<form hx-post="/api/create">POST</form>
<button hx-put="/api/update/1">PUT</button>
<button hx-patch="/api/partial/1">PATCH</button>
<button hx-delete="/api/remove/1">DELETE</button>
```

### Targeting

```html
<!-- By ID -->
<button hx-get="/data" hx-target="#result">Load</button>

<!-- Relative selectors -->
<button hx-get="/data" hx-target="this">Replace self</button>
<button hx-get="/data" hx-target="closest div">Closest ancestor</button>
<button hx-get="/data" hx-target="find .content">First descendant</button>
<button hx-get="/data" hx-target="next .sibling">Next sibling</button>
<button hx-get="/data" hx-target="previous .sibling">Previous sibling</button>
```

### Include Values

```html
<!-- Send extra values -->
<button hx-post="/api" hx-vals='{"key": "value"}'>Send</button>

<!-- Include other inputs -->
<button hx-post="/api" hx-include="[name='csrf']">Submit</button>

<!-- Include closest form -->
<button hx-post="/api" hx-include="closest form">Submit</button>
```

## Swap Strategies

```html
<!-- innerHTML (default): Replace target's children -->
<div hx-get="/partial" hx-swap="innerHTML">Loading...</div>

<!-- outerHTML: Replace entire target element -->
<div hx-get="/partial" hx-swap="outerHTML">Will be replaced</div>

<!-- beforeend: Append as last child -->
<ul hx-post="/items" hx-swap="beforeend">
  <li>Existing</li>
  <!-- New items here -->
</ul>

<!-- afterbegin: Prepend as first child -->
<ul hx-post="/items" hx-swap="afterbegin">
  <!-- New items here -->
  <li>Existing</li>
</ul>

<!-- beforebegin: Insert before target -->
<div hx-get="/item" hx-swap="beforebegin">Reference point</div>

<!-- afterend: Insert after target -->
<div hx-get="/item" hx-swap="afterend">Reference point</div>

<!-- delete: Remove target -->
<button hx-delete="/item/1" hx-target="closest .item" hx-swap="delete">Remove</button>

<!-- none: No swap (for side effects) -->
<button hx-post="/track" hx-swap="none">Track</button>
```

### Swap Modifiers

```html
<!-- Transition timing -->
<div hx-get="/data" hx-swap="innerHTML swap:500ms">Smooth swap</div>

<!-- Settle timing (for CSS transitions) -->
<div hx-get="/data" hx-swap="innerHTML settle:300ms">With settle</div>

<!-- Scroll behavior -->
<div hx-get="/data" hx-swap="innerHTML scroll:top">Scroll to top</div>
<div hx-get="/data" hx-swap="innerHTML show:bottom">Show bottom</div>

<!-- Focus behavior -->
<div hx-get="/form" hx-swap="innerHTML focus-scroll:true">Focus first input</div>
```

## Triggers

### Standard Events

```html
<button hx-get="/data" hx-trigger="click">Click (default)</button>
<input hx-get="/search" hx-trigger="change">On change</input>
<form hx-post="/save" hx-trigger="submit">On submit</form>
<div hx-get="/data" hx-trigger="load">On page load</div>
<div hx-get="/more" hx-trigger="revealed">When scrolled into view</div>
<div hx-get="/track" hx-trigger="intersect">On intersection</div>
```

### Modifiers

```html
<!-- Delay -->
<input hx-get="/search" hx-trigger="keyup delay:300ms" name="q" />

<!-- Throttle -->
<input hx-get="/search" hx-trigger="keyup throttle:500ms" name="q" />

<!-- Changed (only if value changed) -->
<input hx-get="/search" hx-trigger="keyup changed delay:300ms" name="q" />

<!-- Once -->
<div hx-get="/init" hx-trigger="load once">Load once</div>

<!-- From another element -->
<div hx-get="/data" hx-trigger="click from:#other-btn">Triggered by other</div>

<!-- Polling -->
<div hx-get="/notifications" hx-trigger="every 30s">Poll notifications</div>
```

### Combined Triggers

```html
<input
  hx-get="/search"
  hx-trigger="keyup changed delay:300ms, search"
  hx-target="#results"
  name="q"
/>
```

## Loading States

### Indicator Class

```html
<!-- Element with indicator -->
<button hx-get="/slow" hx-indicator="#spinner">
  Load Data
  <span id="spinner" class="loading loading-spinner htmx-indicator"></span>
</button>
```

### CSS Classes During Request

```css
/* Add to app.css */
.htmx-indicator {
  opacity: 0;
  transition: opacity 200ms ease-in;
}
.htmx-request .htmx-indicator,
.htmx-request.htmx-indicator {
  opacity: 1;
}
```

### Disable During Request

```html
<button hx-get="/api" hx-disabled-elt="this" class="btn">Submit</button>

<!-- Disable multiple elements -->
<form hx-post="/save" hx-disabled-elt="find input, find button"></form>
```

### Loading State Pattern

```html
<button hx-get="/api/action" class="btn btn-primary">
  <span class="htmx-indicator loading loading-spinner loading-sm"></span>
  <span class="[.htmx-request_&]:hidden">Submit</span>
  <span class="hidden [.htmx-request_&]:inline">Loading...</span>
</button>
```

## Out-of-Band Updates

Server can update multiple elements in single response:

```html
<!-- Main response swaps normally -->
<div id="main-content">Updated main content</div>

<!-- OOB elements swap themselves -->
<div id="sidebar" hx-swap-oob="true">Updated sidebar</div>
<div id="notification" hx-swap-oob="beforeend">
  <div class="alert">New notification</div>
</div>

<!-- OOB with different swap strategy -->
<div id="count" hx-swap-oob="innerHTML">42</div>
```

### Template Pattern for OOB

```typescript
export function taskCreatedResponse(task: Task, notificationCount: number): string {
  return `
    ${taskItem(task)}
    <span id="notification-count" hx-swap-oob="true">${notificationCount}</span>
  `;
}
```

## Response Headers

### Trigger Client Events

```typescript
return new Response(html, {
  headers: {
    'Content-Type': 'text/html',
    'HX-Trigger': JSON.stringify({
      notify: { message: 'Saved!', type: 'success', id: Date.now() },
    }),
  },
});
```

### Other Response Headers

```typescript
// Redirect
headers: { "HX-Redirect": "/dashboard" }

// Refresh page
headers: { "HX-Refresh": "true" }

// Push URL to history
headers: { "HX-Push-Url": "/new-url" }

// Replace URL (no history entry)
headers: { "HX-Replace-Url": "/current" }

// Retarget swap
headers: { "HX-Retarget": "#other-element" }

// Change swap strategy
headers: { "HX-Reswap": "outerHTML" }
```

## Common Patterns

### Form with Reset on Success

```html
<form
  hx-post="/api/items"
  hx-target="#item-list"
  hx-swap="beforeend"
  hx-on::after-request="if(event.detail.successful) this.reset()"
>
  <input type="text" name="title" required />
  <button type="submit" class="btn btn-primary">Add</button>
</form>
```

### Inline Edit

```html
<!-- Display mode -->
<div class="editable" hx-get="/edit/1" hx-trigger="dblclick" hx-swap="outerHTML">Click to edit</div>

<!-- Edit mode (returned by server) -->
<form hx-put="/save/1" hx-swap="outerHTML">
  <input type="text" name="value" value="Current" />
  <button type="submit">Save</button>
  <button hx-get="/view/1" hx-swap="outerHTML">Cancel</button>
</form>
```

### Infinite Scroll

```html
<div id="items">
  <!-- Items here -->
  <div hx-get="/items?page=2" hx-trigger="revealed" hx-swap="outerHTML">
    <span class="loading loading-spinner"></span>
  </div>
</div>
```

### Active Search

```html
<input
  type="search"
  name="q"
  hx-get="/search"
  hx-trigger="input changed delay:300ms, search"
  hx-target="#search-results"
  hx-indicator="#search-spinner"
  placeholder="Search..."
/>
<span id="search-spinner" class="htmx-indicator loading loading-spinner"></span>
<div id="search-results"></div>
```

### Boosted Navigation

```html
<!-- Convert links to AJAX, swap body only -->
<nav hx-boost="true">
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
</nav>
```

### Confirmation Dialog

```html
<button
  hx-delete="/api/items/1"
  hx-target="closest .item"
  hx-swap="outerHTML"
  hx-confirm="Are you sure you want to delete this item?"
>
  Delete
</button>
```

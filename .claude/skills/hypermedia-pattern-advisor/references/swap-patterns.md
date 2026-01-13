# HTMX Swap Strategies

## Table of Contents

- [Core Swap Types](#core-swap-types)
- [Swap Modifiers](#swap-modifiers)
- [Pattern: List Operations](#pattern-list-operations)
- [Pattern: Item Updates](#pattern-item-updates)
- [Pattern: Forms](#pattern-forms)
- [Pattern: Navigation](#pattern-navigation)

## Core Swap Types

| Strategy      | Before                | After                           | Use Case                      |
| ------------- | --------------------- | ------------------------------- | ----------------------------- |
| `innerHTML`   | `<div>old</div>`      | `<div>new</div>`                | Update container contents     |
| `outerHTML`   | `<div>old</div>`      | `<span>new</span>`              | Replace entire element        |
| `beforeend`   | `<ul><li>1</li></ul>` | `<ul><li>1</li><li>2</li></ul>` | Append to list                |
| `afterbegin`  | `<ul><li>1</li></ul>` | `<ul><li>0</li><li>1</li></ul>` | Prepend to list               |
| `beforebegin` | `<div>target</div>`   | `<p>new</p><div>target</div>`   | Insert before                 |
| `afterend`    | `<div>target</div>`   | `<div>target</div><p>new</p>`   | Insert after                  |
| `delete`      | `<div>target</div>`   | (removed)                       | Delete element                |
| `none`        | N/A                   | N/A                             | No swap, use for side effects |

## Swap Modifiers

```html
<!-- Timing: swap after delay -->
<div hx-get="/data" hx-swap="innerHTML swap:500ms">
  <!-- Settle: delay before settling (for animations) -->
  <div hx-get="/data" hx-swap="innerHTML settle:500ms">
    <!-- Scroll: scroll behavior after swap -->
    <div hx-get="/data" hx-swap="innerHTML scroll:top">
      <div hx-get="/data" hx-swap="innerHTML scroll:bottom">
        <!-- Show: ensure element visible after swap -->
        <div hx-get="/data" hx-swap="innerHTML show:top">
          <!-- Focus scroll: prevent focus-triggered scrolling -->
          <div hx-get="/data" hx-swap="innerHTML focus-scroll:false"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Pattern: List Operations

### Add Item to End

```html
<form hx-post="/api/items" hx-target="#item-list" hx-swap="beforeend">
  <input name="title" />
  <button>Add</button>
</form>
<ul id="item-list">
  <li>Existing item</li>
</ul>
```

### Add Item to Beginning

```html
<form hx-post="/api/items" hx-target="#item-list" hx-swap="afterbegin"></form>
```

### Infinite Scroll

```html
<ul id="item-list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<div hx-get="/api/items?page=2" hx-trigger="revealed" hx-target="#item-list" hx-swap="beforeend">
  Loading...
</div>
```

## Pattern: Item Updates

### Update Single Item (Replace)

```html
<li class="item" id="item-123">
  <span>Task title</span>
  <button hx-patch="/api/items/123" hx-target="closest .item" hx-swap="outerHTML">Toggle</button>
</li>
```

Server returns complete new `<li>` element.

### Delete Item

```html
<button
  hx-delete="/api/items/123"
  hx-target="closest .item"
  hx-swap="outerHTML"
  hx-confirm="Delete?"
>
  Delete
</button>
```

Server returns empty response; element removed.

Alternative using `delete` swap:

```html
<button hx-delete="/api/items/123" hx-target="closest .item" hx-swap="delete"></button>
```

## Pattern: Forms

### Replace Form with Success

```html
<form hx-post="/api/contact" hx-swap="outerHTML">
  <input name="email" />
  <button>Subscribe</button>
</form>
```

Server returns: `<div class="alert">Thanks!</div>`

### Keep Form, Show Errors

```html
<form hx-post="/api/login" hx-target="#form-errors" hx-swap="innerHTML">
  <div id="form-errors"></div>
  <input name="email" />
  <button>Login</button>
</form>
```

### Reset Form After Success

```html
<form
  hx-post="/api/items"
  hx-target="#item-list"
  hx-swap="beforeend"
  hx-on::after-request="if(event.detail.successful) this.reset()"
></form>
```

## Pattern: Navigation

### Boost Links (SPA-style)

```html
<nav hx-boost="true">
  <a href="/page1">Page 1</a>
  <a href="/page2">Page 2</a>
</nav>
```

Swaps `<body>` content, updates URL.

### Partial Page Update

```html
<a
  href="/section"
  hx-get="/section"
  hx-target="#main-content"
  hx-swap="innerHTML"
  hx-push-url="true"
>
  Load Section
</a>
```

## Swap with Animation

```html
<!-- Fade out old, fade in new -->
<div hx-get="/content" hx-swap="innerHTML transition:true"></div>
```

CSS (with View Transitions API):

```css
::view-transition-old(root) {
  animation: fade-out 0.2s;
}
::view-transition-new(root) {
  animation: fade-in 0.2s;
}
```

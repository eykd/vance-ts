# HTMX Trigger Patterns

## Table of Contents

- [Basic Triggers](#basic-triggers)
- [Modifiers](#modifiers)
- [Debounce and Throttle](#debounce-and-throttle)
- [Visibility Triggers](#visibility-triggers)
- [Polling](#polling)
- [Custom Events](#custom-events)

## Basic Triggers

```html
<!-- Default triggers (can be omitted) -->
<button hx-get="/api/data">Click (default)</button>
<form hx-post="/api/submit">Submit (default)</form>
<input hx-get="/search" hx-trigger="change" />

<!-- Explicit triggers -->
<div hx-get="/data" hx-trigger="click">Click anywhere</div>
<input hx-get="/search" hx-trigger="keyup" />
<select hx-get="/filter" hx-trigger="change"></select>
```

## Modifiers

```html
<!-- changed: Only fire if value changed -->
<input hx-get="/search" hx-trigger="keyup changed" />

<!-- once: Fire only first time -->
<div hx-get="/track" hx-trigger="click once">
  <!-- from: Listen on different element -->
  <div hx-get="/update" hx-trigger="click from:body">
    <!-- target: CSS selector for event source -->
    <div hx-get="/update" hx-trigger="click from:closest form">
      <!-- consume: Stop event propagation -->
      <button hx-get="/action" hx-trigger="click consume"></button>
    </div>
  </div>
</div>
```

## Debounce and Throttle

```html
<!-- Debounce: Wait for pause in events -->
<input type="search" hx-get="/search" hx-trigger="keyup changed delay:300ms" name="q" />

<!-- Throttle: Limit event frequency -->
<div hx-get="/position" hx-trigger="mousemove throttle:100ms"></div>
```

**Use debounce for:** Search inputs, form auto-save
**Use throttle for:** Mouse tracking, scroll events, resize

## Visibility Triggers

```html
<!-- revealed: Fire when element scrolls into view -->
<div hx-get="/more-content" hx-trigger="revealed" hx-swap="afterend">Loading more...</div>

<!-- intersect: IntersectionObserver-based -->
<img hx-get="/image/123" hx-trigger="intersect once" hx-swap="outerHTML" />

<!-- intersect with threshold -->
<div hx-get="/track" hx-trigger="intersect once threshold:0.5"></div>
```

**Use `revealed` for:** Infinite scroll, lazy loading
**Use `intersect` for:** Analytics tracking, progressive loading

## Polling

```html
<!-- Poll every N seconds -->
<div hx-get="/notifications/count" hx-trigger="every 30s" hx-swap="innerHTML">0</div>

<!-- Conditional polling with server control -->
<!-- Server returns 286 status to stop polling -->
<div hx-get="/job/status" hx-trigger="every 2s">Processing...</div>
```

**Polling use cases:**

- Notification counts
- Job/task status
- Live data feeds
- Presence indicators

## Custom Events

```html
<!-- Trigger on custom event -->
<div hx-get="/refresh" hx-trigger="refreshData from:body">
  <!-- Dispatch from JavaScript -->
  <script>
    document.body.dispatchEvent(new Event('refreshData'));
  </script>

  <!-- Trigger from Alpine -->
  <button @click="$dispatch('refreshData')">Refresh</button>
</div>
```

## Multiple Triggers

```html
<!-- Multiple triggers on same element -->
<input hx-get="/search" hx-trigger="keyup changed delay:300ms, search" />
```

## Server-Sent Events

```html
<!-- SSE trigger -->
<div hx-ext="sse" sse-connect="/events" hx-trigger="sse:message" hx-get="/latest"></div>
```

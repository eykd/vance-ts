# Loading Patterns

## Table of Contents

- [Loading Indicators](#loading-indicators)
- [Button Loading States](#button-loading-states)
- [Lazy Loading Content](#lazy-loading-content)
- [Infinite Scroll](#infinite-scroll)
- [Optimistic UI Updates](#optimistic-ui-updates)
- [Skeleton Loaders](#skeleton-loaders)

---

## Loading Indicators

### CSS Setup (Required)

```css
.htmx-indicator {
  opacity: 0;
  transition: opacity 200ms ease-in;
}
.htmx-request .htmx-indicator,
.htmx-request.htmx-indicator {
  opacity: 1;
}
```

### Basic Indicator

```html
<button hx-get="/app/_/data" hx-target="#result">
  <span class="htmx-indicator loading loading-spinner loading-sm"></span>
  Load Data
</button>
```

### External Indicator

```html
<button hx-get="/app/_/data" hx-target="#result" hx-indicator="#global-spinner">Load</button>
<span id="global-spinner" class="htmx-indicator loading loading-spinner"></span>
```

### Hide Text During Loading

```html
<button hx-get="/app/_/data" hx-target="#result">
  <span class="htmx-indicator loading loading-spinner loading-sm"></span>
  <span class="[.htmx-request_&]:hidden">Load Data</span>
</button>
```

---

## Button Loading States

### With Alpine Coordination

```html
<button
  hx-post="/app/_/action"
  hx-target="#result"
  x-data="{ loading: false }"
  @htmx:before-request="loading = true"
  @htmx:after-request="loading = false"
  :disabled="loading"
  :class="{ 'opacity-50 cursor-wait': loading }"
>
  <span x-show="!loading">Submit</span>
  <span x-show="loading" class="loading loading-spinner loading-sm"></span>
</button>
```

### Disable During Request

```html
<button hx-post="/app/_/submit" hx-disabled-elt="this" class="btn btn-primary">Submit</button>
```

### Disable Multiple Elements

```html
<form hx-post="/app/_/submit" hx-disabled-elt="find button, find input">
  <input type="text" name="title" />
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
```

---

## Lazy Loading Content

### Load on Page Ready

```html
<div hx-get="/app/_/dashboard-stats" hx-trigger="load" hx-swap="innerHTML">
  <span class="loading loading-spinner"></span>
</div>
```

### Load When Visible (Revealed)

```html
<div hx-get="/app/_/below-fold-content" hx-trigger="revealed" hx-swap="innerHTML">
  <span class="loading loading-spinner"></span>
</div>
```

### Load with Intersection Observer Options

```html
<div hx-get="/app/_/content" hx-trigger="intersect once threshold:0.5" hx-swap="innerHTML">
  <!-- Loads when 50% visible, fires only once -->
</div>
```

### Delayed Load (Staggered)

```html
<div hx-get="/app/_/section-1" hx-trigger="load" hx-swap="innerHTML"></div>
<div hx-get="/app/_/section-2" hx-trigger="load delay:100ms" hx-swap="innerHTML"></div>
<div hx-get="/app/_/section-3" hx-trigger="load delay:200ms" hx-swap="innerHTML"></div>
```

---

## Infinite Scroll

### Basic Pattern

```html
<ul id="item-list">
  <!-- Initial items -->
  <li>Item 1</li>
  <li>Item 2</li>
  <!-- Sentinel element -->
  <li
    hx-get="/app/_/items?page=2"
    hx-trigger="revealed"
    hx-swap="outerHTML"
    hx-indicator="#load-more-spinner"
  >
    <span id="load-more-spinner" class="htmx-indicator loading loading-spinner"></span>
  </li>
</ul>
```

**Server returns:** More items + new sentinel (or nothing when done):

```html
<li>Item 3</li>
<li>Item 4</li>
<li>Item 5</li>
<!-- Next page sentinel -->
<li hx-get="/app/_/items?page=3" hx-trigger="revealed" hx-swap="outerHTML">
  <span class="loading loading-spinner"></span>
</li>
```

### With Cursor-Based Pagination

```html
<div id="feed">
  <!-- Items here -->

  <div
    hx-get="/app/_/feed?cursor=abc123"
    hx-trigger="revealed"
    hx-swap="outerHTML"
    hx-target="this"
  >
    <span class="loading loading-spinner"></span>
  </div>
</div>
```

**Server handler:**

```typescript
async function getFeed(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  const { items, nextCursor } = await fetchItems(cursor, 20);

  let html = items.map((item) => `<div class="feed-item">${item.title}</div>`).join('');

  if (nextCursor) {
    html += `
      <div hx-get="/app/_/feed?cursor=${nextCursor}"
           hx-trigger="revealed"
           hx-swap="outerHTML">
        <span class="loading loading-spinner"></span>
      </div>`;
  }

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
```

### Manual "Load More" Button

```html
<ul id="item-list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<button
  hx-get="/app/_/items?page=2"
  hx-target="#item-list"
  hx-swap="beforeend"
  hx-indicator="#load-more-spinner"
  class="btn btn-outline"
>
  <span id="load-more-spinner" class="htmx-indicator loading loading-spinner loading-sm"></span>
  Load More
</button>
```

---

## Optimistic UI Updates

### Checkbox Toggle

```html
<div
  x-data="{ completed: false }"
  class="flex items-center gap-2"
  :class="{ 'opacity-50 line-through': completed }"
>
  <input
    type="checkbox"
    class="checkbox"
    :checked="completed"
    @click="completed = !completed"
    hx-patch="/app/_/tasks/123/toggle"
    hx-swap="none"
    @htmx:after-request="if(!$event.detail.successful) completed = !completed"
  />
  <span>Task title</span>
</div>
```

### Like Button

```html
<button
  x-data="{ liked: false, count: 42 }"
  @click="liked = !liked; count += liked ? 1 : -1"
  hx-post="/app/_/posts/123/like"
  hx-swap="none"
  @htmx:after-request="if(!$event.detail.successful) { liked = !liked; count += liked ? 1 : -1; }"
  :class="{ 'text-red-500': liked }"
>
  <span x-text="liked ? '❤️' : '🤍'"></span>
  <span x-text="count"></span>
</button>
```

### Instant Delete with Undo

```html
<li
  x-data="{ deleted: false, undoTimeout: null }"
  x-show="!deleted"
  x-transition:leave="transition ease-in duration-300"
  x-transition:leave-start="opacity-100"
  x-transition:leave-end="opacity-0"
  class="task-item"
>
  <span>Task title</span>
  <button
    @click="
    deleted = true;
    undoTimeout = setTimeout(() => {
      htmx.ajax('DELETE', '/app/_/tasks/123', { target: 'this', swap: 'none' });
    }, 3000);
  "
  >
    Delete
  </button>

  <!-- Undo toast shown when deleted -->
  <div
    x-show="deleted"
    x-transition
    class="toast toast-end"
    @click="deleted = false; clearTimeout(undoTimeout)"
  >
    <div class="alert">
      <span>Deleted</span>
      <button class="btn btn-sm">Undo</button>
    </div>
  </div>
</li>
```

---

## Skeleton Loaders

### Card Skeleton

```html
<div hx-get="/app/_/card-content" hx-trigger="load" hx-swap="outerHTML">
  <div class="card animate-pulse">
    <div class="card-body">
      <div class="h-4 bg-base-300 rounded w-3/4 mb-4"></div>
      <div class="h-3 bg-base-300 rounded w-full mb-2"></div>
      <div class="h-3 bg-base-300 rounded w-5/6"></div>
    </div>
  </div>
</div>
```

### Table Skeleton

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody hx-get="/app/_/users" hx-trigger="load" hx-swap="innerHTML">
    <template x-for="i in 5">
      <tr class="animate-pulse">
        <td><div class="h-4 bg-base-300 rounded w-24"></div></td>
        <td><div class="h-4 bg-base-300 rounded w-32"></div></td>
        <td><div class="h-4 bg-base-300 rounded w-16"></div></td>
      </tr>
    </template>
  </tbody>
</table>
```

### With Alpine Fallback State

```html
<div
  x-data="{ loaded: false }"
  hx-get="/app/_/content"
  hx-trigger="load"
  hx-swap="innerHTML"
  @htmx:after-swap="loaded = true"
>
  <template x-if="!loaded">
    <div class="animate-pulse">
      <div class="h-8 bg-base-300 rounded w-1/2 mb-4"></div>
      <div class="h-4 bg-base-300 rounded w-full mb-2"></div>
      <div class="h-4 bg-base-300 rounded w-3/4"></div>
    </div>
  </template>
</div>
```

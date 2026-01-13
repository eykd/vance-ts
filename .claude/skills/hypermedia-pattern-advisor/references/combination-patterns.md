# HTMX + Alpine.js Combination Patterns

## Table of Contents

- [State Preservation](#state-preservation)
- [Event Bridge](#event-bridge)
- [Pattern: Load then Filter](#pattern-load-then-filter)
- [Pattern: Optimistic UI](#pattern-optimistic-ui)
- [Pattern: Form Validation](#pattern-form-validation)
- [Pattern: Global Loading State](#pattern-global-loading-state)
- [Pattern: Modal with Server Content](#pattern-modal-with-server-content)

## State Preservation

When HTMX swaps content containing Alpine components, state is lost. Use Alpine Morph to preserve state.

### Setup

```html
<head>
  <script src="/js/htmx.min.js"></script>
  <script src="/js/htmx-ext-alpine-morph.js"></script>
  <script defer src="/js/alpine-morph.min.js"></script>
  <script defer src="/js/alpine.min.js"></script>
</head>
```

### Usage

```html
<div hx-get="/api/component" hx-swap="morph" hx-ext="alpine-morph">
  <div x-data="{ count: 0 }">
    <p>Count: <span x-text="count"></span></p>
    <button @click="count++">+</button>
    <!-- count preserved across HTMX swaps -->
  </div>
</div>
```

## Event Bridge

### Listen to HTMX Events in Alpine

```html
<div
  x-data="{ loading: false, error: null }"
  @htmx:before-request.window="loading = true; error = null"
  @htmx:after-request.window="loading = false"
  @htmx:response-error.window="error = 'Request failed'"
>
  <div x-show="loading" class="loading"></div>
  <div x-show="error" class="alert alert-error" x-text="error"></div>
</div>
```

### Key HTMX Events

| Event                 | When             | Use For            |
| --------------------- | ---------------- | ------------------ |
| `htmx:before-request` | Request starting | Show loading       |
| `htmx:after-request`  | Request complete | Hide loading       |
| `htmx:response-error` | Non-2xx response | Show error         |
| `htmx:send-error`     | Network failure  | Show offline       |
| `htmx:after-swap`     | DOM updated      | Re-init components |

### Trigger HTMX from Alpine

```html
<button @click="htmx.trigger('#target', 'refresh')">Refresh</button>
<div id="target" hx-get="/data" hx-trigger="refresh"></div>
```

## Pattern: Load then Filter

Load data with HTMX, filter client-side with Alpine.

```html
<div x-data="{ filter: '' }">
  <input type="text" x-model="filter" placeholder="Filter items..." class="input" />

  <ul id="item-list" hx-get="/api/items" hx-trigger="load">
    <li class="loading">Loading...</li>
  </ul>
</div>

<!-- Server returns items with data attributes -->
<li data-name="Apple" x-show="'apple'.includes(filter.toLowerCase())">Apple</li>
<li data-name="Banana" x-show="'banana'.includes(filter.toLowerCase())">Banana</li>
```

Better approach with x-data on parent:

```html
<div
  x-data="{ filter: '', items: [] }"
  @htmx:after-swap="items = [...$el.querySelectorAll('[data-item]')]"
>
  <input x-model="filter" />
  <ul hx-get="/api/items" hx-trigger="load">
    <template
      x-for="item in items.filter(i => 
      i.dataset.name.toLowerCase().includes(filter.toLowerCase())
    )"
    >
      <li x-text="item.dataset.name"></li>
    </template>
  </ul>
</div>
```

## Pattern: Optimistic UI

Update UI immediately, revert if server fails.

```html
<div
  x-data="{ 
  optimisticDone: false,
  originalState: false,
  toggle() {
    this.originalState = this.optimisticDone;
    this.optimisticDone = !this.optimisticDone;
  },
  revert() {
    this.optimisticDone = this.originalState;
  }
}"
>
  <input
    type="checkbox"
    :checked="optimisticDone"
    @click="toggle()"
    hx-patch="/api/tasks/123/toggle"
    hx-swap="none"
    @htmx:response-error="revert()"
  />
  <span :class="{ 'line-through': optimisticDone }">Task title</span>
</div>
```

## Pattern: Form Validation

Alpine validates client-side, HTMX submits.

```html
<form
  hx-post="/api/tasks"
  hx-target="#task-list"
  hx-swap="beforeend"
  x-data="{
        title: '',
        errors: {},
        validate() {
          this.errors = {};
          if (this.title.length < 3) {
            this.errors.title = 'Min 3 characters';
          }
          return Object.keys(this.errors).length === 0;
        }
      }"
  @submit="if (!validate()) $event.preventDefault()"
>
  <div class="form-control">
    <input type="text" name="title" x-model="title" :class="{ 'input-error': errors.title }" />
    <span x-show="errors.title" x-text="errors.title" class="text-error"></span>
  </div>

  <button type="submit" :disabled="title.length === 0">Add</button>
</form>
```

## Pattern: Global Loading State

```html
<div
  x-data="{ 
  activeRequests: 0,
  get isLoading() { return this.activeRequests > 0; }
}"
  @htmx:before-request.window="activeRequests++"
  @htmx:after-request.window="activeRequests--"
>
  <!-- Global progress bar -->
  <div
    x-show="isLoading"
    x-transition
    class="fixed top-0 left-0 w-full h-1 bg-primary animate-pulse"
  ></div>

  <!-- Page content -->
  <main :class="{ 'opacity-50 pointer-events-none': isLoading }">
    <!-- ... -->
  </main>
</div>
```

## Pattern: Modal with Server Content

```html
<div x-data="{ open: false }">
  <!-- Trigger -->
  <button
    @click="open = true"
    hx-get="/api/tasks/123/edit"
    hx-target="#modal-content"
    hx-swap="innerHTML"
  >
    Edit
  </button>

  <!-- Modal -->
  <div x-show="open" x-transition class="modal modal-open" @keydown.escape.window="open = false">
    <div class="modal-box" @click.stop>
      <div id="modal-content">
        <span class="loading"></span>
      </div>
      <div class="modal-action">
        <button @click="open = false">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="open = false"></div>
  </div>
</div>
```

Close modal on successful save:

```html
<form
  hx-post="/api/tasks/123"
  hx-target="#task-123"
  hx-swap="outerHTML"
  @htmx:after-request="if($event.detail.successful) $dispatch('close-modal')"
></form>
```

Parent listens:

```html
<div x-data="{ open: false }" @close-modal.window="open = false"></div>
```

## Pattern: Infinite Scroll with Loading State

```html
<div
  x-data="{ 
  page: 1, 
  loading: false, 
  hasMore: true 
}"
>
  <ul id="items">
    <!-- Initial items -->
  </ul>

  <div
    x-show="hasMore"
    x-intersect="if(!loading) { loading = true; $el.click(); }"
    hx-get="/api/items"
    hx-vals="js:{page: page}"
    hx-target="#items"
    hx-swap="beforeend"
    @htmx:after-request="
         loading = false; 
         page++; 
         hasMore = $event.detail.xhr.getResponseHeader('X-Has-More') === 'true'
       "
  >
    <span x-show="loading" class="loading"></span>
    <span x-show="!loading">Load more</span>
  </div>

  <div x-show="!hasMore" class="text-center">No more items</div>
</div>
```

# Combined HTMX + Alpine.js Patterns

## Table of Contents

1. [Integration Principles](#integration-principles)
2. [HTMX Events in Alpine](#htmx-events-in-alpine)
3. [Optimistic UI](#optimistic-ui)
4. [Load with HTMX, Filter with Alpine](#load-with-htmx-filter-with-alpine)
5. [Form Patterns](#form-patterns)
6. [State Preservation](#state-preservation)
7. [Complete Examples](#complete-examples)

## Integration Principles

### When to Use Each

| Need                      | Use    | Rationale                      |
| ------------------------- | ------ | ------------------------------ |
| Fetch/mutate server data  | HTMX   | Server is source of truth      |
| Toggle UI element         | Alpine | Pure client state              |
| Form submission           | HTMX   | Server validation              |
| Form validation feedback  | Alpine | Instant response               |
| List filtering (DB query) | HTMX   | Server filters data            |
| List filtering (client)   | Alpine | Already-loaded data            |
| Loading states            | Both   | Alpine shows, HTMX triggers    |
| Notifications             | Both   | HTMX triggers, Alpine displays |

### Communication Flow

```
User Action → Alpine (instant UI) → HTMX (server request) → Server
                                                              ↓
Alpine (update UI) ← HTMX (swap HTML) ← Server (return HTML)
```

## HTMX Events in Alpine

### Listen to HTMX Events

```html
<div
  x-data="{ loading: false, error: null }"
  @htmx:before-request.window="loading = true"
  @htmx:after-request.window="loading = false"
  @htmx:response-error.window="error = 'Request failed'"
  @htmx:send-error.window="error = 'Network error'"
>
  <!-- Global loading bar -->
  <div x-show="loading" class="fixed top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>

  <!-- Error toast -->
  <div x-show="error" x-transition class="alert alert-error fixed bottom-4 right-4">
    <span x-text="error"></span>
    <button @click="error = null" class="btn btn-ghost btn-xs">✕</button>
  </div>
</div>
```

### Scoped HTMX Events

```html
<form
  hx-post="/api/save"
  x-data="{ saving: false }"
  @htmx:before-request="saving = true"
  @htmx:after-request="saving = false"
>
  <input type="text" name="title" :disabled="saving" />
  <button type="submit" :disabled="saving" class="btn btn-primary">
    <span x-show="!saving">Save</span>
    <span x-show="saving" class="loading loading-spinner loading-sm"></span>
  </button>
</form>
```

### Custom Event Bridge

```html
<!-- Server triggers custom event via HX-Trigger header -->
<!-- Handler: headers["HX-Trigger"] = '{"taskCreated": {"id": "123"}}' -->

<div x-data="{ tasks: [] }" @task-created.window="tasks.unshift($event.detail)">
  <template x-for="task in tasks" :key="task.id">
    <div x-text="task.id"></div>
  </template>
</div>
```

## Optimistic UI

### Checkbox Toggle

```html
<div x-data="{ checked: ${task.completed}, pending: false }">
  <input
    type="checkbox"
    :checked="checked"
    :disabled="pending"
    @click="checked = !checked; pending = true"
    hx-patch="/api/tasks/${task.id}/toggle"
    hx-swap="none"
    @htmx:after-request="pending = false; if(!$event.detail.successful) checked = !checked"
    class="checkbox"
  />
  <span :class="{ 'line-through opacity-60': checked }"> ${escapeHtml(task.title)} </span>
</div>
```

### Button with Optimistic Disable

```html
<button
  x-data="{ clicked: false }"
  :class="{ 'btn-disabled': clicked }"
  @click="clicked = true"
  hx-post="/api/action"
  hx-swap="outerHTML"
  @htmx:after-request="if(!$event.detail.successful) clicked = false"
  class="btn btn-primary"
>
  <span x-show="!clicked">Submit</span>
  <span x-show="clicked" class="loading loading-spinner loading-sm"></span>
</button>
```

### Optimistic Delete

```html
<li
  x-data="{ deleting: false }"
  :class="{ 'opacity-50 pointer-events-none': deleting }"
  class="task-item"
>
  <span>${escapeHtml(task.title)}</span>
  <button
    @click="deleting = true"
    hx-delete="/api/tasks/${task.id}"
    hx-target="closest .task-item"
    hx-swap="outerHTML"
    @htmx:after-request="if(!$event.detail.successful) deleting = false"
    class="btn btn-ghost btn-sm"
  >
    <span x-show="!deleting">Delete</span>
    <span x-show="deleting" class="loading loading-spinner loading-xs"></span>
  </button>
</li>
```

## Load with HTMX, Filter with Alpine

### Pattern: Server Load, Client Filter

```html
<div
  x-data="{ filter: '', items: [] }"
  @htmx:after-swap="items = Array.from($el.querySelectorAll('[data-item]')).map(el => ({
       el,
       searchable: el.dataset.searchable.toLowerCase()
     }))"
>
  <!-- Client-side filter -->
  <input
    type="text"
    x-model="filter"
    placeholder="Filter loaded items..."
    class="input input-bordered w-full mb-4"
  />

  <!-- HTMX loads initial data -->
  <div id="items" hx-get="/api/items" hx-trigger="load" hx-swap="innerHTML">
    <div class="loading loading-spinner"></div>
  </div>
</div>

<!-- Each item returned by server includes data attributes -->
<!-- Template partial:
<div data-item data-searchable="${escapeHtml(item.title + ' ' + item.description)}">
  ${escapeHtml(item.title)}
</div>
-->
```

### Simpler: Filter Using x-show

```html
<div x-data="{ filter: '' }">
  <input type="text" x-model="filter" placeholder="Filter..." class="input input-bordered mb-4" />

  <ul hx-get="/api/items" hx-trigger="load" hx-swap="innerHTML">
    <!-- Server returns items with data-name attribute -->
    <!-- Client filters visibility -->
  </ul>
</div>

<!-- Server partial returns: -->
<li
  x-show="!filter || '${item.name.toLowerCase()}'.includes(filter.toLowerCase())"
  x-transition
  data-name="${escapeHtml(item.name)}"
>
  ${escapeHtml(item.name)}
</li>
```

## Form Patterns

### Client Validation + Server Submit

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
          if (this.title.length < 3) this.errors.title = 'Min 3 characters';
          if (this.title.length > 100) this.errors.title = 'Max 100 characters';
          return Object.keys(this.errors).length === 0;
        }
      }"
  @submit="if (!validate()) $event.preventDefault()"
  @htmx:after-request="if($event.detail.successful) { title = ''; errors = {}; }"
  class="space-y-4"
>
  <div class="form-control">
    <label class="label"><span class="label-text">Title</span></label>
    <input
      type="text"
      name="title"
      x-model="title"
      @input="if(errors.title) validate()"
      class="input input-bordered"
      :class="{ 'input-error': errors.title }"
    />
    <label class="label" x-show="errors.title">
      <span class="label-text-alt text-error" x-text="errors.title"></span>
    </label>
  </div>

  <button type="submit" :disabled="title.length === 0" class="btn btn-primary">Add Task</button>
</form>
```

### Multi-step Form

```html
<div
  x-data="{
  step: 1,
  data: { name: '', email: '', plan: '' },
  nextStep() { if (this.validateStep()) this.step++ },
  prevStep() { this.step-- },
  validateStep() {
    // Step-specific validation
    return true;
  }
}"
>
  <!-- Step indicators -->
  <ul class="steps mb-8">
    <li class="step" :class="{ 'step-primary': step >= 1 }">Info</li>
    <li class="step" :class="{ 'step-primary': step >= 2 }">Plan</li>
    <li class="step" :class="{ 'step-primary': step >= 3 }">Confirm</li>
  </ul>

  <!-- Step 1 -->
  <div x-show="step === 1">
    <input x-model="data.name" placeholder="Name" class="input input-bordered w-full mb-4" />
    <input x-model="data.email" placeholder="Email" class="input input-bordered w-full mb-4" />
    <button @click="nextStep" class="btn btn-primary">Next</button>
  </div>

  <!-- Step 2 -->
  <div x-show="step === 2">
    <select x-model="data.plan" class="select select-bordered w-full mb-4">
      <option value="">Select plan</option>
      <option value="basic">Basic</option>
      <option value="pro">Pro</option>
    </select>
    <button @click="prevStep" class="btn">Back</button>
    <button @click="nextStep" class="btn btn-primary">Next</button>
  </div>

  <!-- Step 3: Submit to server -->
  <div x-show="step === 3">
    <div class="card bg-base-200 p-4 mb-4">
      <p>Name: <span x-text="data.name"></span></p>
      <p>Email: <span x-text="data.email"></span></p>
      <p>Plan: <span x-text="data.plan"></span></p>
    </div>
    <button @click="prevStep" class="btn">Back</button>
    <button hx-post="/api/signup" hx-vals="js:data" hx-target="#result" class="btn btn-primary">
      Submit
    </button>
  </div>
</div>
```

## State Preservation

### Alpine Morph for HTMX Swaps

When HTMX swaps content containing Alpine components, state is lost. Use morph extension:

```html
<head>
  <script src="/js/htmx.min.js"></script>
  <script src="https://unpkg.com/htmx-ext-alpine-morph@2.0.0/alpine-morph.js"></script>
  <script src="https://unpkg.com/@alpinejs/morph@3.x.x/dist/cdn.min.js" defer></script>
  <script src="/js/alpine.min.js" defer></script>
</head>

<!-- Use morph swap -->
<div hx-get="/api/component" hx-swap="morph" hx-ext="alpine-morph">
  <div x-data="{ count: 0 }">
    <p>Count: <span x-text="count"></span></p>
    <button @click="count++">+</button>
    <!-- count preserved across HTMX swaps -->
  </div>
</div>
```

### Store Persistent State

```javascript
// State survives HTMX swaps
Alpine.store('ui', {
  sidebarOpen: true,
  theme: 'light',
});
```

```html
<div x-data @click="$store.ui.sidebarOpen = !$store.ui.sidebarOpen">Toggle Sidebar</div>
<aside x-show="$store.ui.sidebarOpen">Sidebar content</aside>
```

## Complete Examples

### Task Item with All Patterns

```typescript
export function taskItem(task: Task): string {
  const id = escapeHtml(task.id);
  const title = escapeHtml(task.title);
  const completed = task.isCompleted;

  return `
<li class="task-item flex items-center gap-3 p-4 bg-base-200 rounded-lg"
    x-data="{ 
      completed: ${completed},
      deleting: false,
      editing: false,
      editTitle: '${title}'
    }">
  
  <!-- Checkbox with optimistic update -->
  <input type="checkbox"
         class="checkbox checkbox-primary"
         :checked="completed"
         @click="completed = !completed"
         hx-patch="/api/tasks/${id}/toggle"
         hx-swap="none"
         @htmx:after-request="if(!$event.detail.successful) completed = !completed">
  
  <!-- Title (view mode) -->
  <span x-show="!editing"
        @dblclick="editing = true; $nextTick(() => $refs.editInput.focus())"
        class="flex-1 cursor-pointer"
        :class="{ 'line-through opacity-60': completed }">
    ${title}
  </span>
  
  <!-- Title (edit mode) -->
  <form x-show="editing"
        @submit.prevent
        hx-patch="/api/tasks/${id}"
        hx-target="closest .task-item"
        hx-swap="outerHTML"
        class="flex-1 flex gap-2">
    <input type="text"
           name="title"
           x-model="editTitle"
           x-ref="editInput"
           @keydown.escape="editing = false; editTitle = '${title}'"
           class="input input-bordered input-sm flex-1">
    <button type="submit" class="btn btn-sm btn-primary">Save</button>
    <button type="button" @click="editing = false" class="btn btn-sm">Cancel</button>
  </form>
  
  <!-- Delete button -->
  <button x-show="!editing"
          @click="deleting = true"
          :disabled="deleting"
          hx-delete="/api/tasks/${id}"
          hx-target="closest .task-item"
          hx-swap="outerHTML swap:200ms"
          hx-confirm="Delete this task?"
          class="btn btn-ghost btn-sm btn-square text-error">
    <span x-show="!deleting">✕</span>
    <span x-show="deleting" class="loading loading-spinner loading-xs"></span>
  </button>
</li>`;
}
```

### Notification System

```typescript
// In layout template
export function notificationContainer(): string {
  return `
<div id="notifications"
     x-data="{
       toasts: [],
       add(toast) {
         toast.id = Date.now();
         this.toasts.push(toast);
         setTimeout(() => this.remove(toast.id), toast.duration || 3000);
       },
       remove(id) {
         this.toasts = this.toasts.filter(t => t.id !== id);
       }
     }"
     @notify.window="add($event.detail)"
     class="toast toast-end toast-bottom z-50">
  <template x-for="toast in toasts" :key="toast.id">
    <div x-show="true"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 translate-x-full"
         x-transition:enter-end="opacity-100 translate-x-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="alert"
         :class="{
           'alert-success': toast.type === 'success',
           'alert-error': toast.type === 'error',
           'alert-warning': toast.type === 'warning',
           'alert-info': toast.type === 'info'
         }">
      <span x-text="toast.message"></span>
      <button @click="remove(toast.id)" class="btn btn-ghost btn-xs">✕</button>
    </div>
  </template>
</div>`;
}
```

```typescript
// Server triggers notification
return new Response(html, {
  headers: {
    'HX-Trigger': JSON.stringify({
      notify: { message: 'Task saved!', type: 'success' },
    }),
  },
});
```

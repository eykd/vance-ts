# Out-of-Band (OOB) Updates

Update multiple page regions from a single server response.

## Table of Contents

- [Basic OOB Swap](#basic-oob-swap)
- [Multiple OOB Targets](#multiple-oob-targets)
- [OOB Swap Strategies](#oob-swap-strategies)
- [Notification Toast Pattern](#notification-toast-pattern)
- [Counter/Badge Updates](#counterbadge-updates)
- [Sidebar + Main Content](#sidebar--main-content)
- [HX-Trigger Header Events](#hx-trigger-header-events)

---

## Basic OOB Swap

Mark elements with `hx-swap-oob="true"` in response to update them regardless of `hx-target`:

**Request:**

```html
<button hx-post="/api/tasks" hx-target="#task-list" hx-swap="beforeend">Add Task</button>

<ul id="task-list"></ul>
<div id="task-count">0 tasks</div>
```

**Server response:**

```html
<!-- Primary swap target content -->
<li>New task item</li>

<!-- Out-of-band update (updates #task-count separately) -->
<div id="task-count" hx-swap-oob="true">3 tasks</div>
```

---

## Multiple OOB Targets

Update any number of regions in one response:

**Page structure:**

```html
<header id="header">...</header>
<main id="content">...</main>
<aside id="sidebar">...</aside>
<footer id="footer">...</footer>
```

**Server response updating multiple regions:**

```html
<!-- Main content (normal swap target) -->
<div>Updated main content</div>

<!-- OOB updates -->
<header id="header" hx-swap-oob="true">Updated header</header>
<aside id="sidebar" hx-swap-oob="true">Updated sidebar</aside>
<div id="notifications" hx-swap-oob="beforeend">
  <div class="alert">New notification!</div>
</div>
```

---

## OOB Swap Strategies

Control HOW the OOB element is swapped:

| Strategy          | Syntax                     | Effect                     |
| ----------------- | -------------------------- | -------------------------- |
| Replace (default) | `hx-swap-oob="true"`       | Replace entire element     |
| innerHTML         | `hx-swap-oob="innerHTML"`  | Replace inner content only |
| beforeend         | `hx-swap-oob="beforeend"`  | Append to children         |
| afterbegin        | `hx-swap-oob="afterbegin"` | Prepend to children        |
| outerHTML         | `hx-swap-oob="outerHTML"`  | Same as `true`             |
| delete            | `hx-swap-oob="delete"`     | Remove element             |

**Examples:**

```html
<!-- Append notification -->
<div id="notifications" hx-swap-oob="beforeend">
  <div class="alert alert-success">Task created!</div>
</div>

<!-- Update just the inner count text -->
<span id="unread-count" hx-swap-oob="innerHTML">5</span>

<!-- Remove an element -->
<div id="promo-banner" hx-swap-oob="delete"></div>
```

---

## Notification Toast Pattern

**Page layout:**

```html
<body>
  <main id="content">...</main>

  <!-- Toast container -->
  <div id="toast-container" class="toast toast-end"></div>
</body>
```

**Any HTMX request can append toasts:**

```html
<!-- Primary response content -->
<div>Order confirmed!</div>

<!-- Toast appended via OOB -->
<div id="toast-container" hx-swap-oob="beforeend">
  <div
    class="alert alert-success"
    x-data="{ show: true }"
    x-show="show"
    x-init="setTimeout(() => show = false, 3000)"
    x-transition:leave="transition ease-in duration-300"
    x-transition:leave-start="opacity-100 translate-x-0"
    x-transition:leave-end="opacity-0 translate-x-full"
  >
    <span>✓ Order placed successfully!</span>
  </div>
</div>
```

**Server helper function:**

```typescript
function withToast(html: string, toast: { message: string; type: string }): string {
  return `
    ${html}
    <div id="toast-container" hx-swap-oob="beforeend">
      <div class="alert alert-${toast.type}"
           x-data="{ show: true }"
           x-show="show"
           x-init="setTimeout(() => show = false, 3000)"
           x-transition>
        <span>${escapeHtml(toast.message)}</span>
      </div>
    </div>
  `;
}

// Usage
return new Response(withToast(taskItemHtml, { message: 'Task created!', type: 'success' }), {
  headers: { 'Content-Type': 'text/html' },
});
```

---

## Counter/Badge Updates

**Page with multiple counters:**

```html
<nav>
  <a href="/inbox"> Inbox <span id="inbox-count" class="badge badge-primary">5</span> </a>
  <a href="/notifications">
    Alerts <span id="notification-count" class="badge badge-error">3</span>
  </a>
</nav>

<main id="content">...</main>
```

**After marking notification as read:**

```html
<!-- Updated notification item -->
<div class="notification read">...</div>

<!-- Update counter -->
<span id="notification-count" class="badge badge-error" hx-swap-oob="true">2</span>
```

**After sending message (update multiple counters):**

```html
<div>Message sent!</div>

<span id="inbox-count" class="badge badge-primary" hx-swap-oob="true">4</span>
<span id="sent-count" class="badge" hx-swap-oob="true">12</span>
```

---

## Sidebar + Main Content

**Common dashboard pattern:**

```html
<div class="flex">
  <aside id="sidebar" class="w-64">
    <nav id="nav-menu">
      <a href="/dashboard" class="active">Dashboard</a>
      <a href="/tasks">Tasks <span id="task-badge">5</span></a>
    </nav>
    <div id="quick-stats">
      <p>Completed: <span id="completed-count">10</span></p>
    </div>
  </aside>

  <main id="main-content" class="flex-1">
    <!-- Content loaded here -->
  </main>
</div>
```

**When completing a task:**

```html
<form hx-post="/api/tasks/123/complete" hx-target="#task-item-123" hx-swap="outerHTML">
  <button>Complete</button>
</form>
```

**Server response updates everything:**

```html
<!-- Task item (strikethrough, completed style) -->
<div id="task-item-123" class="task completed">
  <span class="line-through">Buy groceries</span>
</div>

<!-- Update badge in sidebar -->
<span id="task-badge" hx-swap-oob="true">4</span>

<!-- Update quick stats -->
<span id="completed-count" hx-swap-oob="true">11</span>

<!-- Update nav active state if needed -->
<nav id="nav-menu" hx-swap-oob="true">
  <a href="/dashboard">Dashboard</a>
  <a href="/tasks" class="active">Tasks <span id="task-badge">4</span></a>
</nav>
```

---

## HX-Trigger Header Events

Alternative to OOB: trigger client events that Alpine handles:

**Server response with header:**

```typescript
return new Response(taskItemHtml, {
  headers: {
    'Content-Type': 'text/html',
    'HX-Trigger': JSON.stringify({
      'task-created': { id: task.id, title: task.title },
      'refresh-counts': true,
      'show-toast': { message: 'Task created!', type: 'success' },
    }),
  },
});
```

**Client handles events:**

```html
<body
  @task-created.window="handleTaskCreated($event.detail)"
  @refresh-counts.window="htmx.trigger('#counts', 'load')"
  @show-toast.window="showToast($event.detail)"
>
  <div id="counts" hx-get="/api/counts" hx-trigger="load, refresh-counts from:body">
    <!-- Counts loaded here -->
  </div>

  <div x-data="toastManager()" id="toast-manager">
    <!-- Toast display logic -->
  </div>
</body>

<script>
  function toastManager() {
    return {
      toasts: [],
      showToast(detail) {
        const id = Date.now();
        this.toasts.push({ ...detail, id });
        setTimeout(() => (this.toasts = this.toasts.filter((t) => t.id !== id)), 3000);
      },
    };
  }
</script>
```

---

## OOB Best Practices

1. **Use IDs consistently** - OOB targets must have IDs matching the response
2. **Don't over-use** - If you're updating >3-4 regions, consider a full page refresh
3. **Prefer HX-Trigger for events** - Better separation when updates are event-driven
4. **Test element existence** - OOB silently fails if target doesn't exist
5. **Keep responses small** - Only include changed content in OOB elements

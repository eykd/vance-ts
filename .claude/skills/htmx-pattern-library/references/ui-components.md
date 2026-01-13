# UI Component Patterns

## Table of Contents

- [Modal Dialogs](#modal-dialogs)
- [Dropdowns](#dropdowns)
- [Tabs](#tabs)
- [Accordions](#accordions)

---

## Modal Dialogs

### Client-Only Modal (Alpine)

For modals with static content or client-rendered forms:

```html
<div x-data="{ open: false }">
  <button @click="open = true" class="btn btn-primary">Open Modal</button>

  <div
    x-show="open"
    x-transition:enter="ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="ease-in duration-200"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
    class="modal modal-open"
    @keydown.escape.window="open = false"
  >
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="open = false"></div>

    <!-- Modal content -->
    <div class="modal-box" @click.stop>
      <h3 class="font-bold text-lg">Modal Title</h3>
      <p class="py-4">Modal content here</p>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="open = false">Cancel</button>
        <button class="btn btn-primary" @click="handleConfirm(); open = false">Confirm</button>
      </div>
    </div>
  </div>
</div>
```

### Server-Loaded Modal Content (HTMX + Alpine)

Load modal content from server on demand:

```html
<div x-data="{ open: false }">
  <button
    @click="open = true"
    hx-get="/api/modals/edit-user/123"
    hx-target="#modal-content"
    hx-swap="innerHTML"
    class="btn"
  >
    Edit User
  </button>

  <div
    x-show="open"
    x-transition
    class="modal modal-open"
    @keydown.escape.window="open = false"
    @modal-close.window="open = false"
  >
    <div class="modal-backdrop" @click="open = false"></div>

    <div id="modal-content" class="modal-box" @click.stop>
      <!-- Server content loads here -->
      <span class="loading loading-spinner"></span>
    </div>
  </div>
</div>
```

**Server response:**

```html
<h3 class="font-bold text-lg">Edit User</h3>
<form
  hx-put="/api/users/123"
  hx-swap="none"
  @htmx:after-request="if($event.detail.successful) $dispatch('modal-close')"
>
  <input type="text" name="name" value="John Doe" class="input input-bordered w-full" />
  <div class="modal-action">
    <button type="button" class="btn btn-ghost" @click="$dispatch('modal-close')">Cancel</button>
    <button type="submit" class="btn btn-primary">Save</button>
  </div>
</form>
```

### Confirmation Modal

```html
<div
  x-data="{ 
  open: false, 
  action: null,
  message: '',
  confirm() {
    if (this.action) htmx.trigger(this.action, 'confirmed');
    this.open = false;
  }
}"
  @confirm-delete.window="open = true; action = $event.detail.element; message = $event.detail.message"
>
  <!-- Trigger button -->
  <button
    @click="$dispatch('confirm-delete', { 
    element: $refs.deleteBtn, 
    message: 'Delete this item?' 
  })"
    class="btn btn-error btn-outline"
  >
    Delete
  </button>

  <!-- Hidden HTMX trigger -->
  <button
    x-ref="deleteBtn"
    hx-delete="/api/items/123"
    hx-trigger="confirmed"
    hx-target="closest .item"
    hx-swap="outerHTML"
    class="hidden"
  ></button>

  <!-- Modal -->
  <div x-show="open" x-transition class="modal modal-open">
    <div class="modal-backdrop" @click="open = false"></div>
    <div class="modal-box">
      <h3 class="font-bold text-lg">Confirm</h3>
      <p class="py-4" x-text="message"></p>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="open = false">Cancel</button>
        <button class="btn btn-error" @click="confirm()">Delete</button>
      </div>
    </div>
  </div>
</div>
```

---

## Dropdowns

### Basic Dropdown (Alpine)

```html
<div x-data="{ open: false }" @click.outside="open = false" class="relative">
  <button @click="open = !open" class="btn">
    Options
    <svg
      class="w-4 h-4 ml-1"
      :class="{ 'rotate-180': open }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <ul
    x-show="open"
    x-transition:enter="transition ease-out duration-100"
    x-transition:enter-start="opacity-0 scale-95"
    x-transition:enter-end="opacity-100 scale-100"
    x-transition:leave="transition ease-in duration-75"
    x-transition:leave-start="opacity-100 scale-100"
    x-transition:leave-end="opacity-0 scale-95"
    class="absolute right-0 mt-2 w-48 bg-base-100 rounded-box shadow-lg z-50"
  >
    <li><a @click="open = false" class="block px-4 py-2 hover:bg-base-200">Edit</a></li>
    <li><a @click="open = false" class="block px-4 py-2 hover:bg-base-200">Duplicate</a></li>
    <li class="border-t">
      <a @click="open = false" class="block px-4 py-2 hover:bg-base-200 text-error">Delete</a>
    </li>
  </ul>
</div>
```

### Dropdown with HTMX Actions

```html
<div x-data="{ open: false }" @click.outside="open = false" class="relative">
  <button @click="open = !open" class="btn">Actions</button>

  <ul
    x-show="open"
    x-transition
    class="menu absolute right-0 mt-2 w-48 bg-base-100 rounded-box shadow-lg z-50"
  >
    <li>
      <button
        hx-post="/api/items/123/archive"
        hx-target="closest .item-row"
        hx-swap="outerHTML"
        @click="open = false"
      >
        Archive
      </button>
    </li>
    <li>
      <button
        hx-post="/api/items/123/duplicate"
        hx-target="#item-list"
        hx-swap="afterbegin"
        @click="open = false"
      >
        Duplicate
      </button>
    </li>
    <li>
      <button
        hx-delete="/api/items/123"
        hx-target="closest .item-row"
        hx-swap="outerHTML"
        hx-confirm="Delete this item?"
        @click="open = false"
        class="text-error"
      >
        Delete
      </button>
    </li>
  </ul>
</div>
```

### Select Dropdown with Search

```html
<div
  x-data="{ 
  open: false, 
  search: '',
  selected: null,
  options: [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' }
  ],
  get filtered() {
    return this.options.filter(o => 
      o.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}"
  @click.outside="open = false"
  class="relative"
>
  <button @click="open = !open" class="btn w-48 justify-between">
    <span x-text="selected?.name || 'Select option'"></span>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <div
    x-show="open"
    x-transition
    class="absolute w-full mt-1 bg-base-100 rounded-box shadow-lg z-50"
  >
    <input
      type="text"
      x-model="search"
      placeholder="Search..."
      class="input input-bordered input-sm w-full"
      @click.stop
    />
    <ul class="max-h-48 overflow-auto">
      <template x-for="option in filtered" :key="option.id">
        <li
          @click="selected = option; open = false"
          class="px-4 py-2 hover:bg-base-200 cursor-pointer"
          :class="{ 'bg-primary text-primary-content': selected?.id === option.id }"
        >
          <span x-text="option.name"></span>
        </li>
      </template>
      <li x-show="filtered.length === 0" class="px-4 py-2 text-base-content/60">No results</li>
    </ul>
  </div>

  <input type="hidden" name="option_id" :value="selected?.id" />
</div>
```

---

## Tabs

### Client-Only Tabs (Alpine)

```html
<div x-data="{ activeTab: 'tab1' }">
  <!-- Tab buttons -->
  <div class="tabs tabs-boxed">
    <button class="tab" :class="{ 'tab-active': activeTab === 'tab1' }" @click="activeTab = 'tab1'">
      Overview
    </button>
    <button class="tab" :class="{ 'tab-active': activeTab === 'tab2' }" @click="activeTab = 'tab2'">
      Details
    </button>
    <button class="tab" :class="{ 'tab-active': activeTab === 'tab3' }" @click="activeTab = 'tab3'">
      Settings
    </button>
  </div>

  <!-- Tab panels -->
  <div class="p-4">
    <div x-show="activeTab === 'tab1'" x-transition>
      <h3>Overview Content</h3>
      <p>Overview panel content here.</p>
    </div>
    <div x-show="activeTab === 'tab2'" x-transition>
      <h3>Details Content</h3>
      <p>Details panel content here.</p>
    </div>
    <div x-show="activeTab === 'tab3'" x-transition>
      <h3>Settings Content</h3>
      <p>Settings panel content here.</p>
    </div>
  </div>
</div>
```

### Server-Loaded Tab Content (HTMX)

```html
<div x-data="{ activeTab: 'overview' }">
  <!-- Tab buttons trigger HTMX loads -->
  <div class="tabs tabs-boxed">
    <button
      class="tab"
      :class="{ 'tab-active': activeTab === 'overview' }"
      @click="activeTab = 'overview'"
      hx-get="/api/tabs/overview"
      hx-target="#tab-content"
      hx-swap="innerHTML"
    >
      Overview
    </button>
    <button
      class="tab"
      :class="{ 'tab-active': activeTab === 'analytics' }"
      @click="activeTab = 'analytics'"
      hx-get="/api/tabs/analytics"
      hx-target="#tab-content"
      hx-swap="innerHTML"
      hx-indicator="#tab-spinner"
    >
      Analytics
    </button>
    <button
      class="tab"
      :class="{ 'tab-active': activeTab === 'settings' }"
      @click="activeTab = 'settings'"
      hx-get="/api/tabs/settings"
      hx-target="#tab-content"
      hx-swap="innerHTML"
    >
      Settings
    </button>
  </div>

  <!-- Tab content -->
  <div
    id="tab-content"
    class="p-4 relative"
    hx-get="/api/tabs/overview"
    hx-trigger="load"
    hx-swap="innerHTML"
  >
    <span class="loading loading-spinner"></span>
  </div>

  <span
    id="tab-spinner"
    class="htmx-indicator loading loading-spinner absolute top-2 right-2"
  ></span>
</div>
```

### Tabs with URL State

```html
<div
  x-data="{ 
  activeTab: new URLSearchParams(location.search).get('tab') || 'overview'
}"
>
  <div class="tabs tabs-boxed">
    <button
      class="tab"
      :class="{ 'tab-active': activeTab === 'overview' }"
      @click="activeTab = 'overview'"
      hx-get="/api/tabs/overview"
      hx-target="#tab-content"
      hx-push-url="?tab=overview"
    >
      Overview
    </button>
    <button
      class="tab"
      :class="{ 'tab-active': activeTab === 'details' }"
      @click="activeTab = 'details'"
      hx-get="/api/tabs/details"
      hx-target="#tab-content"
      hx-push-url="?tab=details"
    >
      Details
    </button>
  </div>

  <div id="tab-content" class="p-4"></div>
</div>
```

---

## Accordions

### Client-Only Accordion (Alpine)

```html
<div x-data="{ openItem: null }" class="space-y-2">
  <!-- Item 1 -->
  <div class="collapse collapse-arrow bg-base-200">
    <input
      type="radio"
      name="accordion"
      :checked="openItem === 1"
      @click="openItem = openItem === 1 ? null : 1"
    />
    <div class="collapse-title font-medium" @click="openItem = openItem === 1 ? null : 1">
      Section 1
    </div>
    <div class="collapse-content" x-show="openItem === 1" x-collapse>
      <p>Content for section 1</p>
    </div>
  </div>

  <!-- Item 2 -->
  <div class="collapse collapse-arrow bg-base-200">
    <input
      type="radio"
      name="accordion"
      :checked="openItem === 2"
      @click="openItem = openItem === 2 ? null : 2"
    />
    <div class="collapse-title font-medium" @click="openItem = openItem === 2 ? null : 2">
      Section 2
    </div>
    <div class="collapse-content" x-show="openItem === 2" x-collapse>
      <p>Content for section 2</p>
    </div>
  </div>
</div>
```

### Multiple Open (Independent)

```html
<div class="space-y-2">
  <div x-data="{ open: false }" class="collapse collapse-arrow bg-base-200">
    <div class="collapse-title font-medium" @click="open = !open">Section 1</div>
    <div class="collapse-content" x-show="open" x-collapse x-cloak>
      <p>Content for section 1</p>
    </div>
  </div>

  <div x-data="{ open: false }" class="collapse collapse-arrow bg-base-200">
    <div class="collapse-title font-medium" @click="open = !open">Section 2</div>
    <div class="collapse-content" x-show="open" x-collapse x-cloak>
      <p>Content for section 2</p>
    </div>
  </div>
</div>
```

### Lazy-Loaded Accordion Content (HTMX)

```html
<div x-data="{ openItem: null }" class="space-y-2">
  <div class="collapse collapse-arrow bg-base-200">
    <div
      class="collapse-title font-medium"
      @click="openItem = openItem === 1 ? null : 1"
      hx-get="/api/accordion/section-1"
      hx-target="#content-1"
      hx-trigger="click once"
      hx-swap="innerHTML"
    >
      Section 1 (loads on first click)
    </div>
    <div id="content-1" class="collapse-content" x-show="openItem === 1" x-collapse>
      <span class="loading loading-spinner"></span>
    </div>
  </div>

  <div class="collapse collapse-arrow bg-base-200">
    <div
      class="collapse-title font-medium"
      @click="openItem = openItem === 2 ? null : 2"
      hx-get="/api/accordion/section-2"
      hx-target="#content-2"
      hx-trigger="click once"
      hx-swap="innerHTML"
    >
      Section 2 (loads on first click)
    </div>
    <div id="content-2" class="collapse-content" x-show="openItem === 2" x-collapse>
      <span class="loading loading-spinner"></span>
    </div>
  </div>
</div>
```

### FAQ Accordion with Search

```html
<div
  x-data="{ 
  openItem: null,
  search: '',
  faqs: [
    { id: 1, q: 'How do I reset my password?', a: 'Go to settings...' },
    { id: 2, q: 'What payment methods do you accept?', a: 'We accept...' },
    { id: 3, q: 'How do I contact support?', a: 'Email us at...' }
  ],
  get filtered() {
    if (!this.search) return this.faqs;
    return this.faqs.filter(f => 
      f.q.toLowerCase().includes(this.search.toLowerCase()) ||
      f.a.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}"
>
  <input
    type="search"
    x-model="search"
    placeholder="Search FAQs..."
    class="input input-bordered w-full mb-4"
  />

  <div class="space-y-2">
    <template x-for="faq in filtered" :key="faq.id">
      <div class="collapse collapse-arrow bg-base-200">
        <div
          class="collapse-title font-medium"
          @click="openItem = openItem === faq.id ? null : faq.id"
        >
          <span x-text="faq.q"></span>
        </div>
        <div class="collapse-content" x-show="openItem === faq.id" x-collapse>
          <p x-text="faq.a"></p>
        </div>
      </div>
    </template>

    <p x-show="filtered.length === 0" class="text-base-content/60 text-center py-4">
      No matching questions found
    </p>
  </div>
</div>
```

---

## x-collapse Plugin

Add Alpine's collapse plugin for smooth height animations:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

Then use `x-collapse` on expandable elements:

```html
<div x-show="open" x-collapse>Animated height content</div>
```

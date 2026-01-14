# Search Patterns

## Table of Contents

- [Basic Debounced Search](#basic-debounced-search)
- [Search with Loading Indicator](#search-with-loading-indicator)
- [Active Search (Live Results)](#active-search-live-results)
- [Search with Clear Button](#search-with-clear-button)
- [Filtered List with Client-Side Refine](#filtered-list-with-client-side-refine)
- [Autocomplete / Typeahead](#autocomplete--typeahead)
- [Search with History](#search-with-history)

---

## Basic Debounced Search

```html
<input
  type="search"
  name="q"
  placeholder="Search..."
  hx-get="/app/_/search"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#search-results"
  hx-swap="innerHTML"
/>

<div id="search-results"></div>
```

**Key attributes:**

- `delay:300ms` - Wait 300ms after typing stops
- `changed` - Only trigger if value actually changed
- `keyup` - Trigger on key release

---

## Search with Loading Indicator

```html
<div class="relative">
  <input
    type="search"
    name="q"
    placeholder="Search..."
    hx-get="/app/_/search"
    hx-trigger="keyup changed delay:300ms"
    hx-target="#search-results"
    hx-indicator="#search-spinner"
    class="input input-bordered w-full pr-10"
  />

  <span
    id="search-spinner"
    class="htmx-indicator absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-sm"
  ></span>
</div>

<div id="search-results" class="mt-4"></div>
```

### With Alpine State

```html
<div x-data="{ searching: false, query: '' }" class="relative">
  <input
    type="search"
    name="q"
    x-model="query"
    placeholder="Search..."
    hx-get="/app/_/search"
    hx-trigger="keyup changed delay:300ms"
    hx-target="#search-results"
    @htmx:before-request="searching = true"
    @htmx:after-request="searching = false"
    class="input input-bordered w-full pr-10"
  />

  <span
    x-show="searching"
    class="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-sm"
  ></span>

  <p x-show="query.length > 0 && !searching" class="text-sm text-base-content/60 mt-2">
    Searching for: <span x-text="query"></span>
  </p>
</div>

<div id="search-results"></div>
```

---

## Active Search (Live Results)

Shows results as user types with history push:

```html
<input
  type="search"
  name="q"
  placeholder="Search products..."
  hx-get="/app/_/products/search"
  hx-trigger="keyup changed delay:300ms, search"
  hx-target="#results"
  hx-push-url="true"
  hx-swap="innerHTML"
/>

<div id="results">
  <!-- Server returns search results or initial state -->
</div>
```

**Server handler:**

```typescript
async function searchProducts(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (query.length < 2) {
    return new Response(
      '<p class="text-base-content/60">Type at least 2 characters to search</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const products = await searchProductsInDB(query);

  if (products.length === 0) {
    return new Response(
      `<p class="text-base-content/60">No results for "${escapeHtml(query)}"</p>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const html = products
    .map(
      (p) => `
    <div class="card bg-base-100 shadow mb-2">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description)}</p>
      </div>
    </div>
  `
    )
    .join('');

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
```

---

## Search with Clear Button

```html
<div x-data="{ query: '' }" class="relative">
  <input
    type="search"
    name="q"
    x-model="query"
    placeholder="Search..."
    hx-get="/app/_/search"
    hx-trigger="keyup changed delay:300ms"
    hx-target="#search-results"
    class="input input-bordered w-full pr-10"
  />

  <!-- Clear button -->
  <button
    x-show="query.length > 0"
    x-transition
    @click="query = ''; htmx.trigger('#search-results', 'htmx:abort'); $refs.results.innerHTML = '';"
    type="button"
    class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
  >
    ✕
  </button>
</div>

<div id="search-results" x-ref="results"></div>
```

---

## Filtered List with Client-Side Refine

Load full list from server, filter client-side for instant response:

```html
<div
  x-data="{ 
  filter: '',
  items: [],
  get filteredItems() {
    if (!this.filter) return this.items;
    return this.items.filter(i => 
      i.name.toLowerCase().includes(this.filter.toLowerCase())
    );
  }
}"
>
  <!-- Client-side filter (instant) -->
  <input
    type="text"
    x-model="filter"
    placeholder="Filter loaded items..."
    class="input input-bordered w-full mb-4"
  />

  <!-- Server-loaded list -->
  <ul
    id="items"
    hx-get="/app/_/items"
    hx-trigger="load"
    hx-swap="innerHTML"
    @htmx:after-swap="items = Array.from($el.querySelectorAll('[data-item]')).map(el => JSON.parse(el.dataset.item))"
  >
    <template x-for="item in filteredItems" :key="item.id">
      <li class="p-2 border-b" x-text="item.name"></li>
    </template>
  </ul>
</div>
```

**Server response includes data attributes:**

```html
<li data-item='{"id":"1","name":"Apple"}'>Apple</li>
<li data-item='{"id":"2","name":"Banana"}'>Banana</li>
<li data-item='{"id":"3","name":"Cherry"}'>Cherry</li>
```

---

## Autocomplete / Typeahead

```html
<div
  x-data="{ 
  open: false, 
  query: '',
  selected: null,
  highlightIndex: 0
}"
  @click.outside="open = false"
  class="relative"
>
  <input
    type="text"
    x-model="query"
    @focus="if(query.length >= 2) open = true"
    @keydown.arrow-down.prevent="highlightIndex++"
    @keydown.arrow-up.prevent="highlightIndex--"
    @keydown.enter.prevent="selectHighlighted()"
    @keydown.escape="open = false"
    hx-get="/app/_/autocomplete"
    hx-trigger="keyup changed delay:200ms[this.value.length >= 2]"
    hx-target="#suggestions"
    @htmx:after-swap="open = true; highlightIndex = 0"
    placeholder="Search users..."
    class="input input-bordered w-full"
    autocomplete="off"
  />

  <!-- Suggestions dropdown -->
  <ul
    id="suggestions"
    x-show="open"
    x-transition
    class="absolute z-50 w-full bg-base-100 shadow-lg rounded-box mt-1 max-h-60 overflow-auto"
  >
    <!-- Server populates this -->
  </ul>

  <!-- Hidden input for form submission -->
  <input type="hidden" name="user_id" :value="selected?.id" />
</div>
```

**Server response:**

```html
<li
  class="p-2 hover:bg-base-200 cursor-pointer"
  @click="selected = {id: '123', name: 'John Doe'}; query = 'John Doe'; open = false"
  :class="{ 'bg-base-200': highlightIndex === 0 }"
>
  John Doe (john@example.com)
</li>
<li
  class="p-2 hover:bg-base-200 cursor-pointer"
  @click="selected = {id: '456', name: 'Jane Smith'}; query = 'Jane Smith'; open = false"
  :class="{ 'bg-base-200': highlightIndex === 1 }"
>
  Jane Smith (jane@example.com)
</li>
```

---

## Search with History

Track and show recent searches:

```html
<div
  x-data="{ 
  query: '',
  history: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
  showHistory: false,
  addToHistory(q) {
    if (!q) return;
    this.history = [q, ...this.history.filter(h => h !== q)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(this.history));
  },
  search(q) {
    this.query = q;
    this.showHistory = false;
    htmx.trigger(document.querySelector('#search-input'), 'search');
  }
}"
>
  <div class="relative">
    <input
      type="search"
      id="search-input"
      name="q"
      x-model="query"
      @focus="showHistory = history.length > 0 && !query"
      @blur="setTimeout(() => showHistory = false, 200)"
      @search="addToHistory(query)"
      hx-get="/app/_/search"
      hx-trigger="keyup changed delay:300ms, search"
      hx-target="#search-results"
      placeholder="Search..."
      class="input input-bordered w-full"
    />

    <!-- Recent searches dropdown -->
    <ul
      x-show="showHistory"
      x-transition
      class="absolute z-50 w-full bg-base-100 shadow-lg rounded-box mt-1"
    >
      <li class="px-3 py-1 text-sm text-base-content/60">Recent searches</li>
      <template x-for="h in history" :key="h">
        <li @click="search(h)" class="px-3 py-2 hover:bg-base-200 cursor-pointer" x-text="h"></li>
      </template>
      <li
        @click="history = []; localStorage.removeItem('searchHistory')"
        class="px-3 py-2 text-sm text-error hover:bg-base-200 cursor-pointer border-t"
      >
        Clear history
      </li>
    </ul>
  </div>

  <div id="search-results"></div>
</div>
```

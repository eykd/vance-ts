# Alpine.js Patterns Reference

## Table of Contents

1. [Core Directives](#core-directives)
2. [Reactivity](#reactivity)
3. [Events](#events)
4. [Transitions](#transitions)
5. [Component Patterns](#component-patterns)
6. [Magic Properties](#magic-properties)
7. [Reusable Components](#reusable-components)

## Core Directives

### x-data (Initialize State)

```html
<!-- Inline object -->
<div x-data="{ open: false, count: 0 }">...</div>

<!-- Computed properties -->
<div
  x-data="{ 
  items: [],
  search: '',
  get filteredItems() {
    return this.items.filter(i => i.name.includes(this.search));
  }
}"
>
  ...
</div>

<!-- Methods -->
<div
  x-data="{
  count: 0,
  increment() { this.count++ },
  decrement() { this.count-- }
}"
>
  ...
</div>
```

### x-text / x-html

```html
<span x-text="message"></span>
<span x-text="count + ' items'"></span>
<div x-html="richContent"></div>
<!-- Use carefully, XSS risk -->
```

### x-show / x-if

```html
<!-- x-show: Toggle visibility (CSS display) -->
<div x-show="isVisible">Shown/hidden</div>

<!-- x-if: Add/remove from DOM (must use template) -->
<template x-if="isLoggedIn">
  <div>Welcome back!</div>
</template>
```

### x-for (Loops)

```html
<template x-for="item in items" :key="item.id">
  <div x-text="item.name"></div>
</template>

<!-- With index -->
<template x-for="(item, index) in items" :key="item.id">
  <div x-text="`${index + 1}. ${item.name}`"></div>
</template>
```

### x-bind (Attribute Binding)

```html
<!-- Full syntax -->
<div x-bind:class="{ 'active': isActive }"></div>

<!-- Shorthand -->
<div :class="{ 'active': isActive, 'disabled': !isEnabled }"></div>
<input :disabled="isLoading" />
<a :href="url">Link</a>
<img :src="imageUrl" :alt="imageAlt" />

<!-- Dynamic attribute name -->
<div x-bind:[attributeName]="value"></div>
```

### x-model (Two-way Binding)

```html
<!-- Text input -->
<input type="text" x-model="name" />

<!-- With modifiers -->
<input x-model.lazy="name" />
<!-- Update on change, not input -->
<input x-model.number="age" />
<!-- Parse as number -->
<input x-model.debounce.300ms="search" />
<!-- Debounce -->
<input x-model.trim="name" />
<!-- Trim whitespace -->

<!-- Checkbox -->
<input type="checkbox" x-model="agreed" />

<!-- Multiple checkboxes (array) -->
<input type="checkbox" value="a" x-model="selected" />
<input type="checkbox" value="b" x-model="selected" />

<!-- Radio -->
<input type="radio" value="yes" x-model="answer" />
<input type="radio" value="no" x-model="answer" />

<!-- Select -->
<select x-model="choice">
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

## Reactivity

### x-effect (Watch Changes)

```html
<div x-data="{ count: 0 }" x-effect="console.log('count is', count)">
  <button @click="count++">Increment</button>
</div>
```

### x-init (Initialization)

```html
<div x-data="{ loaded: false }" x-init="loaded = true">...</div>

<!-- Async init -->
<div x-data="{ items: [] }" x-init="items = await fetchItems()">...</div>

<!-- With $nextTick -->
<div x-init="$nextTick(() => $el.focus())">
  <input type="text" />
</div>
```

## Events

### @click / x-on

```html
<!-- Click -->
<button @click="open = true">Open</button>
<button x-on:click="handleClick">Full syntax</button>

<!-- Other events -->
<input @input="search = $event.target.value" />
<input @keyup.enter="submit" />
<form @submit.prevent="handleSubmit">
  <!-- Modifiers -->
  <button @click.prevent="action">Prevent default</button>
  <button @click.stop="action">Stop propagation</button>
  <button @click.once="action">Fire once</button>
  <button @click.self="action">Only if target is self</button>
  <div @click.outside="close">Close on outside click</div>

  <!-- Key modifiers -->
  <input @keyup.enter="submit" />
  <input @keyup.escape="cancel" />
  <input @keydown.arrow-down="next" />
  <input @keydown.cmd.s="save" />
  <!-- Cmd+S / Ctrl+S -->
</form>
```

### Custom Events

```html
<!-- Dispatch -->
<button @click="$dispatch('custom-event', { data: 'value' })">Emit</button>

<!-- Listen -->
<div @custom-event.window="handleEvent($event.detail)">...</div>

<!-- Camelcase conversion -->
<div @custom-event="...">
  <!-- Listens for 'custom-event' -->
  <div @customEvent="..."><!-- Also works --></div>
</div>
```

## Transitions

### x-transition (Simple)

```html
<div x-show="open" x-transition>Content</div>

<!-- With duration -->
<div x-show="open" x-transition.duration.300ms>Content</div>

<!-- Different enter/leave -->
<div x-show="open" x-transition:enter.duration.300ms x-transition:leave.duration.150ms>Content</div>
```

### x-transition (Custom Classes)

```html
<div
  x-show="open"
  x-transition:enter="transition ease-out duration-300"
  x-transition:enter-start="opacity-0 scale-95"
  x-transition:enter-end="opacity-100 scale-100"
  x-transition:leave="transition ease-in duration-200"
  x-transition:leave-start="opacity-100 scale-100"
  x-transition:leave-end="opacity-0 scale-95"
>
  Modal content
</div>
```

### x-transition Modifiers

```html
<div x-show="open" x-transition.opacity>Fade only</div>
<div x-show="open" x-transition.scale>Scale only</div>
<div x-show="open" x-transition.scale.80>Scale from 80%</div>
<div x-show="open" x-transition.origin.top>Transform from top</div>
```

## Component Patterns

### Dropdown

```html
<div x-data="{ open: false }" @click.outside="open = false" class="relative">
  <button @click="open = !open" class="btn">
    Menu
    <svg :class="{ 'rotate-180': open }" class="w-4 h-4 transition-transform">...</svg>
  </button>
  <div x-show="open" x-transition class="absolute mt-2 w-48 bg-base-100 rounded-box shadow-lg">
    <ul class="menu">
      <li><a @click="open = false">Option 1</a></li>
      <li><a @click="open = false">Option 2</a></li>
    </ul>
  </div>
</div>
```

### Modal

```html
<div x-data="{ open: false }">
  <button @click="open = true" class="btn">Open Modal</button>

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
    <div class="modal-box" @click.stop>
      <h3 class="font-bold text-lg">Title</h3>
      <p class="py-4">Content</p>
      <div class="modal-action">
        <button @click="open = false" class="btn">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="open = false"></div>
  </div>
</div>
```

### Tabs

```html
<div x-data="{ tab: 'tab1' }">
  <div class="tabs tabs-boxed">
    <button class="tab" :class="{ 'tab-active': tab === 'tab1' }" @click="tab = 'tab1'">
      Tab 1
    </button>
    <button class="tab" :class="{ 'tab-active': tab === 'tab2' }" @click="tab = 'tab2'">
      Tab 2
    </button>
    <button class="tab" :class="{ 'tab-active': tab === 'tab3' }" @click="tab = 'tab3'">
      Tab 3
    </button>
  </div>
  <div class="p-4">
    <div x-show="tab === 'tab1'">Tab 1 content</div>
    <div x-show="tab === 'tab2'">Tab 2 content</div>
    <div x-show="tab === 'tab3'">Tab 3 content</div>
  </div>
</div>
```

### Accordion

```html
<div x-data="{ active: null }">
  <div class="collapse collapse-arrow bg-base-200">
    <input
      type="radio"
      name="accordion"
      @click="active = active === 1 ? null : 1"
      :checked="active === 1"
    />
    <div class="collapse-title font-medium">Section 1</div>
    <div class="collapse-content" x-show="active === 1" x-collapse>
      <p>Content 1</p>
    </div>
  </div>
  <!-- Repeat for more sections -->
</div>

<!-- Or simpler with x-collapse plugin -->
<div x-data="{ open: false }">
  <button @click="open = !open" class="btn w-full justify-between">
    Toggle
    <svg :class="{ 'rotate-180': open }" class="w-4 h-4">...</svg>
  </button>
  <div x-show="open" x-collapse>Collapsible content</div>
</div>
```

### Toast Notifications

```html
<div
  id="toast-container"
  x-data="{ toasts: [] }"
  @notify.window="toasts.push({...$event.detail, id: Date.now()}); 
                     setTimeout(() => toasts.shift(), 3000)"
  class="toast toast-end"
>
  <template x-for="toast in toasts" :key="toast.id">
    <div class="alert" :class="'alert-' + toast.type">
      <span x-text="toast.message"></span>
      <button @click="toasts = toasts.filter(t => t.id !== toast.id)" class="btn btn-ghost btn-xs">
        ✕
      </button>
    </div>
  </template>
</div>
```

## Magic Properties

```html
<div x-data="{ items: [] }">
  <!-- $el: Current element -->
  <input x-init="$el.focus()" />

  <!-- $refs: Named references -->
  <input x-ref="nameInput" />
  <button @click="$refs.nameInput.focus()">Focus</button>

  <!-- $watch: Watch property changes -->
  <div x-init="$watch('items', (value) => console.log('items changed', value))">
    <!-- $nextTick: After DOM update -->
    <button @click="items.push('new'); $nextTick(() => $refs.list.scrollTop = 9999)">Add</button>

    <!-- $dispatch: Custom events -->
    <button @click="$dispatch('notify', { message: 'Hello' })">Notify</button>

    <!-- $id: Generate unique IDs -->
    <label :for="$id('input')">Label</label>
    <input :id="$id('input')" />

    <!-- $data: Access component data -->
    <div x-text="JSON.stringify($data)"></div>
  </div>
</div>
```

## Reusable Components

### Alpine.data()

```javascript
// In script tag or separate file, before Alpine loads
document.addEventListener('alpine:init', () => {
  Alpine.data('dropdown', () => ({
    open: false,
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
  }));

  Alpine.data('counter', (initialCount = 0) => ({
    count: initialCount,
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
  }));
});
```

```html
<div x-data="dropdown" @click.outside="close">
  <button @click="toggle">Menu</button>
  <div x-show="open">Content</div>
</div>

<div x-data="counter(10)">
  <button @click="decrement">-</button>
  <span x-text="count"></span>
  <button @click="increment">+</button>
</div>
```

### Alpine.store()

```javascript
// Global store
document.addEventListener('alpine:init', () => {
  Alpine.store('user', {
    name: '',
    loggedIn: false,
    login(name) {
      this.name = name;
      this.loggedIn = true;
    },
    logout() {
      this.name = '';
      this.loggedIn = false;
    },
  });
});
```

```html
<!-- Access from anywhere -->
<div x-data>
  <span x-show="$store.user.loggedIn" x-text="$store.user.name"></span>
  <button @click="$store.user.logout()">Logout</button>
</div>
```

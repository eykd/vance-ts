# TailwindCSS 4 + DaisyUI 5 Components Reference

## Table of Contents

1. [Setup](#setup)
2. [Buttons](#buttons)
3. [Forms](#forms)
4. [Cards](#cards)
5. [Navigation](#navigation)
6. [Feedback](#feedback)
7. [Layout](#layout)
8. [Data Display](#data-display)
9. [Theming](#theming)

## Setup

### TailwindCSS 4 + DaisyUI 5 CSS

```css
/* src/styles/app.css */
@import 'tailwindcss';
@plugin "daisyui";

/* Configure themes */
@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark,
    corporate;
}

/* HTMX indicator utilities */
@layer utilities {
  .htmx-indicator {
    opacity: 0;
    transition: opacity 200ms ease-in;
  }
  .htmx-request .htmx-indicator,
  .htmx-request.htmx-indicator {
    opacity: 1;
  }
}
```

### Build Command

```bash
npx @tailwindcss/cli -i ./src/styles/app.css -o ./public/css/app.css --minify
```

## Buttons

### Basic Buttons

```html
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-neutral">Neutral</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>
```

### Button States

```html
<button class="btn btn-primary btn-outline">Outline</button>
<button class="btn btn-primary btn-active">Active</button>
<button class="btn btn-disabled">Disabled</button>
<button class="btn" disabled>Also Disabled</button>
```

### Button Sizes

```html
<button class="btn btn-xs">Tiny</button>
<button class="btn btn-sm">Small</button>
<button class="btn">Normal</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-wide">Wide</button>
<button class="btn btn-block">Block (full width)</button>
```

### Button Shapes

```html
<button class="btn btn-square">□</button> <button class="btn btn-circle">○</button>
```

### Loading Button

```html
<button class="btn btn-primary">
  <span class="loading loading-spinner loading-sm"></span>
  Loading
</button>
```

### Button with Icon

```html
<button class="btn btn-primary">
  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>
  Add Item
</button>
```

## Forms

### Text Input

```html
<input type="text" class="input" placeholder="Default" />
<input type="text" class="input input-bordered" placeholder="Bordered" />
<input type="text" class="input input-bordered input-primary" placeholder="Primary" />
<input type="text" class="input input-bordered input-error" placeholder="Error" />
```

### Input Sizes

```html
<input type="text" class="input input-bordered input-xs" placeholder="Tiny" />
<input type="text" class="input input-bordered input-sm" placeholder="Small" />
<input type="text" class="input input-bordered" placeholder="Normal" />
<input type="text" class="input input-bordered input-lg" placeholder="Large" />
```

### Input with Label

```html
<div class="form-control w-full">
  <label class="label">
    <span class="label-text">Email</span>
    <span class="label-text-alt">Required</span>
  </label>
  <input type="email" class="input input-bordered w-full" placeholder="you@example.com" />
  <label class="label">
    <span class="label-text-alt text-error">Invalid email format</span>
  </label>
</div>
```

### Select

```html
<select class="select select-bordered w-full">
  <option disabled selected>Choose option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Textarea

```html
<textarea class="textarea textarea-bordered w-full" placeholder="Message"></textarea>
```

### Checkbox

```html
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Remember me</span>
    <input type="checkbox" class="checkbox checkbox-primary" />
  </label>
</div>
```

### Radio

```html
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Option A</span>
    <input type="radio" name="radio-group" class="radio radio-primary" checked />
  </label>
  <label class="label cursor-pointer">
    <span class="label-text">Option B</span>
    <input type="radio" name="radio-group" class="radio radio-primary" />
  </label>
</div>
```

### Toggle

```html
<input type="checkbox" class="toggle toggle-primary" />
```

### Range

```html
<input type="range" class="range range-primary" min="0" max="100" />
```

### File Input

```html
<input type="file" class="file-input file-input-bordered w-full" />
```

## Cards

### Basic Card

```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content goes here.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

### Card with Image

```html
<div class="card bg-base-100 shadow-xl">
  <figure>
    <img src="/image.jpg" alt="Card image" />
  </figure>
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Description</p>
  </div>
</div>
```

### Compact Card

```html
<div class="card card-compact bg-base-100 shadow">
  <div class="card-body">
    <h2 class="card-title text-sm">Compact</h2>
    <p class="text-xs">Less padding</p>
  </div>
</div>
```

### Card Variants

```html
<div class="card card-bordered">Bordered</div>
<div class="card bg-primary text-primary-content">Colored</div>
<div class="card image-full">Image as background</div>
```

## Navigation

### Navbar

```html
<nav class="navbar bg-base-100 shadow-lg">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">Brand</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/dashboard" hx-boost="true">Dashboard</a></li>
      <li><a href="/settings" hx-boost="true">Settings</a></li>
    </ul>
  </div>
</nav>
```

### Menu

```html
<ul class="menu bg-base-200 rounded-box w-56">
  <li class="menu-title">Category</li>
  <li><a>Item 1</a></li>
  <li><a class="active">Active Item</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### Menu with Icons

```html
<ul class="menu bg-base-200 rounded-box w-56">
  <li>
    <a>
      <svg class="w-4 h-4">...</svg>
      Dashboard
    </a>
  </li>
</ul>
```

### Tabs

```html
<div class="tabs tabs-boxed">
  <a class="tab">Tab 1</a>
  <a class="tab tab-active">Tab 2</a>
  <a class="tab">Tab 3</a>
</div>

<!-- Lifted tabs -->
<div class="tabs tabs-lifted">
  <a class="tab">Tab 1</a>
  <a class="tab tab-active">Tab 2</a>
</div>
```

### Breadcrumbs

```html
<div class="breadcrumbs text-sm">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li>Current Page</li>
  </ul>
</div>
```

### Pagination

```html
<div class="join">
  <button class="join-item btn">«</button>
  <button class="join-item btn">1</button>
  <button class="join-item btn btn-active">2</button>
  <button class="join-item btn">3</button>
  <button class="join-item btn">»</button>
</div>
```

## Feedback

### Alerts

```html
<div class="alert">
  <span>Default alert</span>
</div>
<div class="alert alert-info">
  <span>Info message</span>
</div>
<div class="alert alert-success">
  <span>Success!</span>
</div>
<div class="alert alert-warning">
  <span>Warning</span>
</div>
<div class="alert alert-error">
  <span>Error occurred</span>
</div>
```

### Alert with Actions

```html
<div class="alert alert-warning">
  <svg class="w-6 h-6">...</svg>
  <span>Warning message here</span>
  <div>
    <button class="btn btn-sm">Deny</button>
    <button class="btn btn-sm btn-primary">Accept</button>
  </div>
</div>
```

### Toast

```html
<div class="toast toast-end">
  <div class="alert alert-success">
    <span>Message saved.</span>
  </div>
</div>

<!-- Toast positions -->
<div class="toast toast-top toast-start">Top left</div>
<div class="toast toast-top toast-center">Top center</div>
<div class="toast toast-top toast-end">Top right</div>
<div class="toast toast-bottom toast-start">Bottom left</div>
<div class="toast toast-bottom toast-center">Bottom center</div>
<div class="toast toast-bottom toast-end">Bottom right</div>
```

### Loading

```html
<span class="loading loading-spinner loading-xs"></span>
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-spinner loading-md"></span>
<span class="loading loading-spinner loading-lg"></span>

<!-- Other types -->
<span class="loading loading-dots"></span>
<span class="loading loading-ring"></span>
<span class="loading loading-ball"></span>
<span class="loading loading-bars"></span>
<span class="loading loading-infinity"></span>
```

### Progress

```html
<progress class="progress w-full" value="40" max="100"></progress>
<progress class="progress progress-primary w-full" value="60" max="100"></progress>
```

### Badge

```html
<span class="badge">default</span>
<span class="badge badge-primary">primary</span>
<span class="badge badge-secondary">secondary</span>
<span class="badge badge-outline">outline</span>

<!-- Sizes -->
<span class="badge badge-xs">tiny</span>
<span class="badge badge-sm">small</span>
<span class="badge badge-md">normal</span>
<span class="badge badge-lg">large</span>
```

## Layout

### Container

```html
<div class="container mx-auto px-4">Content</div>
```

### Divider

```html
<div class="divider">OR</div>
<div class="divider divider-horizontal">OR</div>
```

### Stack

```html
<div class="stack">
  <div class="card bg-primary text-primary-content">A</div>
  <div class="card bg-secondary text-secondary-content">B</div>
  <div class="card bg-accent text-accent-content">C</div>
</div>
```

### Hero

```html
<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Hello</h1>
      <p class="py-6">Description text here.</p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
```

### Modal (with Alpine.js)

```html
<div x-data="{ open: false }">
  <button @click="open = true" class="btn">Open Modal</button>

  <div x-show="open" class="modal modal-open" @keydown.escape.window="open = false">
    <div class="modal-box" @click.stop>
      <h3 class="font-bold text-lg">Modal Title</h3>
      <p class="py-4">Modal content</p>
      <div class="modal-action">
        <button class="btn" @click="open = false">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="open = false"></div>
  </div>
</div>
```

### Drawer

```html
<div class="drawer lg:drawer-open">
  <input id="drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Page content -->
    <label for="drawer" class="btn btn-primary drawer-button lg:hidden">Menu</label>
  </div>
  <div class="drawer-side">
    <label for="drawer" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 w-80 min-h-full p-4">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</div>
```

## Data Display

### Table

```html
<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Item 1</td>
        <td><span class="badge badge-success">Active</span></td>
        <td><button class="btn btn-xs">Edit</button></td>
      </tr>
      <tr class="hover">
        <td>Item 2</td>
        <td><span class="badge badge-warning">Pending</span></td>
        <td><button class="btn btn-xs">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Table variants -->
<table class="table table-zebra">
  ...
</table>
<!-- Zebra stripes -->
<table class="table table-pin-rows">
  ...
</table>
<!-- Sticky header -->
<table class="table table-pin-cols">
  ...
</table>
<!-- Sticky first column -->
```

### Stat

```html
<div class="stats shadow">
  <div class="stat">
    <div class="stat-title">Total Users</div>
    <div class="stat-value">89,400</div>
    <div class="stat-desc">21% more than last month</div>
  </div>
  <div class="stat">
    <div class="stat-title">Revenue</div>
    <div class="stat-value text-primary">$25,600</div>
    <div class="stat-desc text-secondary">↗︎ 400 (22%)</div>
  </div>
</div>
```

### Avatar

```html
<div class="avatar">
  <div class="w-12 rounded-full">
    <img src="/avatar.jpg" alt="Avatar" />
  </div>
</div>

<!-- Placeholder avatar -->
<div class="avatar placeholder">
  <div class="bg-neutral text-neutral-content w-12 rounded-full">
    <span>JD</span>
  </div>
</div>
```

### Collapse/Accordion

```html
<div class="collapse collapse-arrow bg-base-200">
  <input type="checkbox" />
  <div class="collapse-title font-medium">Click to expand</div>
  <div class="collapse-content">
    <p>Hidden content here</p>
  </div>
</div>
```

## Theming

### Theme Selection

```html
<html data-theme="light">
  <!-- or "dark", "corporate", etc. -->
</html>
```

### Theme Toggle (with Alpine)

```html
<div
  x-data="{ dark: localStorage.getItem('theme') === 'dark' }"
  x-init="$watch('dark', val => { 
       localStorage.setItem('theme', val ? 'dark' : 'light');
       document.documentElement.dataset.theme = val ? 'dark' : 'light';
     })"
>
  <label class="swap swap-rotate">
    <input type="checkbox" x-model="dark" />
    <svg class="swap-on w-6 h-6" fill="currentColor"><!-- sun icon --></svg>
    <svg class="swap-off w-6 h-6" fill="currentColor"><!-- moon icon --></svg>
  </label>
</div>
```

### Color Classes

```html
<!-- Background -->
<div class="bg-primary">Primary bg</div>
<div class="bg-base-100">Base 100</div>
<div class="bg-base-200">Base 200</div>
<div class="bg-base-300">Base 300</div>

<!-- Text -->
<span class="text-primary">Primary text</span>
<span class="text-primary-content">For primary bg</span>
<span class="text-base-content">Default text</span>

<!-- Semantic colors -->
<div class="bg-success text-success-content">Success</div>
<div class="bg-warning text-warning-content">Warning</div>
<div class="bg-error text-error-content">Error</div>
<div class="bg-info text-info-content">Info</div>
```

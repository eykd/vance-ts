# Typography and Readability

## Contents

1. [Typography Plugin Setup](#typography-plugin-setup)
2. [Optimal Line Length](#optimal-line-length)
3. [Prose Styling](#prose-styling)
4. [Non-Prose Text Patterns](#non-prose-text-patterns)
5. [Responsive Typography](#responsive-typography)

## Typography Plugin Setup

### Installation

```bash
npm install -D @tailwindcss/typography
```

### CSS Configuration (TailwindCSS 4)

```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
@plugin "daisyui";
```

## Optimal Line Length

**Target: 45-75 characters per line** (65 characters ideal)

### Key Classes

| Class         | Width | Characters | Use Case           |
| ------------- | ----- | ---------- | ------------------ |
| `max-w-prose` | 65ch  | ~65        | Long-form articles |
| `max-w-md`    | 28rem | ~50-55     | Compact content    |
| `max-w-lg`    | 32rem | ~60-65     | Standard content   |
| `max-w-xl`    | 36rem | ~70-75     | Wide content       |
| `max-w-2xl`   | 42rem | ~80-85     | Maximum readable   |

### Basic Pattern

```html
<article class="prose max-w-prose mx-auto">
  <!-- Content automatically constrained to readable width -->
</article>
```

### Multi-Column Layout

```html
<div class="container mx-auto px-4">
  <div class="grid md:grid-cols-3 gap-8">
    <aside class="md:col-span-1">
      <!-- Sidebar content -->
    </aside>
    <main class="md:col-span-2 prose max-w-none">
      <!-- Main content fills available space -->
    </main>
  </div>
</div>
```

## Prose Styling

### Basic Prose

```html
<article class="prose">
  <h1>Article Title</h1>
  <p class="lead">Introduction paragraph with emphasis.</p>
  <p>Regular paragraph text continues here.</p>
  <h2>Section Heading</h2>
  <p>More content...</p>
</article>
```

### Prose Sizes

```html
<article class="prose prose-sm">Small text</article>
<!-- 14px base -->
<article class="prose">Base text</article>
<!-- 16px base -->
<article class="prose prose-lg">Large text</article>
<!-- 18px base -->
<article class="prose prose-xl">XL text</article>
<!-- 20px base -->
```

### DaisyUI Theme Integration

```html
<!-- Prose automatically uses DaisyUI theme colors -->
<article class="prose prose-base-content">
  <!-- Headings, links, etc. follow theme -->
</article>
```

### Prose Modifiers

```html
<article
  class="prose 
  prose-headings:text-primary
  prose-a:text-secondary
  prose-strong:text-accent
  prose-code:bg-base-200 prose-code:rounded prose-code:px-1"
>
  <!-- Customized prose elements -->
</article>
```

## Non-Prose Text Patterns

### UI Text (Not Long-Form)

```html
<!-- Card descriptions - shorter max-width -->
<div class="card bg-base-100">
  <div class="card-body">
    <h2 class="card-title">Feature Name</h2>
    <p class="text-base-content/70 max-w-sm">
      Brief description that doesn't need full prose treatment.
    </p>
  </div>
</div>

<!-- Hero sections - larger text, wider measure -->
<section class="hero">
  <div class="hero-content text-center max-w-2xl">
    <h1 class="text-4xl font-bold">Big Headline</h1>
    <p class="text-lg text-base-content/80">
      Supporting text with slightly wider measure for larger font.
    </p>
  </div>
</section>
```

### Form Labels and Hints

```html
<label class="form-control w-full max-w-md">
  <div class="label">
    <span class="label-text">Username</span>
  </div>
  <input type="text" class="input input-bordered" />
  <div class="label">
    <span class="label-text-alt text-base-content/60">
      3-20 characters, letters and numbers only
    </span>
  </div>
</label>
```

## Responsive Typography

### Scaling Font Size

```html
<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">Responsive Heading</h1>

<p class="text-sm sm:text-base lg:text-lg">Responsive body text</p>
```

### Responsive Line Length

```html
<article class="prose max-w-sm sm:max-w-prose mx-auto">
  <!-- Narrower on mobile, optimal on larger screens -->
</article>
```

### Responsive Prose Size

```html
<article class="prose prose-sm sm:prose lg:prose-lg">
  <!-- Scales up with viewport -->
</article>
```

## Common Patterns

### Blog Post Layout

```html
<article class="py-8">
  <header class="max-w-prose mx-auto mb-8">
    <h1 class="text-3xl font-bold mb-2">Post Title</h1>
    <p class="text-base-content/60">Published January 11, 2026</p>
  </header>
  <div class="prose max-w-prose mx-auto">
    <p class="lead">Opening paragraph...</p>
    <p>Article content...</p>
  </div>
</article>
```

### Documentation Page

```html
<div class="container mx-auto px-4 py-8">
  <div class="flex gap-8">
    <nav class="w-64 shrink-0">
      <ul class="menu bg-base-200 rounded-box">
        <!-- Navigation -->
      </ul>
    </nav>
    <main class="prose max-w-none flex-1">
      <!-- Docs content fills remaining space -->
    </main>
  </div>
</div>
```

### Modal with Readable Content

```html
<dialog class="modal">
  <div class="modal-box max-w-2xl">
    <h3 class="text-lg font-bold">Terms of Service</h3>
    <div class="prose prose-sm max-w-none py-4">
      <!-- Long text readable within modal -->
    </div>
  </div>
</dialog>
```

# Hugo Design Patterns

Visual patterns adapted for Hugo + TailwindCSS 4 + DaisyUI 5.

## Hero Variations

### Centered Hero (Default)

```html
<section class="hero min-h-[70vh] bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-2xl">
      <h1 class="text-5xl font-display font-bold">{{ $hero.title }}</h1>
      <p class="py-6 text-xl text-base-content/80">{{ $hero.subtitle }}</p>
      <a href="{{ $hero.cta.url }}" class="btn btn-primary btn-lg">{{ $hero.cta.text }}</a>
    </div>
  </div>
</section>
```

### Split Hero (Image + Text)

```html
<section class="hero min-h-[70vh] bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse gap-8">
    <img src="{{ $hero.image }}" class="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 class="text-5xl font-display font-bold">{{ $hero.title }}</h1>
      <p class="py-6 text-lg text-base-content/80">{{ $hero.subtitle }}</p>
      <a href="{{ $hero.cta.url }}" class="btn btn-primary">{{ $hero.cta.text }}</a>
    </div>
  </div>
</section>
```

### Hero with Background Gradient

```html
<section class="hero min-h-[70vh] relative overflow-hidden">
  <!-- Gradient background -->
  <div
    class="absolute inset-0 bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20"
  ></div>

  <div class="hero-content text-center relative z-10">
    <div class="max-w-2xl">
      <p class="text-primary font-mono text-sm tracking-widest uppercase mb-4">
        {{ $hero.eyebrow }}
      </p>
      <h1 class="text-5xl md:text-7xl font-display font-bold leading-tight">{{ $hero.title }}</h1>
      <p class="py-6 text-xl text-base-content/70">{{ $hero.subtitle }}</p>
      <div class="flex gap-4 justify-center">
        <a href="{{ $hero.cta.url }}" class="btn btn-primary btn-lg">{{ $hero.cta.text }}</a>
        {{ with $hero.secondary_cta }}
        <a href="{{ .url }}" class="btn btn-ghost btn-lg">{{ .text }} →</a>
        {{ end }}
      </div>
    </div>
  </div>
</section>
```

## Card Grids

### Standard 3-Column

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {{ range .Pages }}
  <article class="card bg-base-100 shadow-lg">
    {{ with .Params.featured_image }}
    <figure><img src="{{ . }}" alt="{{ $.Title }}" class="h-48 object-cover" /></figure>
    {{ end }}
    <div class="card-body">
      <h2 class="card-title">{{ .Title }}</h2>
      <p class="text-base-content/70 line-clamp-2">{{ .Summary }}</p>
      <div class="card-actions justify-end mt-4">
        <a href="{{ .RelPermalink }}" class="btn btn-primary btn-sm">Read</a>
      </div>
    </div>
  </article>
  {{ end }}
</div>
```

### Compact Card List

```html
<div class="space-y-4">
  {{ range .Pages }}
  <article class="card card-side bg-base-100 shadow">
    {{ with .Params.featured_image }}
    <figure class="w-32 shrink-0">
      <img src="{{ . }}" alt="{{ $.Title }}" class="h-full object-cover" />
    </figure>
    {{ end }}
    <div class="card-body py-4">
      <h2 class="card-title text-lg">
        <a href="{{ .RelPermalink }}" class="hover:text-primary">{{ .Title }}</a>
      </h2>
      <p class="text-sm text-base-content/60">{{ .Date.Format "Jan 2, 2006" }}</p>
    </div>
  </article>
  {{ end }}
</div>
```

### Featured + Grid

```html
{{ $pages := .Pages }} {{ $featured := first 1 $pages }} {{ $rest := after 1 $pages }}

<!-- Featured post -->
{{ range $featured }}
<article class="card lg:card-side bg-base-100 shadow-xl mb-8">
  {{ with .Params.featured_image }}
  <figure class="lg:w-1/2"><img src="{{ . }}" alt="{{ $.Title }}" /></figure>
  {{ end }}
  <div class="card-body lg:w-1/2">
    <span class="badge badge-primary">Featured</span>
    <h2 class="card-title text-2xl">{{ .Title }}</h2>
    <p class="text-base-content/70">{{ .Summary }}</p>
    <div class="card-actions justify-end">
      <a href="{{ .RelPermalink }}" class="btn btn-primary">Read more</a>
    </div>
  </div>
</article>
{{ end }}

<!-- Rest in grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  {{ range $rest }}
  <!-- Standard card -->
  {{ end }}
</div>
```

## Typography Integration

### Prose Content

```html
<article
  class="prose prose-lg max-w-prose mx-auto
               prose-headings:font-display
               prose-a:text-primary prose-a:no-underline hover:prose-a:underline
               prose-code:bg-base-200 prose-code:rounded prose-code:px-1
               prose-img:rounded-lg prose-img:shadow-lg"
>
  {{ .Content }}
</article>
```

### Custom Heading Styles

In `assets/css/styles.css`:

```css
.prose h1 {
  @apply text-4xl font-display tracking-tight;
}

.prose h2 {
  @apply text-2xl font-display border-b border-base-300 pb-2;
}

.prose h3 {
  @apply text-xl font-display text-primary;
}
```

## Motion Patterns

### Staggered Page Load

In `assets/css/styles.css`:

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.6s ease-out both;
}

.stagger > *:nth-child(1) {
  animation-delay: 0ms;
}
.stagger > *:nth-child(2) {
  animation-delay: 100ms;
}
.stagger > *:nth-child(3) {
  animation-delay: 200ms;
}
.stagger > *:nth-child(4) {
  animation-delay: 300ms;
}
```

Usage in hero:

```html
<div class="hero-content stagger">
  <p class="animate-fade-up">Eyebrow</p>
  <h1 class="animate-fade-up">Title</h1>
  <p class="animate-fade-up">Subtitle</p>
  <div class="animate-fade-up">CTAs</div>
</div>
```

### Card Hover Effects

```html
<article
  class="card bg-base-100 shadow-lg
               hover:shadow-xl hover:-translate-y-1
               transition-all duration-300"
></article>
```

## Visual Atmosphere

### Gradient Mesh Background

```html
<div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
  <div
    class="absolute -top-1/2 -left-1/4 w-full h-full 
              bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)]
              opacity-10 blur-3xl"
  ></div>
  <div
    class="absolute -bottom-1/2 -right-1/4 w-full h-full 
              bg-[radial-gradient(ellipse_at_center,_var(--color-secondary)_0%,_transparent_70%)]
              opacity-10 blur-3xl"
  ></div>
</div>
```

### Subtle Noise Texture

In `assets/css/styles.css`:

```css
.texture-noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.02;
  pointer-events: none;
}
```

## Differentiation Techniques

### Asymmetric Layout

```html
<section class="container mx-auto px-4 py-16">
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 lg:col-span-5 lg:col-start-2 flex flex-col justify-center">
      <h2 class="text-4xl font-display">Content here</h2>
    </div>
    <div class="col-span-12 lg:col-span-5 lg:-mt-16">
      <!-- Offset element -->
    </div>
  </div>
</section>
```

### Accent Borders

```html
<div class="card bg-base-100 border-l-4 border-primary">
  <!-- Distinctive left border -->
</div>

<div class="card bg-base-100 border-t-2 border-accent">
  <!-- Top accent -->
</div>
```

### Rotated Elements

```html
<div class="card bg-base-100 -rotate-1 hover:rotate-0 transition-transform duration-300">
  <!-- Subtle rotation, straightens on hover -->
</div>
```

## Dark Mode

Theme switching via `data-theme` attribute:

```html
<html data-theme="brand-light">
  <!-- Theme toggle button -->
  <button
    onclick="document.documentElement.dataset.theme = 
                 document.documentElement.dataset.theme === 'brand-light' 
                 ? 'brand-dark' : 'brand-light'"
    class="btn btn-ghost btn-circle"
  >
    <svg><!-- sun/moon icon --></svg>
  </button>
</html>
```

No conditional dark: classes needed—semantic colors adapt automatically.

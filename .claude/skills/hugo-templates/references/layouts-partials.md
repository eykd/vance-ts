# Layouts and Partials

Hugo layouts define page structure. Partials are reusable template fragments.

## Base Layout (baseof.html)

Every page inherits from `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ block "title" . }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>

    <!-- Styles -->
    <link rel="stylesheet" href="/css/app.css" />

    <!-- HTMX -->
    <script src="/js/htmx.min.js" defer></script>

    <!-- Alpine.js -->
    <script defer src="/js/alpine.min.js"></script>

    {{ block "head" . }}{{ end }}
  </head>
  <body class="min-h-screen bg-base-200" hx-boost="true">
    {{ partial "header.html" . }}

    <main class="container mx-auto px-4 py-8">{{ block "main" . }}{{ end }}</main>

    {{ partial "footer.html" . }} {{ partial "toast-container.html" . }} {{ block "scripts" . }}{{
    end }}
  </body>
</html>
```

## Content Layouts

### Single Page (`layouts/_default/single.html`)

```html
{{ define "main" }}
<article class="prose prose-lg max-w-4xl mx-auto">
  <header class="mb-8">
    <h1 class="text-4xl font-bold">{{ .Title }}</h1>
    <time datetime="{{ .Date.Format "2006-01-02" }}">
      {{ .Date.Format "January 2, 2006" }}
    </time>
  </header>

  <div class="content">
    {{ .Content }}
  </div>
</article>
{{ end }}
```

### List Page (`layouts/_default/list.html`)

```html
{{ define "main" }}
<div class="max-w-4xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">{{ .Title }}</h1>

  <div class="space-y-8">{{ range .Pages }} {{ partial "card.html" . }} {{ end }}</div>

  {{ template "_internal/pagination.html" . }}
</div>
{{ end }}
```

## Partials

### Header Partial (`layouts/partials/header.html`)

```html
<nav class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
  <div class="container mx-auto">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost text-xl">{{ .Site.Title }}</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        {{ range .Site.Menus.main }}
        <li>
          <a href="{{ .URL }}" class="{{ if $.IsMenuCurrent `main` . }}active{{ end }}">
            {{ .Name }}
          </a>
        </li>
        {{ end }}
      </ul>
    </div>
  </div>
</nav>
```

### Card Partial (`layouts/partials/card.html`)

```html
<article class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">
      <a href="{{ .RelPermalink }}">{{ .Title }}</a>
    </h2>
    <p>{{ .Summary | truncate 150 }}</p>
    <div class="card-actions justify-end">
      <a href="{{ .RelPermalink }}" class="btn btn-primary btn-sm"> Read More </a>
    </div>
  </div>
</article>
```

### Toast Container (`layouts/partials/toast-container.html`)

```html
<div
  id="toast-container"
  class="toast toast-end z-50"
  x-data="{
       toasts: [],
       addToast(message, type = 'info') {
         const id = Date.now();
         this.toasts.push({ id, message, type });
         setTimeout(() => {
           this.toasts = this.toasts.filter(t => t.id !== id);
         }, 5000);
       }
     }"
  @htmx:after-request.window="
       const trigger = $event.detail.xhr.getResponseHeader('HX-Trigger');
       if (trigger) {
         try {
           const data = JSON.parse(trigger);
           if (data.notify) addToast(data.notify.message, data.notify.type);
         } catch(e) {}
       }
     "
>
  <template x-for="toast in toasts" :key="toast.id">
    <div
      class="alert"
      :class="{
           'alert-success': toast.type === 'success',
           'alert-error': toast.type === 'error',
           'alert-info': toast.type === 'info'
         }"
      x-transition
    >
      <span x-text="toast.message"></span>
    </div>
  </template>
</div>
```

## Content Type Layouts

Override layouts for specific content types:

```text
layouts/
├── _default/
│   ├── baseof.html
│   ├── single.html
│   └── list.html
├── blog/
│   ├── single.html    # Override for blog posts
│   └── list.html      # Override for blog listing
└── partials/
    ├── header.html
    └── footer.html
```

### Blog Single with Comments

```html
{{ define "main" }}
<article class="prose max-w-4xl mx-auto">{{ .Content }}</article>

<!-- Comments Section -->
<section class="max-w-4xl mx-auto mt-16">
  <h2 class="text-2xl font-bold mb-8">Comments</h2>

  <div
    id="comment-list"
    hx-get="{{ .Site.Params.api.comments }}?postId={{ .File.UniqueID }}"
    hx-trigger="load"
    hx-swap="innerHTML"
  >
    <span class="loading loading-spinner"></span>
  </div>
</section>
{{ end }}
```

## See Also

- [Shortcodes](./shortcodes.md) - Embeddable components
- [HTMX Integration](./htmx-integration.md) - Dynamic content patterns

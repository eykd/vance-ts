# Hugo Template Reference

## Directory Structure

```
hugo/
├── hugo.yaml                    # Build config, taxonomies, outputs
├── tailwind.config.js           # TailwindCSS 4 + DaisyUI 5 config
├── package.json                 # hugo-extended, TailwindCSS 4, DaisyUI 5
│
├── config/_default/
│   ├── params.yaml              # Site branding, theme, social links
│   └── menus.yaml               # Navigation structure
│
├── layouts/
│   ├── baseof.html              # Master template (★★★)
│   ├── home.html                # Home page (★★)
│   ├── single.html              # Post/page (★★)
│   ├── list.html                # Listings (★★)
│   ├── 404.html                 # Error page
│   └── _partials/               # Reusable components
│
├── assets/css/
│   └── styles.css               # Tailwind entry + theme (★★★)
│
├── content/                     # Markdown content
├── data/home/                   # Data-driven blocks
└── static/_headers              # Cloudflare security headers
```

## Critical Files

### assets/css/styles.css

Entry point for all styling. Structure:

```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
@plugin "daisyui";

/* Light theme */
@plugin "daisyui/theme" {
  name: 'brand-light';
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-base-100: oklch(99% 0.005 240);
  --color-base-content: oklch(18% 0.02 240);
  /* ... all semantic colors ... */
}

/* Dark theme */
@plugin "daisyui/theme" {
  name: 'brand-dark';
  default: false;
  prefersdark: true;
  color-scheme: dark;
  /* ... inverted colors ... */
}

/* Custom font stacks */
@theme {
  --font-display: 'Your Display Font', serif;
  --font-body: 'Your Body Font', sans-serif;
}

/* Custom component styles */
.hero-featured {
  /* Hero-specific styling */
}
```

### layouts/baseof.html

Master template. Key sections:

```html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}" data-theme="brand-light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ block "title" . }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>

    <!-- SEO partials -->
    {{ partial "seo/opengraph.html" . }} {{ partial "seo/twitter_cards.html" . }} {{ partial
    "seo/schema.html" . }}

    <!-- TailwindCSS pipeline -->
    {{ $css := resources.Get "css/styles.css" }} {{ $css = $css | css.PostCSS }} {{ if
    hugo.IsProduction }} {{ $css = $css | minify | fingerprint }} {{ end }}
    <link
      rel="stylesheet"
      href="{{ $css.RelPermalink }}"
      {{
      if
      hugo.IsProduction
      }}integrity="{{ $css.Data.Integrity }}"
      {{
      end
      }}
    />
  </head>
  <body class="min-h-screen bg-base-200 text-base-content">
    {{ partial "shared/header.html" . }}

    <main>{{ block "main" . }}{{ end }}</main>

    {{ partial "shared/footer.html" . }}
  </body>
</html>
```

### layouts/home.html

```html
{{ define "main" }} {{ partial "blocks/home/hero.html" . }}

<section class="container mx-auto px-4 py-16">
  <div class="prose max-w-none">{{ .Content }}</div>
</section>
{{ end }}
```

### layouts/single.html

```html
{{ define "main" }}
<article class="container mx-auto px-4 py-8">
  {{ with .Params.featured_image }}
  <figure class="mb-8">
    <img src="{{ . }}" alt="{{ $.Title }}" class="w-full rounded-lg shadow-lg">
  </figure>
  {{ end }}

  <header class="max-w-prose mx-auto mb-8">
    <h1 class="text-4xl font-display font-bold mb-4">{{ .Title }}</h1>
    <div class="text-base-content/60 flex gap-4">
      <time>{{ .Date.Format "January 2, 2006" }}</time>
      {{ with .Params.tags }}
      <div class="flex gap-2">
        {{ range . }}
        <a href="{{ "tags/" | relURL }}{{ . | urlize }}" class="badge badge-outline">{{ . }}</a>
        {{ end }}
      </div>
      {{ end }}
    </div>
  </header>

  {{ if .Params.toc }}
  <nav class="max-w-prose mx-auto mb-8 p-4 bg-base-100 rounded-lg">
    <h2 class="font-bold mb-2">Contents</h2>
    {{ .TableOfContents }}
  </nav>
  {{ end }}

  <div class="prose max-w-prose mx-auto">
    {{ .Content }}
  </div>
</article>
{{ end }}
```

### layouts/list.html

```html
{{ define "main" }}
<section class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-display font-bold mb-8">{{ .Title }}</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {{ range .Pages }}
    <article class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      {{ with .Params.featured_image }}
      <figure><img src="{{ . }}" alt="{{ $.Title }}" /></figure>
      {{ end }}
      <div class="card-body">
        <h2 class="card-title">
          <a href="{{ .RelPermalink }}" class="hover:text-primary">{{ .Title }}</a>
        </h2>
        <p class="text-base-content/70">{{ .Summary | truncate 120 }}</p>
        <div class="card-actions justify-end">
          <a href="{{ .RelPermalink }}" class="btn btn-primary btn-sm">Read more</a>
        </div>
      </div>
    </article>
    {{ end }}
  </div>

  {{ partial "shared/pagination.html" . }}
</section>
{{ end }}
```

## Partials

### \_partials/shared/header.html

```html
<header class="navbar bg-base-100 shadow sticky top-0 z-50">
  <div class="container mx-auto">
    <div class="flex-1">
      <a href="{{ "/" | relURL }}" class="btn btn-ghost text-xl font-display">
        {{ with .Site.Params.logo }}
        <img src="{{ . }}" alt="{{ $.Site.Title }}" class="h-8">
        {{ else }}
        {{ .Site.Title }}
        {{ end }}
      </a>
    </div>
    <nav class="flex-none">
      <ul class="menu menu-horizontal px-1">
        {{ range .Site.Menus.main }}
        <li><a href="{{ .URL }}" class="{{ if $.IsMenuCurrent "main" . }}active{{ end }}">{{ .Name }}</a></li>
        {{ end }}
      </ul>
      {{ range .Site.Menus.main_buttons }}
      <a href="{{ .URL }}" class="btn btn-primary btn-sm ml-2">{{ .Name }}</a>
      {{ end }}
    </nav>
  </div>
</header>
```

### \_partials/blocks/home/hero.html

Data-driven from `data/home/hero.yaml`:

```html
{{ $hero := .Site.Data.home.hero }}
<section class="hero min-h-[70vh] bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-2xl">
      <h1 class="text-5xl font-display font-bold">{{ $hero.title }}</h1>
      <p class="py-6 text-xl text-base-content/80">{{ $hero.subtitle }}</p>
      {{ with $hero.cta }}
      <a href="{{ .url }}" class="btn btn-primary btn-lg">{{ .text }}</a>
      {{ end }}
    </div>
  </div>
</section>
```

### \_partials/shared/pagination.html

```html
{{ $pag := .Paginator }} {{ if gt $pag.TotalPages 1 }}
<nav class="join flex justify-center mt-8" aria-label="Pagination">
  {{ if $pag.HasPrev }}
  <a href="{{ $pag.Prev.URL }}" class="join-item btn">«</a>
  {{ end }} {{ range $pag.Pagers }} {{ if eq . $pag }}
  <button class="join-item btn btn-active">{{ .PageNumber }}</button>
  {{ else if or (eq .PageNumber 1) (eq .PageNumber $pag.TotalPages) }}
  <a href="{{ .URL }}" class="join-item btn">{{ .PageNumber }}</a>
  {{ else if and (ge .PageNumber (sub $pag.PageNumber 2)) (le .PageNumber (add $pag.PageNumber 2))
  }}
  <a href="{{ .URL }}" class="join-item btn">{{ .PageNumber }}</a>
  {{ end }} {{ end }} {{ if $pag.HasNext }}
  <a href="{{ $pag.Next.URL }}" class="join-item btn">»</a>
  {{ end }}
</nav>
{{ end }}
```

## Config Files

### config/\_default/params.yaml

```yaml
title: 'Site Title'
description: 'Site description for SEO'
logo: '/images/logo.svg'
theme: 'brand-light'

social:
  twitter: '@handle'
  github: 'username'
```

### config/\_default/menus.yaml

```yaml
main:
  - name: 'Home'
    url: '/'
    weight: 1
  - name: 'Posts'
    url: '/posts/'
    weight: 2
  - name: 'About'
    url: '/about/'
    weight: 3

main_buttons:
  - name: 'Get Started'
    url: '/contact/'
    weight: 1

footer:
  - name: 'Privacy'
    url: '/privacy/'
  - name: 'Terms'
    url: '/terms/'
```

### data/home/hero.yaml

```yaml
title: 'Your Headline Here'
subtitle: 'Supporting text that explains your value proposition'
cta:
  text: 'Get Started'
  url: '/signup/'
```

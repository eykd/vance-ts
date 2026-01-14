# HTMX Integration in Hugo Templates

Patterns for integrating HTMX with Hugo Go templates for dynamic content.

## API Endpoint Configuration

Define endpoints in `hugo.toml`:

```toml
[params.api]
  contact = "/app/_/contact"
  comments = "/app/_/comments"
  search = "/app/_/search"
  newsletter = "/app/_/newsletter"
```

Access in templates:

```html
<form hx-post="{{ .Site.Params.api.contact }}"></form>
```

## Common HTMX Patterns

### Form Submission

```html
<form
  hx-post="{{ .Site.Params.api.contact }}"
  hx-target="#response"
  hx-swap="innerHTML"
  hx-indicator="#spinner"
>
  <input type="text" name="message" required />

  <button type="submit">
    Send
    <span id="spinner" class="loading loading-spinner htmx-indicator"></span>
  </button>
</form>

<div id="response"></div>
```

### Lazy Loading Content

```html
<div
  hx-get="{{ .Site.Params.api.comments }}?postId={{ .File.UniqueID }}"
  hx-trigger="load"
  hx-swap="innerHTML"
>
  <span class="loading loading-spinner"></span>
</div>
```

### Infinite Scroll

```html
{{ range first 10 .Pages }} {{ partial "card.html" . }} {{ end }} {{ if gt (len .Pages) 10 }}
<div
  hx-get="/api/posts?page=2"
  hx-trigger="revealed"
  hx-swap="afterend"
  hx-indicator="#load-more-spinner"
>
  <span id="load-more-spinner" class="loading loading-spinner htmx-indicator"></span>
</div>
{{ end }}
```

### Live Search

```html
<input
  type="search"
  name="q"
  placeholder="Search..."
  hx-get="{{ .Site.Params.api.search }}"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#search-results"
  hx-indicator="#search-spinner"
/>

<span id="search-spinner" class="loading loading-spinner htmx-indicator"></span>
<div id="search-results"></div>
```

### Like/Vote Button

```html
<button hx-post="/app/_/posts/{{ .File.UniqueID }}/like" hx-swap="outerHTML" class="btn btn-ghost">
  ❤️ <span>{{ .Params.likes | default 0 }}</span>
</button>
```

## HTMX with Alpine.js

### Combined Form State

```html
<form
  hx-post="{{ .Site.Params.api.contact }}"
  hx-target="#response"
  x-data="{ submitting: false, errors: {} }"
  @htmx:before-request="submitting = true; errors = {}"
  @htmx:after-request="submitting = false"
  @htmx:response-error="errors.general = 'Request failed'"
>
  <input type="text" name="name" :disabled="submitting" :class="{ 'input-error': errors.name }" />

  <button type="submit" :disabled="submitting">
    <span x-show="!submitting">Submit</span>
    <span x-show="submitting" class="loading loading-spinner"></span>
  </button>

  <div x-show="errors.general" class="alert alert-error" x-text="errors.general"></div>
</form>
```

### Modal with HTMX Content

```html
<div x-data="{ open: false }">
  <button @click="open = true" class="btn">Open Modal</button>

  <div x-show="open" x-transition class="modal modal-open" @keydown.escape.window="open = false">
    <div class="modal-box" @click.stop>
      <div hx-get="/app/_/modal-content" hx-trigger="intersect once" hx-swap="innerHTML">
        <span class="loading loading-spinner"></span>
      </div>
      <div class="modal-action">
        <button class="btn" @click="open = false">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="open = false"></div>
  </div>
</div>
```

## HTMX Triggers

### Common Trigger Patterns

```html
<!-- On click (default for buttons) -->
<button hx-get="/data" hx-trigger="click">Load</button>

<!-- On form submit -->
<form hx-post="/api" hx-trigger="submit">
  <!-- On page load -->
  <div hx-get="/data" hx-trigger="load">
    <!-- When element becomes visible -->
    <div hx-get="/data" hx-trigger="revealed">
      <!-- With delay (debouncing) -->
      <input hx-get="/search" hx-trigger="keyup changed delay:300ms" />

      <!-- Custom events -->
      <div hx-get="/refresh" hx-trigger="refreshData from:body"></div>
    </div>
  </div>
</form>
```

### HTMX Events in Alpine

```html
<div
  x-data="{ count: 0 }"
  @htmx:after-request="count++"
  @htmx:before-swap="console.log('Swapping content')"
>
  <p>Requests made: <span x-text="count"></span></p>
</div>
```

## Swap Strategies

```html
<!-- Replace inner content (default) -->
<div hx-swap="innerHTML">
  <!-- Replace entire element -->
  <div hx-swap="outerHTML">
    <!-- Append to end -->
    <div hx-swap="beforeend">
      <!-- Prepend to start -->
      <div hx-swap="afterbegin">
        <!-- No swap, just trigger events -->
        <button hx-swap="none"></button>
      </div>
    </div>
  </div>
</div>
```

## Response Headers

Server responses can include special headers:

```html
<!-- Server sends: HX-Trigger: {"notify": {"message": "Saved!", "type": "success"}} -->

<!-- Handle in toast container -->
<div
  @htmx:after-request.window="
  const trigger = $event.detail.xhr.getResponseHeader('HX-Trigger');
  if (trigger) {
    const data = JSON.parse(trigger);
    if (data.notify) showToast(data.notify);
  }
"
></div>
```

## Boost for SPA-like Navigation

Enable on body for all internal links:

```html
<body hx-boost="true">
  <!-- All <a href="/..."> become AJAX requests -->
  <a href="/about">About</a>
  <!-- Becomes HTMX request -->
</body>
```

## See Also

- [Layouts and Partials](./layouts-partials.md) - Template structure
- [Shortcodes](./shortcodes.md) - Embeddable components
- [htmx-pattern-library](../htmx-pattern-library/SKILL.md) - Comprehensive HTMX patterns

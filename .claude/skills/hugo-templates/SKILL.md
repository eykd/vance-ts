---
name: hugo-templates
description: 'Use when: (1) creating Hugo layouts with HTMX integration, (2) building partials for dynamic content, (3) writing shortcodes with Alpine.js state, (4) configuring params.api endpoints.'
---

# Hugo Templates

Create Hugo Go templates that integrate with HTMX for dynamic content and Alpine.js for client-side state.

## Quick Reference

| Template Type | Location                       | Purpose                             | Reference                                             |
| ------------- | ------------------------------ | ----------------------------------- | ----------------------------------------------------- |
| Base layout   | `layouts/_default/baseof.html` | Page wrapper with HTMX/Alpine setup | [layouts-partials.md](references/layouts-partials.md) |
| Partial       | `layouts/partials/*.html`      | Reusable template fragments         | [layouts-partials.md](references/layouts-partials.md) |
| Shortcode     | `layouts/shortcodes/*.html`    | Embeddable content components       | [shortcodes.md](references/shortcodes.md)             |
| List/Single   | `layouts/_default/*.html`      | Content type templates              | [layouts-partials.md](references/layouts-partials.md) |

## Core Concepts

### API Endpoint Configuration

Configure dynamic endpoints in `hugo.toml`:

```toml
[params.api]
  contact = "/app/_/contact"
  comments = "/app/_/comments"
  search = "/app/_/search"
```

Access in templates: `{{ .Site.Params.api.contact }}`

### HTMX Integration Pattern

```html
<form hx-post="{{ .Site.Params.api.contact }}" hx-target="#response" hx-swap="innerHTML">
  <input type="text" name="message" required />
  <button type="submit">Send</button>
</form>
<div id="response"></div>
```

### Alpine.js State Pattern

```html
<div x-data="{ submitting: false, errors: {} }">
  <form @htmx:before-request="submitting = true" @htmx:after-request="submitting = false">
    <button :disabled="submitting">
      <span x-show="!submitting">Submit</span>
      <span x-show="submitting">Loading...</span>
    </button>
  </form>
</div>
```

### Draft Content Handling

```html
{{ if not .Draft }} {{ .Content }} {{ end }}
```

### Content Security Policy (CSP)

Hugo static pages use **hash-based CSP** (not nonce-based). Inline scripts are allowed via SHA-256 hashes.

**Current approach**: `unsafe-inline` is used for simplicity (see `hugo/static/_headers` and `hugo/CLAUDE.md`).

**To migrate to hash-based CSP**:

1. **Find inline scripts**:

   ```bash
   grep -r "<script>" layouts/
   ```

2. **Compute SHA-256 hash for each script**:

   ```bash
   echo -n 'exact script content' | openssl dgst -sha256 -binary | openssl base64
   ```

3. **Update CSP in `hugo/static/_headers`**:

   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-HASH1' 'sha256-HASH2'
   ```

4. **Alternative: External scripts with SRI**:
   ```html
   <script
     src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
     integrity="sha384-HASH"
     crossorigin="anonymous"
     defer
   ></script>
   ```

**When to migrate**:

- User-generated content is added to site
- Stricter security requirements
- Third-party scripts no longer needed

**DO NOT use nonce-based CSP** for static Hugo pages (nonces only work for dynamic per-request responses).

## Workflow

1. **Need a page wrapper?** → Create/edit `baseof.html`
2. **Need reusable HTML?** → Create a partial
3. **Need embeddable content?** → Create a shortcode
4. **Need HTMX endpoint?** → Configure in `hugo.toml` params.api

## Detailed References

- [Layouts and Partials](references/layouts-partials.md) - Base templates, content layouts, reusable partials
- [Shortcodes](references/shortcodes.md) - Contact forms, comment sections, search widgets
- [HTMX Integration](references/htmx-integration.md) - Attributes, triggers, response handling

## Related Skills

- [htmx-pattern-library](../htmx-pattern-library/SKILL.md) - HTMX attribute patterns and best practices
- [tailwind-daisyui-design](../tailwind-daisyui-design/SKILL.md) - DaisyUI component styling for templates
- [hypermedia-pattern-advisor](../hypermedia-pattern-advisor/SKILL.md) - Choosing HTMX vs Alpine patterns

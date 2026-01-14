# Shortcodes

Shortcodes are reusable components embedded in Hugo content files using `{{</* shortcode */>}}` syntax.

## Contact Form Shortcode

`layouts/shortcodes/contact-form.html`:

```html
<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
  <div class="card-body">
    <h2 class="card-title text-2xl mb-4">Get in Touch</h2>

    <form
      hx-post="{{ .Site.Params.api.contact }}"
      hx-target="#contact-response"
      hx-swap="innerHTML"
      hx-indicator="#contact-spinner"
      x-data="{
            form: { name: '', email: '', message: '' },
            submitting: false,
            validate() {
              return this.form.name.length >= 2 &&
                     this.form.email.includes('@') &&
                     this.form.message.length >= 10;
            }
          }"
      @htmx:before-request="submitting = true"
      @htmx:after-request="submitting = false; if($event.detail.successful) form = { name: '', email: '', message: '' }"
      class="space-y-4"
    >
      <div class="form-control">
        <label class="label">
          <span class="label-text">Your Name *</span>
        </label>
        <input
          type="text"
          name="name"
          x-model="form.name"
          class="input input-bordered"
          required
          minlength="2"
          :disabled="submitting"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Email Address *</span>
        </label>
        <input
          type="email"
          name="email"
          x-model="form.email"
          class="input input-bordered"
          required
          :disabled="submitting"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Message *</span>
        </label>
        <textarea
          name="message"
          x-model="form.message"
          class="textarea textarea-bordered h-32"
          required
          minlength="10"
          :disabled="submitting"
        ></textarea>
      </div>

      <div class="flex items-center gap-4">
        <button type="submit" class="btn btn-primary" :disabled="submitting || !validate()">
          <span x-show="!submitting">Send Message</span>
          <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
        </button>
        <span id="contact-spinner" class="loading loading-spinner htmx-indicator"></span>
      </div>
    </form>

    <div id="contact-response" class="mt-4"></div>
  </div>
</div>
```

**Usage in content:**

```markdown
---
title: Contact Us
---

We'd love to hear from you!

{{</* contact-form */>}}
```

## Comment Section Shortcode

`layouts/shortcodes/comment-section.html`:

```html
{{ $postId := .Get "postId" | default .Page.File.UniqueID }}

<section class="mt-16">
  <h2 class="text-2xl font-bold mb-8">Comments</h2>

  <!-- Comment Form -->
  <div class="card bg-base-100 shadow mb-8">
    <div class="card-body">
      <form
        hx-post="{{ .Site.Params.api.comments }}"
        hx-target="#comment-list"
        hx-swap="afterbegin"
        hx-on::after-request="if(event.detail.successful) this.reset()"
        x-data="{ submitting: false }"
        @htmx:before-request="submitting = true"
        @htmx:after-request="submitting = false"
        class="space-y-4"
      >
        <input type="hidden" name="postId" value="{{ $postId }}" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Name</span></label>
            <input
              type="text"
              name="name"
              class="input input-bordered"
              required
              minlength="2"
              :disabled="submitting"
            />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input
              type="email"
              name="email"
              class="input input-bordered"
              required
              :disabled="submitting"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Comment</span></label>
          <textarea
            name="content"
            class="textarea textarea-bordered h-24"
            required
            minlength="10"
            :disabled="submitting"
          ></textarea>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="submitting">Post Comment</button>
      </form>
    </div>
  </div>

  <!-- Comment List -->
  <div
    id="comment-list"
    hx-get="{{ .Site.Params.api.comments }}?postId={{ $postId }}"
    hx-trigger="load"
    hx-swap="innerHTML"
  >
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </div>
</section>
```

**Usage:**

```markdown
{{</* comment-section */>}}

<!-- Or with custom post ID -->

{{</* comment-section postId="custom-id-123" */>}}
```

## Newsletter Signup Shortcode

`layouts/shortcodes/newsletter.html`:

```html
<div class="bg-primary text-primary-content py-8 px-4 rounded-lg">
  <div class="max-w-md mx-auto text-center">
    <h3 class="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>

    <form
      hx-post="{{ .Site.Params.api.newsletter }}"
      hx-target="#newsletter-response"
      hx-swap="innerHTML"
      x-data="{ email: '', subscribed: false }"
      @htmx:after-swap="if($event.detail.successful) subscribed = true"
      class="flex flex-col sm:flex-row gap-2"
      x-show="!subscribed"
    >
      <input
        type="email"
        name="email"
        x-model="email"
        placeholder="your@email.com"
        class="input input-bordered flex-1"
        required
      />

      <button type="submit" class="btn btn-secondary" :disabled="!email.includes('@')">
        Subscribe
      </button>
    </form>

    <div id="newsletter-response"></div>

    <div x-show="subscribed" x-transition class="alert alert-success">Thanks for subscribing!</div>
  </div>
</div>
```

## Search Widget Shortcode

`layouts/shortcodes/search.html`:

```html
<div x-data="{ query: '', hasResults: false }" class="relative">
  <input
    type="search"
    x-model="query"
    name="q"
    placeholder="Search..."
    class="input input-bordered w-full"
    hx-get="{{ .Site.Params.api.search }}"
    hx-trigger="keyup changed delay:300ms"
    hx-target="#search-results"
    @htmx:after-swap="hasResults = $el.querySelector('#search-results').innerHTML.trim().length > 0"
  />

  <div
    id="search-results"
    x-show="query.length > 0 && hasResults"
    x-transition
    class="absolute top-full left-0 right-0 mt-2 bg-base-100 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
  ></div>
</div>
```

## Shortcode Parameters

Access parameters in shortcodes:

```html
{{ $title := .Get "title" | default "Default Title" }} {{ $class := .Get "class" }}

<div class="{{ $class }}">
  <h3>{{ $title }}</h3>
  {{ .Inner }}
</div>
```

**Usage:**

```markdown
{{</* myshortcode title="Custom Title" class="special" */>}}
Content goes here
{{</* /myshortcode */>}}
```

## See Also

- [Layouts and Partials](./layouts-partials.md) - Page structure templates
- [HTMX Integration](./htmx-integration.md) - Dynamic content patterns

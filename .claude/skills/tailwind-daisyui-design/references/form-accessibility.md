# Accessible Form Patterns

## Contents

1. [Form Control Structure](#form-control-structure)
2. [Input Types](#input-types)
3. [Validation Patterns](#validation-patterns)
4. [Error Handling](#error-handling)
5. [Complex Form Layouts](#complex-form-layouts)

## Form Control Structure

### Basic Pattern (Always Use)

```html
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">Field Label</span>
    <span class="label-text-alt">Optional</span>
  </div>
  <input type="text" class="input input-bordered" id="field-id" />
  <div class="label">
    <span class="label-text-alt">Helper text</span>
  </div>
</label>
```

### With Required Field

```html
<label class="form-control w-full">
  <div class="label">
    <span class="label-text"> Email <span class="text-error">*</span> </span>
  </div>
  <input type="email" class="input input-bordered" required aria-required="true" />
</label>
```

### With Description Link

```html
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">Password</span>
  </div>
  <input
    type="password"
    class="input input-bordered"
    id="password"
    aria-describedby="password-requirements"
  />
  <div class="label">
    <span class="label-text-alt" id="password-requirements">
      Minimum 8 characters with one number
    </span>
  </div>
</label>
```

## Input Types

### Text Input

```html
<input type="text" class="input input-bordered w-full" placeholder="Enter text" />
<input type="text" class="input input-bordered input-sm" />
<!-- Small -->
<input type="text" class="input input-bordered input-lg" />
<!-- Large -->
```

### Select

```html
<select class="select select-bordered w-full">
  <option disabled selected>Choose an option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### Textarea

```html
<textarea
  class="textarea textarea-bordered w-full"
  rows="4"
  placeholder="Enter description"
></textarea>
```

### Checkbox

```html
<label class="label cursor-pointer justify-start gap-3">
  <input type="checkbox" class="checkbox checkbox-primary" />
  <span class="label-text">I agree to the terms</span>
</label>
```

### Checkbox Group

```html
<fieldset>
  <legend class="label-text mb-2">Select interests</legend>
  <div class="space-y-2">
    <label class="label cursor-pointer justify-start gap-3">
      <input type="checkbox" name="interests" value="tech" class="checkbox" />
      <span class="label-text">Technology</span>
    </label>
    <label class="label cursor-pointer justify-start gap-3">
      <input type="checkbox" name="interests" value="design" class="checkbox" />
      <span class="label-text">Design</span>
    </label>
  </div>
</fieldset>
```

### Radio Group

```html
<fieldset>
  <legend class="label-text mb-2">Select plan</legend>
  <div class="space-y-2">
    <label class="label cursor-pointer justify-start gap-3">
      <input type="radio" name="plan" value="basic" class="radio radio-primary" />
      <span class="label-text">Basic - $9/mo</span>
    </label>
    <label class="label cursor-pointer justify-start gap-3">
      <input type="radio" name="plan" value="pro" class="radio radio-primary" />
      <span class="label-text">Pro - $19/mo</span>
    </label>
  </div>
</fieldset>
```

### Toggle

```html
<label class="label cursor-pointer">
  <span class="label-text">Enable notifications</span>
  <input type="checkbox" class="toggle toggle-primary" />
</label>
```

### File Input

```html
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">Upload document</span>
  </div>
  <input type="file" class="file-input file-input-bordered w-full" />
  <div class="label">
    <span class="label-text-alt">PDF, DOC up to 10MB</span>
  </div>
</label>
```

## Validation Patterns

### Client-Side Validation States

```html
<!-- Success state -->
<input type="text" class="input input-bordered input-success" />

<!-- Error state -->
<input type="text" class="input input-bordered input-error" />

<!-- Warning state -->
<input type="text" class="input input-bordered input-warning" />
```

### Inline Validation with Alpine.js

```html
<label class="form-control w-full" x-data="{ email: '', touched: false }">
  <div class="label">
    <span class="label-text">Email</span>
  </div>
  <input
    type="email"
    class="input input-bordered"
    :class="{ 
           'input-error': touched && !email.includes('@'),
           'input-success': touched && email.includes('@') 
         }"
    x-model="email"
    @blur="touched = true"
    aria-describedby="email-error"
  />
  <div class="label" x-show="touched && !email.includes('@')" x-cloak>
    <span class="label-text-alt text-error" id="email-error">
      Please enter a valid email address
    </span>
  </div>
</label>
```

### Server-Side Error Pattern

```html
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">Username</span>
  </div>
  <input
    type="text"
    class="input input-bordered input-error"
    value="taken_name"
    aria-invalid="true"
    aria-describedby="username-error"
  />
  <div class="label">
    <span class="label-text-alt text-error" id="username-error" role="alert">
      This username is already taken
    </span>
  </div>
</label>
```

## Error Handling

### Form-Level Error Summary

```html
<form>
  <!-- Error summary at top of form -->
  <div class="alert alert-error mb-4" role="alert" aria-labelledby="error-heading">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    <div>
      <h2 id="error-heading" class="font-bold">Please fix the following errors:</h2>
      <ul class="list-disc list-inside text-sm mt-1">
        <li><a href="#email" class="underline">Email is required</a></li>
        <li><a href="#password" class="underline">Password must be at least 8 characters</a></li>
      </ul>
    </div>
  </div>

  <!-- Form fields -->
</form>
```

### HTMX Error Response Pattern

```html
<!-- Server returns this on validation error -->
<div class="alert alert-error" role="alert">
  <span>Unable to save: Please check the form for errors</span>
</div>
```

## Complex Form Layouts

### Two-Column Layout

```html
<form class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="form-control">
      <div class="label"><span class="label-text">First Name</span></div>
      <input type="text" class="input input-bordered" />
    </label>
    <label class="form-control">
      <div class="label"><span class="label-text">Last Name</span></div>
      <input type="text" class="input input-bordered" />
    </label>
  </div>

  <label class="form-control">
    <div class="label"><span class="label-text">Email</span></div>
    <input type="email" class="input input-bordered" />
  </label>

  <div class="flex justify-end gap-2 pt-4">
    <button type="button" class="btn btn-ghost">Cancel</button>
    <button type="submit" class="btn btn-primary">Save</button>
  </div>
</form>
```

### Card Form

```html
<div class="card bg-base-100 shadow-xl max-w-lg mx-auto">
  <div class="card-body">
    <h2 class="card-title">Create Account</h2>
    <form class="space-y-4">
      <label class="form-control w-full">
        <div class="label"><span class="label-text">Full Name</span></div>
        <input type="text" class="input input-bordered" required />
      </label>
      <label class="form-control w-full">
        <div class="label"><span class="label-text">Email</span></div>
        <input type="email" class="input input-bordered" required />
      </label>
      <label class="form-control w-full">
        <div class="label"><span class="label-text">Password</span></div>
        <input type="password" class="input input-bordered" required />
      </label>
      <label class="label cursor-pointer justify-start gap-3">
        <input type="checkbox" class="checkbox checkbox-primary" required />
        <span class="label-text"
          >I agree to the <a href="/terms" class="link link-primary">Terms</a></span
        >
      </label>
      <div class="card-actions justify-end">
        <button type="submit" class="btn btn-primary w-full">Create Account</button>
      </div>
    </form>
  </div>
</div>
```

### Inline Form (Search)

```html
<form class="join w-full max-w-md">
  <input
    type="search"
    class="input input-bordered join-item flex-1"
    placeholder="Search..."
    aria-label="Search"
  />
  <button type="submit" class="btn btn-primary join-item">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </button>
</form>
```

## Accessibility Checklist

- [ ] Every input has a visible `<label>` or `aria-label`
- [ ] Required fields marked with `required` attribute and visual indicator
- [ ] Error messages linked with `aria-describedby`
- [ ] Error states use `aria-invalid="true"`
- [ ] Form errors announced with `role="alert"`
- [ ] Focus visible on all interactive elements (DaisyUI default)
- [ ] Tab order follows visual order
- [ ] Submit buttons have clear action text (not just "Submit")

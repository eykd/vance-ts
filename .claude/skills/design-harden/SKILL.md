---
name: design-harden
description: Improve interface resilience through better error handling, i18n support, text overflow handling, and edge case management. Makes interfaces robust and production-ready. Use after implementation to catch real-world breakage.
args:
  - name: target
    description: The feature or area to harden (optional)
    required: false
    user-invocable: true
---

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: deployment target, expected user locales, and error handling strategy.

> **Security Note**: Changes to `static/_headers`, Content Security Policy, caching headers, or service worker configuration must be reviewed against the project's security policies in CLAUDE.md before applying. Do not weaken existing security headers to accommodate design changes.

---

Strengthen interfaces against edge cases, errors, internationalization issues, and real-world usage scenarios that break idealized designs.

## Assess Hardening Needs

Identify weaknesses and edge cases:

1. **Test with extreme inputs**:
   - Very long text (names, descriptions, titles)
   - Very short text (empty, single character)
   - Special characters (emoji, RTL text, accents)
   - Large numbers (millions, billions)
   - Many items (1000+ list items, 50+ options)
   - No data (empty states)

2. **Test error scenarios**:
   - Network failures (offline, slow, timeout)
   - API errors (400, 401, 403, 404, 500)
   - Validation errors
   - Permission errors
   - Rate limiting
   - Concurrent operations

3. **Test internationalization**:
   - Long translations (German is often 30% longer than English)
   - RTL languages (Arabic, Hebrew)
   - Character sets (Chinese, Japanese, Korean, emoji)
   - Date/time formats
   - Number formats (1,000 vs 1.000)
   - Currency symbols

**CRITICAL**: Designs that only work with perfect data aren't production-ready. Harden against reality.

## Hardening Dimensions

Systematically improve resilience:

### Text Overflow & Wrapping

**Long text handling** — use Tailwind utilities:

- `truncate` — single line with ellipsis (`overflow-hidden text-ellipsis whitespace-nowrap`)
- `line-clamp-3` — multi-line clamp (`@tailwindcss/line-clamp` or native `line-clamp-*`)
- `break-words` — allow wrapping (`overflow-wrap: break-word`)

**Flex/Grid overflow** — prevent items from overflowing:

- Add `min-w-0` to flex/grid items to allow shrinking below content size
- Add `overflow-hidden` where content must be contained

**Responsive text sizing**:

- Use `clamp()` for fluid typography or Tailwind's responsive type scale (`text-sm md:text-base lg:text-lg`)
- Set minimum readable sizes (14px on mobile)
- Test text scaling (zoom to 200%)
- Ensure containers expand with text

### Internationalization (i18n)

**Text expansion**:

- Add 30-40% space budget for translations
- Use flexbox/grid that adapts to content — Tailwind `flex`, `grid` utilities
- Test with longest language (usually German)
- Avoid fixed widths on text containers — use `px-4 py-2` not `w-24`

**RTL (Right-to-Left) support**:

- Use CSS logical properties: `ms-4` (margin-inline-start), `ps-4` (padding-inline-start), `border-e` (border-inline-end) — Tailwind 4 supports these natively
- Use `dir="rtl"` attribute for RTL content sections

**Character set support**:

- Use UTF-8 encoding everywhere
- Test with Chinese/Japanese/Korean (CJK) characters
- Test with emoji (they can be 2-4 bytes)
- Handle different scripts (Latin, Cyrillic, Arabic, etc.)

**Date/Time formatting**:

```javascript
// Use Intl API for proper formatting
new Intl.DateTimeFormat('en-US').format(date); // 1/15/2024
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(1234.56); // $1,234.56
```

### Error Handling

**Network errors**:

- Show clear error messages — use DaisyUI `alert alert-error` with recovery actions
- Provide retry button — use DaisyUI `btn` with HTMX `hx-get` for retry
- Handle timeout scenarios — HTMX `hx-timeout` attribute
- Consider offline mode where applicable

**Form validation errors**:

- Inline errors near fields — use DaisyUI `label-text-alt` with `text-error`
- Clear, specific messages
- Preserve user input on error
- Use HTMX `hx-validate` for server-side validation feedback

**API errors** — handle each status code appropriately:

- 400: Show validation errors inline
- 401: Redirect to login
- 403: Show permission error — DaisyUI `alert alert-warning`
- 404: Show not found state
- 429: Show rate limit message with retry timing
- 500: Show generic error with support contact — DaisyUI `alert alert-error`

**Graceful degradation**:

- Core content accessible without JavaScript (Hugo static output)
- Progressive enhancement with HTMX and Alpine.js
- Images have alt text
- Fallbacks for unsupported CSS features

### Edge Cases & Boundary Conditions

**Empty states**:

- No items in list — provide clear next action with DaisyUI `hero` or `card` component
- No search results — suggest alternative queries
- No data to display — use helpful empty state illustrations

**Loading states**:

- Initial load — DaisyUI `loading loading-spinner` or `skeleton` components
- HTMX partial load — use `hx-indicator` with DaisyUI loading components
- Show what's loading ("Loading your projects...")

**Large datasets**:

- Pagination or virtual scrolling
- Search/filter capabilities
- Don't load all items at once — use HTMX `hx-trigger="revealed"` for lazy loading

**Concurrent operations**:

- Prevent double-submission — disable button with Alpine.js `x-bind:disabled` or HTMX `hx-disable-elt`
- Handle race conditions with HTMX `hx-sync`
- Optimistic updates with rollback

### Accessibility Resilience (WCAG 2.2)

**Keyboard navigation**:

- All functionality accessible via keyboard
- Logical tab order
- Focus management in modals — DaisyUI `modal` handles this when used with `<dialog>`
- Skip links for long content

**Screen reader support**:

- Proper ARIA labels on interactive elements
- Announce dynamic changes — use `aria-live` regions for HTMX swaps
- Descriptive alt text on images
- Semantic HTML throughout Hugo templates

**Motion sensitivity**:

- Respect `prefers-reduced-motion` — use Tailwind `motion-reduce:*` variant
- All animations must have reduced-motion alternatives

**High contrast mode**:

- Test in Windows high contrast mode
- Don't rely only on color for meaning — add icons or text labels
- Provide alternative visual cues

### Performance Resilience

**Slow connections**:

- Progressive image loading — Hugo image processing pipeline
- Skeleton screens — DaisyUI `skeleton` component
- HTMX partial loading for progressive enhancement
- Consider service worker for offline support

**Throttling & Debouncing** — for Alpine.js event handlers:

```javascript
// Debounce search input with Alpine.js
x-on:input.debounce.300ms="search($event.target.value)"

// Or with HTMX
hx-trigger="keyup changed delay:300ms"
```

## Testing Strategies

**Manual testing**:

- Test with extreme data (very long, very short, empty)
- Test offline and on throttled 3G connection
- Test with screen reader
- Test keyboard-only navigation
- Test at all Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`)

**Automated testing**:

- Unit tests for edge cases
- Integration tests for error scenarios
- Accessibility tests (axe, WAVE)
- Visual regression tests

**IMPORTANT**: Hardening is about expecting the unexpected. Real users will do things you never imagined.

**NEVER**:

- Assume perfect input (validate everything)
- Ignore internationalization (design for global)
- Leave error messages generic ("Error occurred") — use DaisyUI alerts with specific, helpful messages
- Forget offline scenarios
- Trust client-side validation alone
- Use fixed widths for text
- Assume English-length text
- Block entire interface when one component errors

## Verify Hardening

Test thoroughly with edge cases:

- **Long text**: Try names with 100+ characters
- **Emoji**: Use emoji in all text fields
- **RTL**: Test with Arabic or Hebrew
- **CJK**: Test with Chinese/Japanese/Korean
- **Network issues**: Disable internet, throttle connection
- **Large datasets**: Test with 1000+ items
- **Concurrent actions**: Click submit 10 times rapidly
- **Errors**: Force API errors, test all error states
- **Empty**: Remove all data, test empty states
- **Accessibility**: Verify WCAG 2.2 AAA compliance across all states

**Related skills**: `/design-adapt` — for responsive cross-device resilience; `/tailwind-daisyui-design` — for accessible component patterns

Remember: You're hardening for production reality, not demo perfection. Expect users to input weird data, lose connection mid-flow, and use your product in unexpected ways. Build resilience into every component.

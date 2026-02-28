# Color Roles & Size Scale

## Layer 1 — Color Roles (Tone)

Color is assigned by **role**, never by hex value. Four brand roles and four semantic tones.

### Brand Roles

| Role          | Purpose                     | When to use                                                |
| ------------- | --------------------------- | ---------------------------------------------------------- |
| **primary**   | Main brand color            | Primary CTAs, main interactive elements, key links         |
| **secondary** | Supporting brand color      | Secondary actions, supporting UI elements                  |
| **accent**    | Attention-drawing highlight | Badges, highlights, notification counts, decorative detail |
| **chrome**    | Structural interface color  | Backgrounds, borders, dividers, toolbars, sidebars         |

### Semantic Tones

| Tone            | Purpose               | When to use                                          |
| --------------- | --------------------- | ---------------------------------------------------- |
| **success**     | Positive outcome      | Confirmations, completed states, saved indicators    |
| **destructive** | Danger / irreversible | Delete actions, error states, validation failures    |
| **warning**     | Caution required      | Approaching limits, unsaved changes, degraded states |
| **info**        | Neutral information   | Tips, help text, informational banners               |

### Chrome Surface Levels

Chrome uses a three-step luminance scale for depth:

| Level       | Role                           | Example                                 |
| ----------- | ------------------------------ | --------------------------------------- |
| **surface** | Page background                | The base layer everything sits on       |
| **raised**  | Card / sidebar / elevated area | Slightly lighter or darker than surface |
| **border**  | Dividers, outlines, separators | Visible line between regions            |

These three levels create visual depth without introducing new color hues.

### Content Pairing

Every color role has a paired **content** color — the foreground that sits on top of its background. When you specify "primary solid button," the background is the primary role color and the text is its content pair. This pairing is automatic and does not need to be stated in descriptions.

---

## Layer 2 — Size Scale

A single named scale applied uniformly to **every** spatial property: padding, gap, font size, border radius, shadow depth, icon size, and control height.

| Name                   | Shorthand | Typical use                                                           |
| ---------------------- | --------- | --------------------------------------------------------------------- |
| **extra-small**        | xs        | Tight internal gaps, thin borders, icon details, compact badges       |
| **small**              | sm        | Compact padding, minor gaps, small text, dense tables                 |
| **medium**             | md        | Default for everything — body text, standard controls, normal spacing |
| **large**              | lg        | Comfortable padding, prominent gaps, large controls, touch targets    |
| **extra-large**        | xl        | Generous padding, section-level spacing, headlines, hero elements     |
| **double-extra-large** | 2xl       | Major section breaks, hero-level spacing (spacing/text only)          |
| **triple-extra-large** | 3xl       | Maximum breathing room, splash screens (spacing/text only)            |

### Key insight

The same word means the same thing across all properties. "Size large" on a button controls its height, padding, font size, and radius simultaneously. A mobile button and a desktop button may have different pixel dimensions, but both are "size large" — the number changes per platform, the word does not.

### Using the scale in descriptions

- **Component sizing**: "button size large", "input size small", "badge size extra-small"
- **Spacing**: "gap medium", "pad large", "pad-x extra-large"
- **Typography**: "heading extra-large bold", "body text medium", "caption small"
- **Radius**: "radius large" (or use default which inherits from component type)
- **Shadow**: "shadow small", "shadow large"

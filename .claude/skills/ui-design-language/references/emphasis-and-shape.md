# Emphasis & Shape

## Emphasis Levels

Emphasis controls **visual weight** — how prominently an element demands attention. Six levels from heaviest to lightest. Use emphasis to build clear visual hierarchy: one solid primary CTA surrounded by softer supporting actions.

### Solid (default)

Full background fill with contrasting content text. Maximum visual weight.

**Use for**: Primary calls to action, the single most important interactive element in a region.

_Example_: "primary solid button size large" — the main "Submit" or "Save" action.

### Soft

Tinted background at reduced opacity of the tone color. Gentler than solid but clearly present.

**Use for**: Tags, status indicators, secondary info that needs presence without dominance, category labels.

_Example_: "success soft badge size small" — a "Completed" status tag.

### Outline

Transparent background with a colored border. Text and border take the tone color.

**Use for**: Secondary actions that should be clearly interactive but not dominant. Often paired alongside a solid primary action.

_Example_: "primary outline button size medium" — an "Edit" button next to a solid "Save" button.

### Dash

Dashed border with transparent background. Lighter than outline. Connotes "placeholder" or "add new."

**Use for**: Empty states, optional drop zones, "add item" affordances, upload targets.

_Example_: "accent dash card, pad large" — a "Drop files here" zone.

### Ghost

No background, no border. Element appears as plain text until hovered/focused, when the tone color appears.

**Use for**: Tertiary actions, icon-only buttons in toolbars, navigation items, actions within dense lists.

_Example_: "chrome ghost button size small" — a toolbar icon button.

### Link

Styled text with no button chrome at all. Lowest visual weight for action elements.

**Use for**: Inline actions within text, navigation that should look like a hyperlink, "Learn more" or "See all" links.

_Example_: "primary link button" — a "View details" text link.

---

## Choosing Emphasis: A Hierarchy Guide

Within any region, use this pattern to establish clear visual hierarchy:

| Priority                  | Emphasis        | Typical count per region |
| ------------------------- | --------------- | ------------------------ |
| Primary action            | solid           | 1                        |
| Secondary action(s)       | outline or soft | 1–2                      |
| Tertiary action(s)        | ghost or link   | as many as needed        |
| Placeholder / empty state | dash            | as needed                |

Avoid placing two solid-emphasis elements side by side — it flattens the hierarchy.

---

## Shape

Shape controls the **physical form** of an element via border radius.

| Shape       | Visual effect                         | When to use                                               |
| ----------- | ------------------------------------- | --------------------------------------------------------- |
| **default** | Rounded corners per theme setting     | Standard — use unless you have a reason to override       |
| **pill**    | Fully rounded ends                    | Tags, chips, pill-shaped buttons, search bars             |
| **square**  | Sharp 90° corners                     | Dense UI, data tables, tiled grids, technical interfaces  |
| **circle**  | Perfect circle (equal width + height) | Icon-only buttons, avatars, status dots, floating actions |

### Specifying shape in descriptions

Shape is **optional** — omit it to use the theme default. Only state shape when it deviates from the default:

- "primary solid button size medium" → default shape (theme decides radius)
- "primary solid button size medium, pill shape" → explicitly pill
- "accent ghost button, circle shape" → circular icon button
- "chrome outline card, square shape" → sharp-cornered card

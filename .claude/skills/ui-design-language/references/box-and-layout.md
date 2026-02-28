# Box Primitive & Layout

## The Box Primitive

Every element on screen is a **box**. A card is a decorated box. A button is a box with an action. A screen is a stack of boxes. All layout reduces to configuring boxes and nesting them.

### Box Properties

Every box accepts these token-driven properties (all values from the named scales):

| Property                   | Values                                                        | Description                           |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| **direction**              | vertical stack · horizontal stack · horizontal wrap · overlay | How children are arranged             |
| **gap**                    | xs – 3xl                                                      | Space between children                |
| **padding**                | xs – 3xl (optionally pad-x, pad-y)                            | Internal space around content         |
| **alignment (main axis)**  | start · center · end · between                                | Distribution along the flow direction |
| **alignment (cross axis)** | start · center · end · stretch                                | Positioning perpendicular to flow     |
| **fill**                   | any color role or surface level                               | Background color                      |
| **border**                 | thin · medium · thick + any color role                        | Edge decoration                       |
| **radius**                 | xs – xl, or theme default                                     | Corner rounding                       |
| **shadow**                 | xs – xl                                                       | Elevation / depth effect              |
| **overflow**               | hidden · auto · visible                                       | How overflowing content is handled    |

### Layout Modes

**Vertical stack** — children flow top-to-bottom. The default for page sections, card content, form fields.

**Horizontal stack** — children flow left-to-right. For nav bars, button groups, inline elements.

**Horizontal wrap** — like horizontal stack, but wraps to the next line when space runs out. For tag clouds, card grids, responsive galleries.

**Overlay** — children stack on top of each other in the same space. For image overlays, floating badges on avatars, hero text over background images.

---

## Describing Layout in Prose

Use natural language with the vocabulary terms:

- "vertical stack, gap medium, pad large"
- "horizontal stack, gap small, aligned center"
- "horizontal wrap, gap medium"
- "overlay — image fills the box, text centered on top"

For alignment, specify axis when ambiguous:

- "justify between" (main axis — space items out)
- "items center" (cross axis — vertically center in a row)

---

## Screen Description Conventions

### Structure

Describe a screen as an indented tree. Each line names a box or pattern with its key properties.

```
Screen: [Screen Name]
├─ [region]: [box properties]
│  ├─ [child element]: [sentence description]
│  └─ [child element]: [sentence description]
├─ [region]: [box properties]
│  └─ [nested layout]: [box properties]
│     ├─ [item]
│     └─ [item]
└─ [region]: [box properties]
```

### Conventions

- **Indentation** shows nesting / parent-child relationships.
- **Region names** are plain descriptive labels: header, main, sidebar, footer, card-grid, form-section.
- **Pattern sentences** follow the formula: `[tone] [emphasis] [pattern] size [size]`.
- **Box properties** on a region line describe its layout: direction, gap, padding, alignment.
- **Content annotations** use plain language in quotes: `"Sign Up"`, `"Total Revenue"`.
- **Responsive notes** append with comma: `"size small on mobile, size large on desktop"`.
- **State notes** in parentheses: `(active: primary)`, `(disabled)`, `(loading)`.

### Full Example

```
Screen: Project Dashboard
├─ navbar: chrome raised, horizontal stack, pad-x large, pad-y small, items center, justify between
│  ├─ horizontal stack, gap small, items center
│  │  ├─ logo icon size medium
│  │  └─ heading medium bold "Acme Projects"
│  ├─ horizontal stack, gap extra-small
│  │  ├─ chrome ghost button "Projects"
│  │  ├─ chrome ghost button "Team"
│  │  └─ chrome ghost button "Reports"
│  └─ horizontal stack, gap small, items center
│     ├─ info soft badge size small "3 notifications"
│     └─ avatar, circle shape, size small
├─ main: vertical stack, gap extra-large, pad extra-large
│  ├─ horizontal stack, justify between, items center
│  │  ├─ heading extra-large bold "Active Projects"
│  │  └─ primary solid button size medium "New Project"
│  ├─ horizontal wrap, gap medium
│  │  ├─ chrome outline card, pad large, shadow small
│  │  │  ├─ stat: label "Total Projects" / value "24"
│  │  │  └─ success soft badge "↑ 12%"
│  │  ├─ chrome outline card, pad large, shadow small
│  │  │  └─ stat: label "On Track" / value "18"
│  │  └─ chrome outline card, pad large, shadow small
│  │     ├─ stat: label "At Risk" / value "3"
│  │     └─ warning soft badge "needs attention"
│  └─ chrome outline card, pad medium
│     ├─ heading medium "Recent Activity"
│     └─ table, size medium, zebra striping
│        columns: "Project" · "Status" · "Updated" · "Actions"
│        (each row has a chrome ghost button "View")
└─ dock: chrome raised, size medium (visible on mobile only)
   ├─ icon "home" (active: primary)
   ├─ icon "folder"
   ├─ icon "users"
   └─ icon "chart"
```

### Tips

- Start with the outermost regions, then drill into each one.
- Name every region — "main content area" not just "a div."
- Specify emphasis explicitly for actions to define visual hierarchy.
- Add responsive qualifiers only where the behavior differs from the default flow.
- For repeated items (table rows, card grids), describe one item then note "repeated for each [entity]."

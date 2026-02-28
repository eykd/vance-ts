# Pattern Catalog

~30 reusable patterns in six categories. All patterns accept the four dimensions (tone, size, emphasis, shape) unless noted.

## Containers

Hold other elements and provide visual grouping.

| Pattern            | Description                               | Notes                                                    |
| ------------------ | ----------------------------------------- | -------------------------------------------------------- |
| **card**           | Rectangular container for grouped content | Emphasis: outline (border), dash, soft. Size: xs–xl.     |
| **modal / dialog** | Overlay for focused interaction           | Blocks background interaction. Typically chrome surface. |
| **accordion**      | Expandable/collapsible sections           | Arrow or plus indicator. Vertical stacking.              |
| **fieldset**       | Accessible form element grouping          | Label at top, groups related inputs.                     |

## Actions

Elements the user clicks or taps to trigger behavior.

| Pattern                    | Description                       | Notes                                                                |
| -------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| **button**                 | Primary interactive element       | All four dimensions fully apply. Circle/square shapes for icon-only. |
| **dropdown**               | Button that reveals a menu        | Trigger is a button; content is a menu pattern.                      |
| **swap**                   | Toggles between two visual states | e.g., hamburger ↔ close, sun ↔ moon.                                 |
| **floating action button** | Persistent floating action        | Usually bottom-right. Speed-dial variant available.                  |

## Inputs

Capture data from the user.

| Pattern             | Description                  | Notes                                                                |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- |
| **text input**      | Single-line text entry       | Size: xs–xl. Tone for validation. Ghost emphasis for minimal chrome. |
| **textarea**        | Multi-line text entry        | Same sizing/tone as text input.                                      |
| **select**          | Dropdown choice              | Same sizing/tone conventions.                                        |
| **checkbox**        | Binary toggle (multi-select) | Tone, size.                                                          |
| **radio**           | Single selection from group  | Tone, size.                                                          |
| **toggle / switch** | Binary on/off slider         | Tone, size xs–xl.                                                    |
| **range / slider**  | Numeric value along a track  | Tone, size.                                                          |
| **file input**      | File upload control          | Standard sizing.                                                     |
| **calendar**        | Date selection               | Specialized overlay.                                                 |

## Navigation

Move users through the application.

| Pattern         | Description                 | Notes                                                    |
| --------------- | --------------------------- | -------------------------------------------------------- |
| **navbar**      | Horizontal header bar       | Chrome tone. Contains logo, nav links, actions.          |
| **tabs**        | Panel switcher              | Emphasis: bordered, lifted, boxed. Size: xs–xl.          |
| **breadcrumbs** | Hierarchical location trail | Text chain with separators.                              |
| **menu**        | Vertical link list          | Optional icons, nested sub-menus.                        |
| **dock**        | Fixed bottom nav (mobile)   | Size: xs–xl. Icon + label per item.                      |
| **pagination**  | Page number navigation      | Grouped buttons.                                         |
| **steps**       | Multi-step progress         | Vertical or horizontal. Shows completed/active/upcoming. |
| **link**        | Inline navigation text      | Tone for color. Hover underline.                         |

## Content

Display information to the user.

| Pattern         | Description                       | Notes                                              |
| --------------- | --------------------------------- | -------------------------------------------------- |
| **badge / tag** | Small label or counter            | All dimensions. Commonly soft or outline emphasis. |
| **avatar**      | User/entity image                 | Usually circle. Optional status indicator.         |
| **stat**        | Label + large value + description | Dashboard summary use.                             |
| **table**       | Tabular data                      | Size. Zebra striping. Pinned rows/cols.            |
| **list**        | Structured vertical items         | Each item: icon + text + optional action.          |
| **timeline**    | Chronological event sequence      | Horizontal or vertical.                            |
| **chat bubble** | Conversational message            | Start (left) or end (right) alignment.             |
| **kbd**         | Keyboard shortcut display         | e.g., "Ctrl + S".                                  |
| **countdown**   | Animated number countdown         | Digits animate on change.                          |
| **carousel**    | Horizontal scrolling strip        | Snap scrolling between items.                      |

## Feedback

Communicate system state to the user.

| Pattern             | Description                       | Notes                                                                                                      |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **alert**           | Inline status message             | Tone: success/destructive/warning/info. Emphasis: solid/outline/soft/dash. Layout: vertical or horizontal. |
| **toast**           | Temporary positioned notification | Wraps alerts. Position: top/bottom + left/center/right.                                                    |
| **loading**         | Activity indicator                | Variants: spinner, dots, ring, ball, bars. Size.                                                           |
| **progress bar**    | Linear completion                 | Tone for color. Percentage value.                                                                          |
| **radial progress** | Circular completion               | Tone. Percentage value.                                                                                    |
| **skeleton**        | Loading placeholder               | Mimics shape of content it replaces.                                                                       |
| **tooltip**         | Hover/focus info overlay          | Position: top/bottom/left/right. Supports rich content.                                                    |
| **status dot**      | Small colored indicator           | Online/offline/busy state.                                                                                 |

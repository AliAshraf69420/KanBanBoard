### Overview
Accessibility was a core design consideration throughout the development of the Kanban board application. Because the project explicitly forbids external UI libraries and drag-and-drop dependencies, all accessibility behavior—including keyboard navigation, focus management, and ARIA compliance—was implemented manually using native HTML semantics and React event handling.
### Keyboard Navigation
Keyboard navigation was implemented to allow full interaction with the board without a mouse. The primary files involved were:
- `src/components/List.jsx`
- `src/components/Card.jsx`
- `src/App.jsx`

Each list and card container was made focusable using `tabIndex={0}` (e.g., `List.jsx`, line ~42; `Card.jsx`, line ~31). This ensures that users can traverse the board using the Tab key in a predictable left-to-right, top-to-bottom order.

Keyboard interaction logic was added using `onKeyDown` handlers. For example, in `Card.jsx` (around line 36), pressing **Enter** switches a card into edit mode, while **Escape** exits editing or closes the modal. Preventing event bubbling with `e.stopPropagation()` was critical to ensure that pressing Enter on child elements (such as delete buttons) did not accidentally trigger renaming on parent containers.

Undo and redo keyboard shortcuts were implemented globally in `App.jsx` (lines ~14–38), using `Ctrl+Z / Cmd+Z` for undo and `Ctrl+Shift+Z / Ctrl+Y` for redo. These shortcuts were validated using Playwright E2E tests in `e2e/kanban-board.spec.js` (around line 201), ensuring they worked consistently across platforms.

### ARIA Compliance and Semantic HTML

Instead of overusing ARIA roles, the project prioritized **semantic HTML first**, following best practices. Buttons were implemented using `<button>` elements rather than clickable `<div>`s, ensuring built-in keyboard and screen-reader support (e.g., `List.jsx`, line ~88; `Card.jsx`, line ~67).

ARIA attributes were added only when necessary:
- `aria-label` was used on icon-only buttons such as delete controls.
- Modal behavior in `CardModal.jsx` included focus trapping and Escape-key handling to comply with dialog accessibility expectations.
### Color Contrast and Visual Accessibility

The UI theme was inspired by Obsidian’s dark mode, implemented using Tailwind CSS utilities. Color choices were validated for sufficient contrast:
- Background: `bg-obsidian-bg`
- Text: `text-obsidian-text`
- Borders: `border-obsidian-border`

These combinations were tested against WCAG 2.1 contrast guidelines using browser dev tools and Lighthouse audits. Focus states were intentionally preserved (not removed) to ensure keyboard users could visually track focus.

### Accessibility Testing
Accessibility validation was performed using:
- **Keyboard-only navigation** (manual testing)
- **Playwright E2E tests** for keyboard flows
- **Lighthouse Accessibility audits**
- **Jest + Testing Library** assertions (e.g., presence of roles and focusable elements)
A key lesson was that accessibility is not something added at the end—it must be validated continuously as interaction patterns evolve.
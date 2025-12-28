# Kanban Board App

A feature-rich, offline-first Kanban board built with **React**, **TailwindCSS**, and an offline-first sync mechanism. This project supports undo/redo, persistent storage, and background synchronization with a backend API.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Debugging](#debugging)

---

## Features

- **Drag-and-drop**: Move cards between lists and reorder lists.
- **Offline-first**: All changes are queued and synchronized when online.
- **Undo/Redo**: Keyboard shortcuts and buttons to undo/redo changes.
- **Persistence**: Local storage and IndexedDB for offline data.
- **Card Details Modal**: Click a card to view and edit its title, description, and tags.
- **Conflict Handling**: Basic queue handling for offline sync conflicts.
- **Accessibility**: Keyboard navigation, ARIA-compliant components, and color contrast considerations.

---

## Architecture

The app uses a **context + reducer** state management pattern:

- `BoardProvider.jsx` — Context provider for the entire board state.
- `boardReducer.js` — Handles state updates, including undo/redo and card/list CRUD operations.
- `useBoardState.js` — Custom hook for interacting with board state and dispatching actions.
- `useOfflineSync.js` — Handles persistence, background sync, and offline queue processing.
- `models.js` — Defines domain objects (`List`, `Card`) and helper functions.
- `components/` — Core UI:
  - `Board.jsx`, `List.jsx`, `Card.jsx`, `CardModal.jsx`
- `services/` — API and local storage interactions:
  - `api.js` — sync endpoints, versioning, migration
  - `storage.js` — IndexedDB and local storage wrappers

**Data flow:**

1. User actions trigger `dispatch` calls in `boardReducer`.
2. State updates are persisted via `useOfflineSync`.
3. Offline changes are queued and synchronized with the server when online.

**Undo/Redo:** Managed via `undoStack` and `redoStack` snapshots in `boardReducer`.

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Recommended: Chromium for E2E testing

### Installation

Clone the repository:

```bash
git clone https://github.com/AliAshraf69420/KanBanBoard.git
cd kanban-board-client
npm install
```

Server setup (if using your own backend):

```bash
cd Server
npm install
```

---

Running the Project

Client

```
cd kanban-board-client
npm run dev
```

Default URL: http://localhost:5173 (Vite dev server).

Server

```
cd Server
npm run dev
```

## Testing

### Unit & Integration Tests

```bash
npm test
```

- Uses Jest + Testing Library.

- Mocks IndexedDB, UUID, and network requests for offline-first testing.

- Note: Some E2E coverage is limited; undo/redo and drag-and-drop tests may not cover 100% of scenarios.

E2E Tests

Uses Playwright:

```bash
npx playwright install
npm run test:e2e
```

- Ensure browsers are installed (npx playwright install).

- Tests offline sync, drag-and-drop, and keyboard shortcuts.

### Accessibility

- Full keyboard navigation for cards, lists, and modals.

- ARIA attributes for modals and interactive elements (role="dialog", aria-label).

- Focus management and escape key support for closing modals.

- Color contrast adheres to WCAG AA standards.

- Tested using:

Chrome DevTools Accessibility Inspector

@testing-library/react queries that simulate keyboard and focus events

---

Debugging Tips:

The offline sync queue can be inspected via React DevTools context (state.syncQueue).

Temporary debugging helper in development:

```js
import { useBoardState } from "./hooks/useBoardState";
const { state } = useBoardState();
window.__STATE__ = state; // view in console
```

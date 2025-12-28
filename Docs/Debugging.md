### Debugging Keyboard Conflicts in Nested Components
One of the most challenging accessibility bugs occurred during keyboard navigation implementation. Pressing **Enter** on the “Add Card” button was unexpectedly triggering list renaming instead of adding a card.

This issue was traced to event bubbling in `List.jsx` (around line 74). The list container listened for `Enter` to toggle rename mode, while the button inside also responded to Enter. Because the event was not being stopped, both handlers fired.

The fix involved explicitly calling `e.stopPropagation()` inside the button’s `onKeyDown` handler. This was a subtle bug that only manifested during keyboard use, reinforcing the importance of accessibility testing beyond mouse interactions.

### Undo/Redo Accessibility and Snapshot Bugs

Another major debugging challenge involved undo/redo functionality. Pressing **Undo** often removed _all_ lists and cards instead of reverting a single action. This behavior initially appeared random.

After inspecting `boardReducer.js` (lines ~9–180), the root cause was identified: snapshots created via `createBoardSnapshot(state)` were shallow copies of mutable state objects. As a result, undo snapshots were being mutated alongside the current state.

The fix involved using `structuredClone` inside `createBoardSnapshot` (in `src/utils/models.js`, line ~86). This ensured snapshots were immutable and restored correctly. Once fixed, undo/redo keyboard shortcuts behaved reliably and passed Playwright tests (`kanban-board.spec.js`, around line 179).

### Drag-and-Drop vs. Accessibility Tradeoffs

Implementing drag-and-drop without external libraries introduced another accessibility tradeoff. Initially, dragging a card caused the entire list to move due to shared drag state. This was resolved by scoping drag metadata more carefully in `Card.jsx` (line ~18) and `List.jsx` (line ~54), ensuring that card drags did not propagate to list handlers.

This experience highlighted how accessibility and correctness are often intertwined: improper event handling breaks both mouse and keyboard users simultaneously.

### Lessons Learned
These debugging experiences emphasized several key principles:
- Accessibility bugs often hide in event propagation logic.
- Keyboard users expose issues mouse users never encounter.
- Proper state immutability is critical for predictable undo/redo behavior.
- Testing tools are only effective when combined with manual exploration.

Ultimately, accessibility was not treated as a checkbox but as a continuous feedback loop between implementation, testing, and debugging.
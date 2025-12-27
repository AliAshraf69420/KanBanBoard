# State ownership:
- Single source of truth: `BoardProvider`
- Implemented via:
    - `useReducer`
    - `Context`
- All state changes go through explicit reducer actions
---
# State shape:

```js
BoardState {
  lists: {
    [listId]: {
      id,
      title,
      archived,
      cardIds: [],
      version,
      lastModifiedAt
    }
  },
  cards: {
    [cardId]: {
      id,
      listId,
      title,
      description,
      tags: [],
      version,
      lastModifiedAt
    }
  },
  syncQueue: [],
  undoStack: [],
  redoStack: []
}
```

## Key points:
- **Normalized state** → avoids deep merges
- `version` and `lastModifiedAt` are mandatory for conflict resolution
- `syncQueue` is first-class state, not an afterthought
---
# Custom hooks responsibilities:
- ## `useBoardState`
	- Semantic API over raw dispatch
	- Example:
	    - `addCard(listId, data)`
	    - `moveCard(cardId, fromList, toList)`
	- Makes components dumb and testable
- ## `useOfflineSync`
	- IndexedDB read/write
	- Sync queue persistence
	- Online/offline detection
	- API communication
	- Retry + failure handling
- ## `useUndoRedo`
	- Wraps reducer state
	- Stores inverse actions
	- Integrates cleanly because reducer actions are pure
---

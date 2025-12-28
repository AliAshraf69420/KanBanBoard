/**
 * Integration tests for reducer + offline sync functionality
 */
import { boardReducer } from '../../context/boardReducer';
import { createEmptyBoardState } from '../../utils/models';

describe('Reducer + Sync Integration', () => {
  let initialState;

  beforeEach(() => {
    initialState = createEmptyBoardState();
  });

  it('should create sync queue items for all mutations', () => {
    let state = initialState;

    // Add list
    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 1' },
    });
    expect(state.syncQueue.length).toBe(1);
    expect(state.syncQueue[0].type).toBe('ADD_LIST');
    expect(state.syncQueue[0].clientVersion).toBe(0);

    // Add card
    const listId = Object.keys(state.lists)[0];
    state = boardReducer(state, {
      type: 'ADD_CARD',
      payload: { listId, title: 'Card 1', description: '', tags: [] },
    });
    expect(state.syncQueue.length).toBe(2);
    expect(state.syncQueue[1].type).toBe('ADD_CARD');
    expect(state.syncQueue[1].clientVersion).toBe(1);

    // Update list
    state = boardReducer(state, {
      type: 'UPDATE_LIST',
      payload: { listId, title: 'Updated List' },
    });
    expect(state.syncQueue.length).toBe(3);
    expect(state.syncQueue[2].type).toBe('UPDATE_LIST');
    expect(state.syncQueue[2].clientVersion).toBe(2);

    // Update card
    const cardId = Object.keys(state.cards)[0];
    state = boardReducer(state, {
      type: 'UPDATE_CARD',
      payload: { cardId, updates: { title: 'Updated Card' } },
    });
    expect(state.syncQueue.length).toBe(4);
    expect(state.syncQueue[3].type).toBe('UPDATE_CARD');

    // Move card
    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 2' },
    });
    const listId2 = Object.keys(state.lists)[1];
    state = boardReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardId, fromListId: listId, toListId: listId2, targetIndex: 0 },
    });
    expect(state.syncQueue.length).toBe(6);
    expect(state.syncQueue[5].type).toBe('MOVE_CARD');

    // Remove card
    state = boardReducer(state, {
      type: 'REMOVE_CARD',
      payload: { listId: listId2, cardId },
    });
    expect(state.syncQueue.length).toBe(7);
    expect(state.syncQueue[6].type).toBe('DELETE_CARD');

    // Remove list
    state = boardReducer(state, {
      type: 'REMOVE_LIST',
      payload: { listId: listId2 },
    });
    // Removing a list adds DELETE_LIST + DELETE_CARD for each card
    expect(state.syncQueue.length).toBeGreaterThan(7);
  });

  it('should increment version with each mutation', () => {
    let state = initialState;

    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 1' },
    });
    expect(state.version).toBe(1);

    const listId = Object.keys(state.lists)[0];
    state = boardReducer(state, {
      type: 'ADD_CARD',
      payload: { listId, title: 'Card 1', description: '', tags: [] },
    });
    expect(state.version).toBe(2);

    state = boardReducer(state, {
      type: 'UPDATE_LIST',
      payload: { listId, title: 'Updated' },
    });
    expect(state.version).toBe(3);
  });

  it('should remove sync queue items on SYNC_SUCCESS', () => {
    let state = initialState;

    // Add multiple items
    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 1' },
    });
    const listId = Object.keys(state.lists)[0];
    state = boardReducer(state, {
      type: 'ADD_CARD',
      payload: { listId, title: 'Card 1', description: '', tags: [] },
    });

    expect(state.syncQueue.length).toBe(2);
    const firstSyncItemId = state.syncQueue[0].id;

    // Remove first item
    state = boardReducer(state, {
      type: 'SYNC_SUCCESS',
      payload: { syncItemId: firstSyncItemId },
    });

    expect(state.syncQueue.length).toBe(1);
    expect(state.syncQueue[0].id).not.toBe(firstSyncItemId);
  });

  it('should maintain undo stack for all mutations', () => {
    let state = initialState;

    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 1' },
    });
    expect(state.undoStack.length).toBe(1);

    const listId = Object.keys(state.lists)[0];
    state = boardReducer(state, {
      type: 'ADD_CARD',
      payload: { listId, title: 'Card 1', description: '', tags: [] },
    });
    expect(state.undoStack.length).toBe(2);

    state = boardReducer(state, {
      type: 'UPDATE_LIST',
      payload: { listId, title: 'Updated' },
    });
    expect(state.undoStack.length).toBe(3);
  });

  it('should clear redo stack on new mutation', () => {
    let state = initialState;

    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'List 1' },
    });
    const listId = Object.keys(state.lists)[0];

    state = boardReducer(state, {
      type: 'UPDATE_LIST',
      payload: { listId, title: 'Updated' },
    });

    // Undo
    state = boardReducer(state, { type: 'UNDO' });
    expect(state.redoStack.length).toBe(1);

    // New mutation should clear redo
    state = boardReducer(state, {
      type: 'UPDATE_LIST',
      payload: { listId, title: 'New Title' },
    });
    expect(state.redoStack.length).toBe(0);
  });

  it('should handle complete workflow: add, edit, move, delete', () => {
    let state = initialState;

    // Add lists
    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'To Do' },
    });
    state = boardReducer(state, {
      type: 'ADD_LIST',
      payload: { title: 'Done' },
    });

    const listIds = Object.keys(state.lists);
    const todoListId = listIds[0];
    const doneListId = listIds[1];

    // Add card to To Do
    state = boardReducer(state, {
      type: 'ADD_CARD',
      payload: { listId: todoListId, title: 'Task 1', description: '', tags: [] },
    });
    const cardId = Object.keys(state.cards)[0];

    // Update card
    state = boardReducer(state, {
      type: 'UPDATE_CARD',
      payload: { cardId, updates: { title: 'Updated Task 1' } },
    });
    expect(state.cards[cardId].title).toBe('Updated Task 1');

    // Move card to Done
    state = boardReducer(state, {
      type: 'MOVE_CARD',
      payload: { cardId, fromListId: todoListId, toListId: doneListId, targetIndex: 0 },
    });
    expect(state.cards[cardId].listId).toBe(doneListId);
    expect(state.lists[doneListId].cardIds).toContain(cardId);

    // Delete card
    state = boardReducer(state, {
      type: 'REMOVE_CARD',
      payload: { listId: doneListId, cardId },
    });
    expect(state.cards[cardId]).toBeUndefined();

    // Verify sync queue contains all operations
    expect(state.syncQueue.length).toBeGreaterThan(0);
    expect(state.version).toBeGreaterThan(0);
  });
});


import { boardReducer } from '../../context/boardReducer';
import { createEmptyBoardState, createList, createCard } from '../../utils/models';

describe('boardReducer', () => {
  let initialState;

  beforeEach(() => {
    initialState = createEmptyBoardState();
  });

  describe('ADD_LIST', () => {
    it('should add a new list to the state', () => {
      const action = { type: 'ADD_LIST', payload: { title: 'New List' } };
      const newState = boardReducer(initialState, action);

      const listIds = Object.keys(newState.lists);
      expect(listIds.length).toBe(1);
      expect(newState.lists[listIds[0]].title).toBe('New List');
      expect(newState.listOrder).toContain(listIds[0]);
      expect(newState.version).toBe(1);
      expect(newState.syncQueue.length).toBe(1);
      expect(newState.syncQueue[0].type).toBe('ADD_LIST');
    });
  });

  describe('ADD_CARD', () => {
    it('should add a card to a list', () => {
      // First add a list
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      // Then add a card
      const action = {
        type: 'ADD_CARD',
        payload: { listId, title: 'Card 1', description: '', tags: [] },
      };
      state = boardReducer(state, action);

      const cardIds = Object.keys(state.cards);
      expect(cardIds.length).toBe(1);
      expect(state.cards[cardIds[0]].title).toBe('Card 1');
      expect(state.lists[listId].cardIds).toContain(cardIds[0]);
      expect(state.version).toBe(2);
    });
  });

  describe('UPDATE_LIST', () => {
    it('should update a list title', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'Old Title' },
      });
      const listId = Object.keys(state.lists)[0];

      const action = {
        type: 'UPDATE_LIST',
        payload: { listId, title: 'New Title' },
      };
      state = boardReducer(state, action);

      expect(state.lists[listId].title).toBe('New Title');
      expect(state.version).toBe(2);
      expect(state.syncQueue.length).toBe(2);
    });
  });

  describe('UPDATE_CARD', () => {
    it('should update card properties', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'ADD_CARD',
        payload: { listId, title: 'Card 1', description: '', tags: [] },
      });
      const cardId = Object.keys(state.cards)[0];

      const action = {
        type: 'UPDATE_CARD',
        payload: { cardId, updates: { title: 'Updated Card' } },
      };
      state = boardReducer(state, action);

      expect(state.cards[cardId].title).toBe('Updated Card');
      expect(state.version).toBe(3);
    });
  });

  describe('REMOVE_CARD', () => {
    it('should remove a card from a list', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'ADD_CARD',
        payload: { listId, title: 'Card 1', description: '', tags: [] },
      });
      const cardId = Object.keys(state.cards)[0];

      const action = {
        type: 'REMOVE_CARD',
        payload: { listId, cardId },
      };
      state = boardReducer(state, action);

      expect(state.cards[cardId]).toBeUndefined();
      expect(state.lists[listId].cardIds).not.toContain(cardId);
      expect(state.version).toBe(3);
    });
  });

  describe('REMOVE_LIST', () => {
    it('should remove a list and its cards', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'ADD_CARD',
        payload: { listId, title: 'Card 1', description: '', tags: [] },
      });

      const action = {
        type: 'REMOVE_LIST',
        payload: { listId },
      };
      state = boardReducer(state, action);

      expect(state.lists[listId]).toBeUndefined();
      expect(Object.keys(state.cards).length).toBe(0);
      expect(state.listOrder).not.toContain(listId);
    });
  });

  describe('MOVE_CARD', () => {
    it('should move a card between lists', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId1 = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'ADD_LIST',
        payload: { title: 'List 2' },
      });
      const listId2 = Object.keys(state.lists)[1];

      state = boardReducer(state, {
        type: 'ADD_CARD',
        payload: { listId: listId1, title: 'Card 1', description: '', tags: [] },
      });
      const cardId = Object.keys(state.cards)[0];

      const action = {
        type: 'MOVE_CARD',
        payload: { cardId, fromListId: listId1, toListId: listId2, targetIndex: 0 },
      };
      state = boardReducer(state, action);

      expect(state.cards[cardId].listId).toBe(listId2);
      expect(state.lists[listId1].cardIds).not.toContain(cardId);
      expect(state.lists[listId2].cardIds).toContain(cardId);
      expect(state.version).toBe(4);
    });
  });

  describe('MOVE_LIST', () => {
    it('should reorder lists', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId1 = state.listOrder[0];

      state = boardReducer(state, {
        type: 'ADD_LIST',
        payload: { title: 'List 2' },
      });
      const listId2 = state.listOrder[1];

      const action = {
        type: 'MOVE_LIST',
        payload: { draggedListId: listId1, targetListId: listId2 },
      };
      state = boardReducer(state, action);

      expect(state.listOrder[0]).toBe(listId2);
      expect(state.listOrder[1]).toBe(listId1);
    });
  });

  describe('UNDO', () => {
    it('should restore previous state', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'UPDATE_LIST',
        payload: { listId, title: 'Updated' },
      });

      const action = { type: 'UNDO' };
      state = boardReducer(state, action);

      expect(state.lists[listId].title).toBe('List 1');
      expect(state.undoStack.length).toBe(1);
    });

    it('should do nothing if undo stack is empty', () => {
      const action = { type: 'UNDO' };
      const newState = boardReducer(initialState, action);
      expect(newState).toEqual(initialState);
    });
  });

  describe('REDO', () => {
    it('should restore next state', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const listId = Object.keys(state.lists)[0];

      state = boardReducer(state, {
        type: 'UPDATE_LIST',
        payload: { listId, title: 'Updated' },
      });

      state = boardReducer(state, { type: 'UNDO' });
      const action = { type: 'REDO' };
      state = boardReducer(state, action);

      expect(state.lists[listId].title).toBe('Updated');
    });
  });

  describe('HYDRATE_STATE', () => {
    it('should replace state with payload', () => {
      const payload = {
        lists: { 'list-1': { id: 'list-1', title: 'List', cardIds: [] } },
        cards: {},
        listOrder: ['list-1'],
        version: 5,
        syncQueue: [],
        undoStack: [],
        redoStack: [],
      };

      const action = { type: 'HYDRATE_STATE', payload };
      const newState = boardReducer(initialState, action);

      expect(newState).toEqual(payload);
    });
  });

  describe('SYNC_SUCCESS', () => {
    it('should remove item from sync queue', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const syncItemId = state.syncQueue[0].id;

      const action = {
        type: 'SYNC_SUCCESS',
        payload: { syncItemId },
      };
      state = boardReducer(state, action);

      expect(state.syncQueue.length).toBe(0);
    });
  });

  describe('SYNC_FAILURE', () => {
    it('should keep state unchanged', () => {
      let state = boardReducer(initialState, {
        type: 'ADD_LIST',
        payload: { title: 'List 1' },
      });
      const originalSyncQueue = [...state.syncQueue];

      const action = {
        type: 'SYNC_FAILURE',
        payload: { error: new Error('Failed') },
      };
      state = boardReducer(state, action);

      expect(state.syncQueue).toEqual(originalSyncQueue);
    });
  });

  describe('default case', () => {
    it('should return state unchanged for unknown action', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const newState = boardReducer(initialState, action);
      expect(newState).toEqual(initialState);
    });
  });
});


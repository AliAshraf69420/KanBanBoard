import { createList, createCard, createBoardSnapshot } from "../utils/models";

/**
 * Board reducer
 * Pure function: (state, action) -> newState
 */
export function boardReducer(state, action) {
  switch (action.type) {
    /* ==================== LIST ACTIONS ==================== */

    case "ADD_LIST": {
      const newList = createList({ title: action.payload.title });

      return {
        ...state,
        lists: {
          ...state.lists,
          [newList.id]: newList,
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_LIST": {
      const { listId, title } = action.payload;
      const list = state.lists[listId];
      if (!list) return state;

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            title,
            version: list.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "ARCHIVE_LIST": {
      const { listId } = action.payload;
      const list = state.lists[listId];
      if (!list) return state;

      return {
        ...state,
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            archived: true,
            version: list.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    /* ==================== CARD ACTIONS ==================== */

    case "ADD_CARD": {
      const { listId, title, description, tags } = action.payload;
      const targetList = state.lists[listId];
      if (!targetList) return state;

      const newCard = createCard({ listId, title, description, tags });

      return {
        ...state,
        cards: {
          ...state.cards,
          [newCard.id]: newCard,
        },
        lists: {
          ...state.lists,
          [listId]: {
            ...targetList,
            cardIds: [...targetList.cardIds, newCard.id],
            version: targetList.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_CARD": {
      const { cardId, updates } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            ...updates,
            version: card.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "DELETE_CARD": {
      const { cardId } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;

      const list = state.lists[card.listId];
      const { [cardId]: _, ...remainingCards } = state.cards;

      return {
        ...state,
        cards: remainingCards,
        lists: {
          ...state.lists,
          [card.listId]: {
            ...list,
            cardIds: list.cardIds.filter((id) => id !== cardId),
            version: list.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "MOVE_CARD": {
      const { cardId, fromListId, toListId, targetIndex } = action.payload;
      const card = state.cards[cardId];
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];
      if (!card || !fromList || !toList) return state;

      const newFromCardIds = fromList.cardIds.filter((id) => id !== cardId);
      const newToCardIds = [...toList.cardIds];
      newToCardIds.splice(targetIndex, 0, cardId);

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            listId: toListId,
            version: card.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        lists: {
          ...state.lists,
          [fromListId]: {
            ...fromList,
            cardIds: newFromCardIds,
            version: fromList.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
          [toListId]: {
            ...toList,
            cardIds: newToCardIds,
            version: toList.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    /* ==================== REMOVE ACTIONS ==================== */

    case "REMOVE_LIST": {
      const { listId } = action.payload;
      const newState = {
        ...state,
        lists: { ...state.lists },
        cards: { ...state.cards },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
      const listToRemove = newState.lists[listId];
      if (!listToRemove) return state;

      // remove all cards in that list
      listToRemove.cardIds.forEach((cardId) => {
        delete newState.cards[cardId];
      });
      delete newState.lists[listId];
      return newState;
    }

    case "REMOVE_CARD": {
      const { listId, cardId } = action.payload;
      const list = state.lists[listId];
      if (!list) return state;

      return {
        ...state,
        cards: { ...state.cards, [cardId]: undefined },
        lists: {
          ...state.lists,
          [listId]: {
            ...list,
            cardIds: list.cardIds.filter((id) => id !== cardId),
            version: list.version + 1,
            lastModifiedAt: new Date().toISOString(),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    /* ==================== SYNC ACTIONS ==================== */

    case "SYNC_SUCCESS": {
      const { syncItemId } = action.payload;
      return {
        ...state,
        syncQueue: state.syncQueue.filter((item) => item.id !== syncItemId),
      };
    }

    case "SYNC_FAILURE": {
      return state; // queue remains for retry
    }

    /* ==================== STATE CONTROL ==================== */

    case "HYDRATE_STATE": {
      return action.payload;
    }

    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        lists: previous.lists,
        cards: previous.cards,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, createBoardSnapshot(state)],
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        lists: next.lists,
        cards: next.cards,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
      };
    }
    case "MOVE_CARD": {
      const { cardId, fromListId, toListId, targetIndex } = action.payload;
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];

      const newFromCardIds = fromList.cardIds.filter((id) => id !== cardId);
      const newToCardIds = [...toList.cardIds];
      newToCardIds.splice(targetIndex, 0, cardId);

      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...state.cards[cardId], listId: toListId },
        },
        lists: {
          ...state.lists,
          [fromListId]: { ...fromList, cardIds: newFromCardIds },
          [toListId]: { ...toList, cardIds: newToCardIds },
        },
      };
    }

    default:
      return state;
  }
}

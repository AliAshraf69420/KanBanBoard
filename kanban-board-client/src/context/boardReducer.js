import { createBoardSnapshot, createCard, createList } from "../utils/models";

export function boardReducer(state, action) {
  switch (action.type) {
    case "ADD_LIST": {
      const newList = createList({ title: action.payload.title });
      return {
        ...state,
        lists: { ...state.lists, [newList.id]: newList },
        listOrder: [...(state.listOrder || []), newList.id],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "ADD_CARD": {
      const { listId, title, description, tags } = action.payload;
      const newCard = createCard({ listId, title, description, tags });

      // prevent duplicates just in case
      const oldCardIds = state.lists[listId].cardIds.filter(
        (id) => id !== newCard.id
      );

      return {
        ...state,
        cards: { ...state.cards, [newCard.id]: newCard },
        lists: {
          ...state.lists,
          [listId]: {
            ...state.lists[listId],
            cardIds: [...oldCardIds, newCard.id],
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_LIST": {
      const { listId, title } = action.payload;
      return {
        ...state,
        lists: { ...state.lists, [listId]: { ...state.lists[listId], title } },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_CARD": {
      const { cardId, updates } = action.payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...state.cards[cardId], ...updates },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "REMOVE_LIST": {
      const { listId } = action.payload;
      const newCards = { ...state.cards };
      state.lists[listId].cardIds.forEach((cardId) => delete newCards[cardId]);
      const newLists = { ...state.lists };
      delete newLists[listId];
      return {
        ...state,
        lists: newLists,
        cards: newCards,
        listOrder: (state.listOrder || []).filter((id) => id !== listId),
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "REMOVE_CARD": {
      const { listId, cardId } = action.payload;
      const newCards = { ...state.cards };
      delete newCards[cardId];
      return {
        ...state,
        cards: newCards,
        lists: {
          ...state.lists,
          [listId]: {
            ...state.lists[listId],
            cardIds: state.lists[listId].cardIds.filter((id) => id !== cardId),
          },
        },
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "MOVE_CARD": {
      const { cardId, fromListId, toListId, targetIndex } = action.payload;
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];

      // Remove card from old list
      const newFromCardIds = fromList.cardIds.filter((id) => id !== cardId);

      // Insert at targetIndex in new list
      let newToCardIds = [...toList.cardIds];

      // Prevent duplicate just in case
      newToCardIds = newToCardIds.filter((id) => id !== cardId);

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
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "MOVE_LIST": {
      const { draggedListId, targetListId } = action.payload;
      const listOrder = [...(state.listOrder || [])];
      const fromIndex = listOrder.indexOf(draggedListId);
      const toIndex = listOrder.indexOf(targetListId);
      if (fromIndex === -1 || toIndex === -1) return state;

      listOrder.splice(fromIndex, 1);
      listOrder.splice(toIndex, 0, draggedListId);

      return {
        ...state,
        listOrder,
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UNDO": {
      if (!state.undoStack || state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];

      return {
        ...state,
        lists: structuredClone(previous.lists),
        cards: structuredClone(previous.cards),
        listOrder: structuredClone(previous.listOrder),
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, createBoardSnapshot(state)],
      };
    }

    case "REDO": {
      if (!state.redoStack || state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];

      return {
        ...state,
        lists: structuredClone(next.lists),
        cards: structuredClone(next.cards),
        listOrder: structuredClone(next.listOrder),
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
      };
    }

    case "HYDRATE_STATE":
      return action.payload;

    case "SYNC_SUCCESS":
      return {
        ...state,
        syncQueue: state.syncQueue.filter(
          (item) => item.id !== action.payload.syncItemId
        ),
      };

    case "SYNC_FAILURE":
      return state;

    default:
      return state;
  }
}

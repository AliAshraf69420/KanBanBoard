import { createBoardSnapshot, createCard, createList } from "../utils/models";
import { v4 as uuidv4 } from "uuid";

export function boardReducer(state, action) {
  switch (action.type) {
    case "ADD_LIST": {
      const newList = createList({ title: action.payload.title });
      const syncItem = {
        id: uuidv4(),
        type: "ADD_LIST",
        payload: { ...newList },
        clientVersion: state.version || 0,
      };
      return {
        ...state,
        lists: { ...state.lists, [newList.id]: newList },
        listOrder: [...(state.listOrder || []), newList.id],
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "ADD_CARD": {
      const { listId, title, description, tags } = action.payload;
      const newCard = createCard({ listId, title, description, tags });

      const oldCardIds = state.lists[listId].cardIds.filter(
        (id) => id !== newCard.id
      );

      const syncItem = {
        id: uuidv4(),
        type: "ADD_CARD",
        payload: { ...newCard },
        clientVersion: state.version || 0,
      };

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
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_LIST": {
      const { listId, title } = action.payload;
      const syncItem = {
        id: uuidv4(),
        type: "UPDATE_LIST",
        payload: { listId, title },
        clientVersion: state.version || 0,
      };
      return {
        ...state,
        lists: { ...state.lists, [listId]: { ...state.lists[listId], title } },
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "UPDATE_CARD": {
      const { cardId, updates } = action.payload;
      const syncItem = {
        id: uuidv4(),
        type: "UPDATE_CARD",
        payload: { cardId, updates },
        clientVersion: state.version || 0,
      };
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...state.cards[cardId], ...updates },
        },
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
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
      
      // Delete all cards in the list first
      const cardDeletes = state.lists[listId].cardIds.map((cardId) => ({
        id: uuidv4(),
        type: "DELETE_CARD",
        payload: { cardId },
        clientVersion: state.version || 0,
      }));
      
      const syncItem = {
        id: uuidv4(),
        type: "DELETE_LIST",
        payload: { listId },
        clientVersion: state.version || 0,
      };
      
      return {
        ...state,
        lists: newLists,
        cards: newCards,
        listOrder: (state.listOrder || []).filter((id) => id !== listId),
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), ...cardDeletes, syncItem],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "REMOVE_CARD": {
      const { listId, cardId } = action.payload;
      const newCards = { ...state.cards };
      delete newCards[cardId];
      const syncItem = {
        id: uuidv4(),
        type: "DELETE_CARD",
        payload: { cardId },
        clientVersion: state.version || 0,
      };
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
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
        undoStack: [...state.undoStack, createBoardSnapshot(state)],
        redoStack: [],
      };
    }

    case "MOVE_CARD": {
      const { cardId, fromListId, toListId, targetIndex } = action.payload;
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];

      const newFromCardIds = fromList.cardIds.filter((id) => id !== cardId);

      let newToCardIds = [...toList.cardIds];
      newToCardIds = newToCardIds.filter((id) => id !== cardId); // prevent duplicate
      newToCardIds.splice(targetIndex, 0, cardId);

      const syncItem = {
        id: uuidv4(),
        type: "MOVE_CARD",
        payload: { cardId, fromListId, toListId, targetIndex },
        clientVersion: state.version || 0,
      };

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
        version: (state.version || 0) + 1,
        syncQueue: [...(state.syncQueue || []), syncItem],
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

      // MOVE_LIST doesn't need to sync (listOrder is client-only for UI)
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
        redoStack: [...state.redoStack, createBoardSnapshot(state)], // current state goes into redo
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
        undoStack: [...state.undoStack, createBoardSnapshot(state)], // current state goes back to undo
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

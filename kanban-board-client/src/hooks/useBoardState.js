import { useReducer, useCallback } from "react";
import { boardReducer, createEmptyBoardState } from "../context/boardReducer";

// Custom hook to manage board state
export function useBoardState() {
  const [state, dispatch] = useReducer(boardReducer, createEmptyBoardState());

  // --------------- BOARD ACTIONS ---------------

  const addList = useCallback((title) => {
    dispatch({ type: "ADD_LIST", payload: { title } });
  }, []);

  const addCard = useCallback((listId, title, description = "", tags = []) => {
    dispatch({
      type: "ADD_CARD",
      payload: { listId, title, description, tags },
    });
  }, []);

  const renameList = useCallback((listId, title) => {
    dispatch({ type: "UPDATE_LIST", payload: { listId, title } });
  }, []);

  const renameCard = useCallback((cardId, updates) => {
    dispatch({ type: "UPDATE_CARD", payload: { cardId, updates } });
  }, []);

  const removeList = useCallback((listId) => {
    dispatch({ type: "REMOVE_LIST", payload: { listId } });
  }, []);

  const removeCard = useCallback((listId, cardId) => {
    dispatch({ type: "REMOVE_CARD", payload: { listId, cardId } });
  }, []);

  const moveCard = useCallback((cardId, fromListId, toListId, targetIndex) => {
    dispatch({
      type: "MOVE_CARD",
      payload: { cardId, fromListId, toListId, targetIndex },
    });
  }, []);

  const moveList = useCallback((draggedListId, targetListId) => {
    dispatch({ type: "MOVE_LIST", payload: { draggedListId, targetListId } });
  }, []);

  // --------------- UNDO / REDO ---------------

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  // --------------- SYNC / HYDRATE ---------------

  const hydrate = useCallback((newState) => {
    dispatch({ type: "HYDRATE_STATE", payload: newState });
  }, []);

  const syncSuccess = useCallback((syncItemId) => {
    dispatch({ type: "SYNC_SUCCESS", payload: { syncItemId } });
  }, []);

  const syncFailure = useCallback((error) => {
    dispatch({ type: "SYNC_FAILURE", payload: { error } });
  }, []);

  return {
    state,
    addList,
    addCard,
    renameList,
    renameCard,
    removeList,
    removeCard,
    moveCard,
    moveList,
    undo,
    redo,
    hydrate,
    syncSuccess,
    syncFailure,
    dispatch, // expose for debugging if needed
  };
}

import { useContext, useCallback } from "react";
import { BoardContext } from "../context/boardProvider";

export function useBoardState() {
  const context = useContext(BoardContext);
  if (!context)
    throw new Error("useBoardState must be used within a BoardProvider");

  const { state, dispatch } = context;

  const hydrate = useCallback(
    (snapshot) => dispatch({ type: "HYDRATE_STATE", payload: snapshot }),
    [dispatch]
  );
  const syncSuccess = useCallback(
    (syncItemId) => dispatch({ type: "SYNC_SUCCESS", payload: { syncItemId } }),
    [dispatch]
  );
  const syncFailure = useCallback(
    (error) => dispatch({ type: "SYNC_FAILURE", payload: { error } }),
    [dispatch]
  );

  const addList = useCallback(
    (title) => dispatch({ type: "ADD_LIST", payload: { title } }),
    [dispatch]
  );
  const addCard = useCallback(
    (listId, title, description = "") =>
      dispatch({
        type: "ADD_CARD",
        payload: { listId, title, description, tags: [] },
      }),
    [dispatch]
  );

  const renameList = useCallback(
    (listId, newTitle) =>
      dispatch({ type: "UPDATE_LIST", payload: { listId, title: newTitle } }),
    [dispatch]
  );

  const renameCard = useCallback(
    (cardId, newTitle) =>
      dispatch({
        type: "UPDATE_CARD",
        payload: { cardId, updates: { title: newTitle } },
      }),
    [dispatch]
  );

  const removeList = useCallback(
    (listId) => dispatch({ type: "REMOVE_LIST", payload: { listId } }),
    [dispatch]
  );
  const removeCard = useCallback(
    (listId, cardId) =>
      dispatch({ type: "REMOVE_CARD", payload: { listId, cardId } }),
    [dispatch]
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const moveCard = useCallback(
    (cardId, fromListId, toListId, targetIndex) =>
      dispatch({
        type: "MOVE_CARD",
        payload: { cardId, fromListId, toListId, targetIndex },
      }),
    [dispatch]
  );

  const moveList = useCallback(
    (draggedListId, targetListId) =>
      dispatch({ type: "MOVE_LIST", payload: { draggedListId, targetListId } }),
    [dispatch]
  );

  return {
    state,
    hydrate,
    syncSuccess,
    syncFailure,
    addList,
    addCard,
    renameList,
    renameCard,
    removeList,
    removeCard,
    undo,
    redo,
    moveCard,
    moveList,
  };
}

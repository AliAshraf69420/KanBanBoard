import { createContext, useReducer } from "react";
import { boardReducer } from "./boardReducer";
import { createEmptyBoardState } from "../utils/models";

/**
 * BoardContext
 * Provides global board state and dispatch function
 */
export const BoardContext = createContext(null);

/**
 * BoardProvider
 * Wraps the app and provides board state via Context
 */
export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(
    boardReducer,
    undefined,
    createEmptyBoardState
  );

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

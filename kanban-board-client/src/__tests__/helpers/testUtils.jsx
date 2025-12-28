import React from 'react';
import { render } from '@testing-library/react';
import { BoardProvider } from '../../context/boardProvider';

/**
 * Custom render function that includes BoardProvider
 */
export function renderWithProvider(ui, options = {}) {
  function Wrapper({ children }) {
    return <BoardProvider>{children}</BoardProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock board state for testing
 */
export function createMockBoardState() {
  return {
    lists: {},
    cards: {},
    listOrder: [],
    version: 0,
    syncQueue: [],
    undoStack: [],
    redoStack: [],
  };
}


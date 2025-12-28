import { renderHook, act } from '@testing-library/react';
import { useBoardState } from '../../hooks/useBoardState';
import { BoardProvider } from '../../context/boardProvider';

const wrapper = ({ children }) => (
  <BoardProvider>{children}</BoardProvider>
);

describe('useBoardState', () => {
  it('should throw error when used outside BoardProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useBoardState());
    }).toThrow('useBoardState must be used within a BoardProvider');

    console.error = originalError;
  });

  it('should return state and actions when used within provider', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('addList');
    expect(result.current).toHaveProperty('addCard');
    expect(result.current).toHaveProperty('renameList');
    expect(result.current).toHaveProperty('renameCard');
    expect(result.current).toHaveProperty('removeList');
    expect(result.current).toHaveProperty('removeCard');
    expect(result.current).toHaveProperty('moveCard');
    expect(result.current).toHaveProperty('moveList');
    expect(result.current).toHaveProperty('undo');
    expect(result.current).toHaveProperty('redo');
  });

  it('should add a list', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('Test List');
    });

    const listIds = Object.keys(result.current.state.lists);
    expect(listIds.length).toBe(1);
    expect(result.current.state.lists[listIds[0]].title).toBe('Test List');
  });

  it('should add a card to a list', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.addCard(listId, 'Card 1', 'Description');
    });

    const cardIds = Object.keys(result.current.state.cards);
    expect(cardIds.length).toBe(1);
    expect(result.current.state.cards[cardIds[0]].title).toBe('Card 1');
    expect(result.current.state.cards[cardIds[0]].description).toBe('Description');
  });

  it('should rename a list', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('Old Title');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.renameList(listId, 'New Title');
    });

    expect(result.current.state.lists[listId].title).toBe('New Title');
  });

  it('should rename a card', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.addCard(listId, 'Old Title');
    });

    const cardId = Object.keys(result.current.state.cards)[0];

    act(() => {
      result.current.renameCard(cardId, 'New Title');
    });

    expect(result.current.state.cards[cardId].title).toBe('New Title');
  });

  it('should remove a list', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.removeList(listId);
    });

    expect(result.current.state.lists[listId]).toBeUndefined();
  });

  it('should remove a card', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.addCard(listId, 'Card 1');
    });

    const cardId = Object.keys(result.current.state.cards)[0];

    act(() => {
      result.current.removeCard(listId, cardId);
    });

    expect(result.current.state.cards[cardId]).toBeUndefined();
  });

  it('should move a card', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
      result.current.addList('List 2');
    });

    const listIds = Object.keys(result.current.state.lists);
    const listId1 = listIds[0];
    const listId2 = listIds[1];

    act(() => {
      result.current.addCard(listId1, 'Card 1');
    });

    const cardId = Object.keys(result.current.state.cards)[0];

    act(() => {
      result.current.moveCard(cardId, listId1, listId2, 0);
    });

    expect(result.current.state.cards[cardId].listId).toBe(listId2);
    expect(result.current.state.lists[listId1].cardIds).not.toContain(cardId);
    expect(result.current.state.lists[listId2].cardIds).toContain(cardId);
  });

  it('should undo an action', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.renameList(listId, 'Updated');
    });

    expect(result.current.state.lists[listId].title).toBe('Updated');

    act(() => {
      result.current.undo();
    });

    expect(result.current.state.lists[listId].title).toBe('List 1');
  });

  it('should redo an action', () => {
    const { result } = renderHook(() => useBoardState(), { wrapper });

    act(() => {
      result.current.addList('List 1');
    });

    const listId = Object.keys(result.current.state.lists)[0];

    act(() => {
      result.current.renameList(listId, 'Updated');
      result.current.undo();
    });

    expect(result.current.state.lists[listId].title).toBe('List 1');

    act(() => {
      result.current.redo();
    });

    expect(result.current.state.lists[listId].title).toBe('Updated');
  });
});


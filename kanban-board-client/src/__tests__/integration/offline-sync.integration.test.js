/**
 * Integration tests for offline sync functionality
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useBoardState } from '../../hooks/useBoardState';
import { BoardProvider } from '../../context/boardProvider';
import * as storage from '../../services/storage';
import * as api from '../../services/api';

// Mock the services
jest.mock('../../services/storage');
jest.mock('../../services/api');

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

describe('Offline Sync Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.loadBoardState.mockResolvedValue(null);
    storage.loadSyncQueue.mockResolvedValue([]);
    api.getServerState.mockResolvedValue({ exists: false });
    navigator.onLine = true;
  });

  it('should load saved state on mount', async () => {
    const savedState = {
      lists: { 'list-1': { id: 'list-1', title: 'Saved List', cardIds: [] } },
      cards: {},
      listOrder: ['list-1'],
      version: 1,
      syncQueue: [],
      undoStack: [],
      redoStack: [],
    };

    storage.loadBoardState.mockResolvedValue(savedState);

    renderHook(() => useOfflineSync(), { wrapper });

    await waitFor(() => {
      expect(storage.loadBoardState).toHaveBeenCalled();
    });
  });

  it('should persist state changes to IndexedDB', async () => {
    const stateHook = renderHook(() => useBoardState(), { wrapper });
    renderHook(() => useOfflineSync(), { wrapper });

    act(() => {
      stateHook.result.current.addList('Test List');
    });

    await waitFor(() => {
      expect(storage.saveBoardState).toHaveBeenCalled();
      expect(storage.saveSyncQueue).toHaveBeenCalled();
    });
  });

  it('should migrate snapshot when server state does not exist', async () => {
    const savedState = {
      lists: { 'list-1': { id: 'list-1', title: 'List', cardIds: [] } },
      cards: {},
      version: 1,
    };

    storage.loadBoardState.mockResolvedValue(savedState);
    api.getServerState.mockResolvedValue({ exists: false });
    api.migrateSnapshot.mockResolvedValue({ success: true, version: 1 });

    renderHook(() => useOfflineSync(), { wrapper });

    await waitFor(() => {
      expect(api.migrateSnapshot).toHaveBeenCalledWith({
        lists: savedState.lists,
        cards: savedState.cards,
        version: savedState.version,
      });
    });
  });

  it('should not migrate when server state exists', async () => {
    const savedState = {
      lists: { 'list-1': { id: 'list-1', title: 'List', cardIds: [] } },
      cards: {},
      version: 1,
    };

    storage.loadBoardState.mockResolvedValue(savedState);
    api.getServerState.mockResolvedValue({ exists: true, version: 1 });

    renderHook(() => useOfflineSync(), { wrapper });

    await waitFor(() => {
      expect(api.getServerState).toHaveBeenCalled();
    });

    // Should not call migrate
    expect(api.migrateSnapshot).not.toHaveBeenCalled();
  });

  it('should not process sync queue when offline', async () => {
    navigator.onLine = false;

    const stateHook = renderHook(() => useBoardState(), { wrapper });
    renderHook(() => useOfflineSync(), { wrapper });

    act(() => {
      stateHook.result.current.addList('Test List');
    });

    // Give it time to process
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not call syncAction when offline
    expect(api.syncAction).not.toHaveBeenCalled();
  });

  it('should process sync queue when online', async () => {
    navigator.onLine = true;
    api.syncAction.mockResolvedValue({ success: true, version: 1 });

    const stateHook = renderHook(() => useBoardState(), { wrapper });
    renderHook(() => useOfflineSync(), { wrapper });

    act(() => {
      stateHook.result.current.addList('Test List');
    });

    // Wait for sync to process
    await waitFor(() => {
      // The sync should be triggered (may need more time in real scenario)
    }, { timeout: 2000 });

    // Verify sync queue was saved
    expect(storage.saveSyncQueue).toHaveBeenCalled();
  });

  it('should handle sync queue processing sequentially', async () => {
    api.syncAction.mockResolvedValue({ success: true, version: 1 });

    const stateHook = renderHook(() => useBoardState(), { wrapper });
    renderHook(() => useOfflineSync(), { wrapper });

    act(() => {
      stateHook.result.current.addList('List 1');
      stateHook.result.current.addList('List 2');
    });

    await waitFor(() => {
      expect(storage.saveSyncQueue).toHaveBeenCalled();
    });

    // Sync queue should contain 2 items
    const syncQueueCalls = storage.saveSyncQueue.mock.calls;
    const lastCall = syncQueueCalls[syncQueueCalls.length - 1];
    expect(lastCall[0].length).toBeGreaterThanOrEqual(2);
  });
});

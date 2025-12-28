import { useEffect, useRef, useCallback } from "react";
import { useBoardState } from "./useBoardState";
import {
  loadBoardState,
  saveBoardState,
  loadSyncQueue,
  saveSyncQueue,
} from "../services/storage";
import { syncAction, getServerState, migrateSnapshot } from "../services/api";

/**
 * useOfflineSync
 * Handles persistence, offline queueing, migration, and background sync
 */
export function useOfflineSync() {
  const { state, hydrate, syncSuccess, syncFailure } = useBoardState();

  const isSyncingRef = useRef(false);
  const hasHydratedRef = useRef(false);
  const stateRef = useRef(state);
  
  // Keep state ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* -------------------- INITIAL HYDRATION + MIGRATION -------------------- */

  useEffect(() => {
    async function hydrateAndMigrate() {
      // 🔒 Prevent StrictMode double execution
      if (hasHydratedRef.current) return;
      hasHydratedRef.current = true;

      const savedState = await loadBoardState();
      const savedQueue = await loadSyncQueue();

      if (!savedState) return;

      hydrate({
        ...savedState,
        syncQueue: savedQueue || [],
      });

      if (!navigator.onLine) return;

      const serverState = await getServerState();

      if (!serverState.exists) {
        await migrateSnapshot({
          lists: savedState.lists,
          cards: savedState.cards,
          version: savedState.version,
        });
      }
    }

    hydrateAndMigrate();
  }, [hydrate]);

  /* -------------------- PERSIST STATE -------------------- */

  useEffect(() => {
    saveBoardState(state);
    saveSyncQueue(state.syncQueue);
  }, [state]);

  /* -------------------- PROCESS SYNC QUEUE -------------------- */

  const processQueue = useCallback(async () => {
    if (isSyncingRef.current) return;
    if (!navigator.onLine) return;
    
    const currentState = stateRef.current;
    if (!currentState.syncQueue || currentState.syncQueue.length === 0) return;

    isSyncingRef.current = true;

    try {
      // Process queue sequentially
      const queueCopy = [...currentState.syncQueue];
      for (const item of queueCopy) {
        try {
          const result = await syncAction(item);
          syncSuccess(item.id);
          
          // Update state version if server returned a new version
          if (result.version !== undefined) {
            // The version update will be handled by the reducer on sync success
            // We just need to make sure we don't process duplicates
          }
        } catch (error) {
          if (error.type === "CONFLICT") {
            // Handle conflict - for now just log, could implement conflict resolution
            console.error("Version conflict:", error.data);
            syncFailure(error);
          } else {
            // Network error or other failure - keep in queue for retry
            syncFailure(error);
          }
          // Stop processing on first error to maintain order
          break;
        }
      }
    } catch (error) {
      console.error("Sync queue processing error:", error);
      syncFailure(error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [syncSuccess, syncFailure]);

  /* -------------------- ONLINE EVENT -------------------- */

  useEffect(() => {
    window.addEventListener("online", processQueue);
    return () => window.removeEventListener("online", processQueue);
  }, [processQueue]);

  /* -------------------- PERIODIC BACKGROUND SYNC -------------------- */

  useEffect(() => {
    const interval = setInterval(processQueue, 30000);
    return () => clearInterval(interval);
  }, [processQueue]);
  
  /* -------------------- TRIGGER SYNC WHEN QUEUE CHANGES -------------------- */
  
  useEffect(() => {
    if (state.syncQueue && state.syncQueue.length > 0 && navigator.onLine) {
      // Small delay to batch multiple rapid changes
      const timeoutId = setTimeout(() => {
        processQueue();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [state.syncQueue, processQueue]);
}

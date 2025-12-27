import { useEffect, useRef } from "react";
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

  async function processQueue() {
    if (isSyncingRef.current) return;
    if (!navigator.onLine) return;
    if (state.syncQueue.length === 0) return;

    isSyncingRef.current = true;

    try {
      for (const item of state.syncQueue) {
        await syncAction(item);
        syncSuccess(item.id);
      }
    } catch (error) {
      syncFailure(error);
    } finally {
      isSyncingRef.current = false;
    }
  }

  /* -------------------- ONLINE EVENT -------------------- */

  useEffect(() => {
    window.addEventListener("online", processQueue);
    return () => window.removeEventListener("online", processQueue);
  });

  /* -------------------- PERIODIC BACKGROUND SYNC -------------------- */

  useEffect(() => {
    const interval = setInterval(processQueue, 30000);
    return () => clearInterval(interval);
  });
}

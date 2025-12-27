const DB_NAME = "kanban-board-db";
const DB_VERSION = 1;

const BOARD_STORE = "board";
const QUEUE_STORE = "queue";

/**
 * Open IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(BOARD_STORE)) {
        db.createObjectStore(BOARD_STORE);
      }

      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save entire board state
 */
export async function saveBoardState(state) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOARD_STORE, "readwrite");
    const store = tx.objectStore(BOARD_STORE);

    store.put(state, "board");

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load board state
 */
export async function loadBoardState() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOARD_STORE, "readonly");
    const store = tx.objectStore(BOARD_STORE);

    const request = store.get("board");

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save sync queue
 */
export async function saveSyncQueue(queue) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);

    store.put(queue, "queue");

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load sync queue
 */
export async function loadSyncQueue() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const store = tx.objectStore(QUEUE_STORE);

    const request = store.get("queue");

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all stored data (debug / reset)
 */
export async function clearStorage() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOARD_STORE, QUEUE_STORE], "readwrite");

    tx.objectStore(BOARD_STORE).clear();
    tx.objectStore(QUEUE_STORE).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

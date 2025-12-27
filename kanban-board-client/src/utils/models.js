import { v4 as uuidv4 } from "uuid";

/**
 * Utility: current timestamp as ISO string
 */
function now() {
  return new Date().toISOString();
}

/**
 * Create a new List domain object
 * @param {Object} params
 * @param {string} params.title
 */
export function createList({ title }) {
  return {
    id: uuidv4(),
    title,
    archived: false,
    cardIds: [],
    version: 1,
    lastModifiedAt: now(),
  };
}

/**
 * Create a new Card domain object
 * @param {Object} params
 * @param {string} params.listId
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {string[]} [params.tags]
 */
export function createCard({ listId, title, description = "", tags = [] }) {
  return {
    id: uuidv4(),
    listId,
    title,
    description,
    tags,
    version: 1,
    lastModifiedAt: now(),
  };
}

/**
 * Create an empty BoardState
 * Used on first load or reset
 */
export function createEmptyBoardState() {
  return {
    lists: {},
    cards: {},
    syncQueue: [],
    undoStack: [],
    redoStack: [],
  };
}

/**
 * Create a sync queue item for offline-first updates
 * @param {Object} params
 */
export function createSyncQueueItem({
  entityType,
  entityId,
  action,
  payload,
  baseVersion,
}) {
  return {
    id: uuidv4(),
    entityType, // "list" | "card"
    entityId,
    action, // "create" | "update" | "delete" | "move"
    payload, // minimal delta
    baseVersion,
    timestamp: now(),
    retryCount: 0,
  };
}

/**
 * Create a snapshot for undo/redo
 */
export function createBoardSnapshot({ lists, cards, listOrder }) {
  return {
    lists: structuredClone(lists),
    cards: structuredClone(cards),
    listOrder: structuredClone(listOrder),
  };
}

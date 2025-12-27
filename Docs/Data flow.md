# Online data flow
1. User performs an action (add card, move card, edit list).
2. Reducer updates state immediately (optimistic update).
3. Change is:
	- written to IndexedDB
	- enqueued in sync queue
4. API call sent to Express server.
5. Server confirms $\implies$ queue item removed.
6. Server rejects $\implies$ rollback + error UI.
# Offline data flow:
1. User performs action.
2. Reducer updates state.
3. Change saved locally + queued.
4. No network request.
5. When `online` fires or periodic sync runs → replay queue.

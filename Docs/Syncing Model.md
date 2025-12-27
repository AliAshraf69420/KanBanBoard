# Optimistic update sequence:
1. UI dispatches action
2. Reducer updates board state
3. State persisted to IndexedDB
4. Action serialized and queued
5. API request sent
---
# Server response:
- ## If success:
	1. Server returns updated entity with incremented version
	2. Client reconciles version
	3. Queue item removed
- ## If conflict:
	1. Server responds with latest version
	2. Client performs **three-way merge**:
		- base (last synced)
		- local (offline edits)
		- server (MongoDB)
	3. If merge fails $\implies$ show resolution UI
- ## If failure:
	- Revert reducer state
	- Display error
	- Keep queue item for retry
---
# Background sync:
1. `window.addEventListener("online", ...)`
2. `setInterval` every 30–60 seconds
3. Replay queue sequentially
4. Fetch latest server snapshot if queue empty
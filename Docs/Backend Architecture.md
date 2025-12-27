# Database chosen: MongoDB
## Rationale:
- Data is pretty simple 
- Allows:
	- atomic updates
	- conflict detection
	- future scaling (multi-user)
---
# Backend responsibility
## Backend handles:
- Validation
- Version comparison
- Conflict detection
- Artificial delay / failure injection (required)
## Backend doesn't handle:
- UI flow
- Offline logic
- Manage undo/redo
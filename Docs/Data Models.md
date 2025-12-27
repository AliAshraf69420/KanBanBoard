# Principles:
## Single source of truth:
- **Client:** `BoardState`
- **Server:** MongoDB documents
## Normalized data:
- Cards are not nested inside lists

## Cards have explicit versions:
- Entities have:
	- `version` $\implies$ integer, incremented on each server-accepted mutation
	- `lastModifiedAt`  $\implies$ timestamp
# High level architecture
## High level diagram:

```mermaid
flowchart
    UI["React UI"]
    CTX["Context + useReducer (BoardProvider)"]
    IDB["IndexedDB (Local Persistence)"]
    QUEUE["Sync Queue (Offline Actions)"]
    API["Express Server (REST API)"]
    DB[(MongoDB)]

    UI -->|User Actions| CTX
    CTX -->|State Updates| UI

    CTX -->|Persist State| IDB
    CTX -->|Enqueue Mutations| QUEUE

    QUEUE -->|Sync on Online or Timer| API
    API -->|Confirm or Reject| QUEUE

    API -->|Read and Write| DB
    DB -->|Authoritative Data| API

```
## High level architecture
- ### UI communicates with states and context to rerender components
- ### State changes invoke indexedDB changes (local storage) 
- ### State changes invoke a change that gets added to a queue that gets handled by the server
- ### Express server stores changes to a Mongo Database 
- ### Upon connection to express server, server loads changes and compares it to the indexedDB and invokes a conflict which the user changes how to handle 
---

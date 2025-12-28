# Kanban Board

A collaborative Kanban board single-page application built with React.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the Server directory:
```
MONGO_URI=mongodb://localhost:27017/kanban-board
PORT=4000
```

3. Start MongoDB (if not already running)

4. Start the server:
```bash
cd Server
npm run dev
```

5. In another terminal, start the client:
```bash
cd kanban-board-client
npm run dev
```

## Testing

### Unit Tests
Run unit tests with Jest:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### End-to-End Tests
Run Playwright e2e tests:
```bash
npm run e2e
```

## Project Structure

```
src/
  components/        # React components
  context/          # Context providers and reducers
  hooks/            # Custom hooks
  services/         # API and storage services
  utils/            # Utility functions and models
  __tests__/        # Test files
```

## Architecture

The application uses:
- React with Context API and useReducer for state management
- IndexedDB for local persistence
- Express server with MongoDB for data synchronization
- Optimistic UI updates with conflict resolution
- Offline-first architecture with sync queue

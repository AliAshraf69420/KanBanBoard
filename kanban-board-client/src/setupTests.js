import "@testing-library/jest-dom";

// --------------------
// structuredClone polyfill (REQUIRED for reducer + undo/redo)
// --------------------
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// --------------------
// Mock UUID module
// Jest will automatically use __mocks__/uuid.js
// --------------------
jest.mock("uuid");

// --------------------
// Mock IndexedDB
// --------------------
import "fake-indexeddb/auto";

// --------------------
// Mock window.matchMedia
// --------------------
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// --------------------
// Mock navigator.onLine
// --------------------
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

// --------------------
// Suppress noisy console output in tests
// --------------------
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// --------------------
// Reset mocks & UUID counter before each test
// --------------------
beforeEach(() => {
  global.__uuidCounter = 0;
  jest.clearAllMocks();
});

// UUID mock that generates unique IDs for testing
// Use a global counter to ensure uniqueness across test files
if (!global.__uuidCounter) {
  global.__uuidCounter = 0;
}

export const v4 = jest.fn(() => {
  global.__uuidCounter += 1;
  return `test-uuid-${global.__uuidCounter}`;
});

import { createList, createCard, createEmptyBoardState, createBoardSnapshot } from '../../utils/models';

describe('models', () => {
  describe('createList', () => {
    it('should create a list with required properties', () => {
      const list = createList({ title: 'Test List' });
      
      expect(list).toHaveProperty('id');
      expect(list).toHaveProperty('title', 'Test List');
      expect(list).toHaveProperty('archived', false);
      expect(list).toHaveProperty('cardIds', []);
      expect(list).toHaveProperty('version', 1);
      expect(list).toHaveProperty('lastModifiedAt');
      expect(typeof list.id).toBe('string');
      expect(list.id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs for different lists', () => {
      const list1 = createList({ title: 'List 1' });
      const list2 = createList({ title: 'List 2' });
      
      expect(list1.id).not.toBe(list2.id);
    });
  });

  describe('createCard', () => {
    it('should create a card with required properties', () => {
      const listId = 'list-1';
      const card = createCard({ listId, title: 'Test Card' });
      
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('listId', listId);
      expect(card).toHaveProperty('title', 'Test Card');
      expect(card).toHaveProperty('description', '');
      expect(card).toHaveProperty('tags', []);
      expect(card).toHaveProperty('version', 1);
      expect(card).toHaveProperty('lastModifiedAt');
    });

    it('should create a card with description and tags', () => {
      const card = createCard({
        listId: 'list-1',
        title: 'Card',
        description: 'Test description',
        tags: ['tag1', 'tag2'],
      });
      
      expect(card.description).toBe('Test description');
      expect(card.tags).toEqual(['tag1', 'tag2']);
    });

    it('should generate unique IDs for different cards', () => {
      const card1 = createCard({ listId: 'list-1', title: 'Card 1' });
      const card2 = createCard({ listId: 'list-1', title: 'Card 2' });
      
      expect(card1.id).not.toBe(card2.id);
    });
  });

  describe('createEmptyBoardState', () => {
    it('should create an empty board state', () => {
      const state = createEmptyBoardState();
      
      expect(state).toHaveProperty('lists', {});
      expect(state).toHaveProperty('cards', {});
      expect(state).toHaveProperty('listOrder', []);
      expect(state).toHaveProperty('version', 0);
      expect(state).toHaveProperty('syncQueue', []);
      expect(state).toHaveProperty('undoStack', []);
      expect(state).toHaveProperty('redoStack', []);
    });
  });

  describe('createBoardSnapshot', () => {
    it('should create a deep copy snapshot', () => {
      const lists = { 'list-1': { id: 'list-1', title: 'List 1', cardIds: [] } };
      const cards = { 'card-1': { id: 'card-1', title: 'Card 1', listId: 'list-1' } };
      const listOrder = ['list-1'];
      
      const snapshot = createBoardSnapshot({ lists, cards, listOrder });
      
      expect(snapshot.lists).toEqual(lists);
      expect(snapshot.cards).toEqual(cards);
      expect(snapshot.listOrder).toEqual(listOrder);
      expect(snapshot.lists).not.toBe(lists); // Different reference
      expect(snapshot.cards).not.toBe(cards); // Different reference
    });
  });
});


export function applyAction(board, action) {
  switch (action.type) {
    case "ADD_LIST": {
      if (!board.lists) board.lists = {};
      board.lists[action.payload.id] = action.payload;
      break;
    }

    case "UPDATE_LIST": {
      const list = board.lists[action.payload.listId];
      if (!list) break;
      list.title = action.payload.title;
      list.version++;
      break;
    }

    case "ARCHIVE_LIST": {
      const list = board.lists[action.payload.listId];
      if (!list) break;
      list.archived = true;
      list.version++;
      break;
    }

    case "ADD_CARD": {
      if (!board.cards) board.cards = {};
      if (!board.lists) board.lists = {};
      board.cards[action.payload.id] = action.payload;
      if (board.lists[action.payload.listId]) {
        if (!board.lists[action.payload.listId].cardIds) {
          board.lists[action.payload.listId].cardIds = [];
        }
        board.lists[action.payload.listId].cardIds.push(action.payload.id);
      }
      break;
    }

    case "UPDATE_CARD": {
      const card = board.cards[action.payload.cardId];
      if (!card) break;
      Object.assign(card, action.payload.updates);
      card.version++;
      break;
    }

    case "DELETE_CARD": {
      const card = board.cards[action.payload.cardId];
      if (!card) break;

      const list = board.lists[card.listId];
      if (list) {
        list.cardIds = list.cardIds.filter((id) => id !== card.id);
      }

      delete board.cards[card.id];
      break;
    }

    case "DELETE_LIST": {
      const list = board.lists[action.payload.listId];
      if (!list) break;

      // Delete all cards in the list
      list.cardIds.forEach((cardId) => {
        delete board.cards[cardId];
      });

      delete board.lists[action.payload.listId];
      break;
    }

    case "MOVE_CARD": {
      const { cardId, fromListId, toListId, targetIndex } = action.payload;

      const from = board.lists[fromListId];
      const to = board.lists[toListId];
      if (!from || !to) break;

      from.cardIds = from.cardIds.filter((id) => id !== cardId);
      to.cardIds.splice(targetIndex, 0, cardId);
      board.cards[cardId].listId = toListId;
      break;
    }
  }

  if (board.version === undefined) board.version = 0;
  board.version++;
  return board;
}

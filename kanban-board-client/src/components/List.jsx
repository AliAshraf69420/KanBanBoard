import { useState } from "react";
import { useBoardState } from "../hooks/useBoardState";
import Card from "./Card";

export default function List({ list }) {
  const { state, addCard, renameList, removeList, moveCard, moveList } =
    useBoardState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);

  const handleTitleSubmit = () => {
    renameList(list.id, titleInput.trim() || list.title);
    setIsEditingTitle(false);
  };

  // Drag & drop handlers for lists
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ listId: list.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnList = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.listId && data.listId !== list.id) {
      moveList(data.listId, list.id);
    }
  };

  const handleDragOverList = (e) => e.preventDefault();

  // Drop cards at end of list if not over a specific card
  const handleDropOnCardsContainer = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.cardId && data.fromListId) {
      moveCard(data.cardId, data.fromListId, list.id, list.cardIds.length);
    }
  };

  const handleDragOverCardsContainer = (e) => e.preventDefault();

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDropOnList}
      onDragOver={handleDragOverList}
      tabIndex={0}
      className="w-[260px] bg-obsidian-surface border border-obsidian-border rounded p-4 flex flex-col gap-3"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isEditingTitle) {
          e.preventDefault();
          setIsEditingTitle(true);
        }
      }}
    >
      {/* List Header */}
      <div className="flex justify-between items-center mb-2">
        {isEditingTitle ? (
          <input
            className="flex-1 bg-obsidian-bg border border-obsidian-border rounded px-2 py-1 text-sm text-obsidian-text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            autoFocus
          />
        ) : (
          <h3
            className="text-lg font-semibold cursor-pointer flex-1"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h3>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeList(list.id);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="ml-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
          title="Remove List"
        >
          ✕
        </button>
      </div>

      {/* Cards Container */}
      <div
        className="flex flex-col gap-2"
        onDrop={handleDropOnCardsContainer}
        onDragOver={handleDragOverCardsContainer}
      >
        {list.cardIds.length === 0 && (
          <p className="text-obsidian-muted text-sm">No cards</p>
        )}
        {list.cardIds.map((id, idx) => {
          const card = state.cards[id];
          if (!card) return null;

          // Drop handler for inserting before this card
          const handleDropOnCard = (e) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (data.cardId && data.fromListId) {
              moveCard(data.cardId, data.fromListId, list.id, idx);
            }
          };

          const handleDragOverCard = (e) => e.preventDefault();

          return (
            <div
              key={id}
              onDrop={handleDropOnCard}
              onDragOver={handleDragOverCard}
            >
              <Card card={card} />
            </div>
          );
        })}
      </div>

      {/* Add Card Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          addCard(list.id, "New Card");
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="mt-2 px-3 py-1 rounded border border-obsidian-border bg-obsidian-bg text-obsidian-text text-sm hover:bg-obsidian-surface transition"
      >
        + Add Card
      </button>
    </div>
  );
}

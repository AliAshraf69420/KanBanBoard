import { useState } from "react";
import { useBoardState } from "../hooks/useBoardState";
import Card from "./Card";

export default function List({ list }) {
  const { state, addCard, renameList, removeList, moveCard, moveList } =
    useBoardState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleTitleSubmit = () => {
    renameList(list.id, titleInput.trim() || list.title);
    setIsEditingTitle(false);
  };

  // Drag & drop handlers for lists
  const handleDragStart = (e) => {
    // Only allow list dragging from the header area (not from cards)
    // Cards will stopPropagation, so if we get here, it's a list drag
    e.dataTransfer.setData("text/plain", JSON.stringify({ listId: list.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setDragOverIndex(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.listId && data.listId !== list.id) {
        moveList(data.listId, list.id);
      }
    } catch (error) {
      // Invalid data, ignore
    }
  };

  const handleDragOverList = (e) => {
    // Allow dropping lists - we'll validate in drop handler
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Drop cards at end of list if not over a specific card
  const handleDropOnCardsContainer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setDragOverIndex(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.cardId && data.fromListId) {
        moveCard(data.cardId, data.fromListId, list.id, list.cardIds.length);
      }
    } catch (error) {
      // Invalid data, ignore
    }
  };

  const handleDragOverCardsContainer = (e) => {
    // Allow dropping cards - we'll validate in drop handler
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const handleDragLeaveCardsContainer = (e) => {
    // Only reset if we're actually leaving the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
      setDragOverIndex(null);
    }
  };

  return (
    <div
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
      {/* List Header - draggable area for list */}
      <div
        draggable={!isEditingTitle}
        onDragStart={handleDragStart}
        className="flex justify-between items-center mb-2 cursor-grab active:cursor-grabbing"
      >
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
        className={`flex flex-col gap-2 min-h-[50px] transition-colors ${
          isDraggingOver && list.cardIds.length === 0
            ? "bg-obsidian-bg/50 rounded border-2 border-dashed border-obsidian-border"
            : ""
        }`}
        onDrop={handleDropOnCardsContainer}
        onDragOver={handleDragOverCardsContainer}
        onDragLeave={handleDragLeaveCardsContainer}
      >
        {list.cardIds.length === 0 && (
          <p className="text-obsidian-muted text-sm py-2">
            {isDraggingOver ? "Drop card here" : "No cards"}
          </p>
        )}
        {list.cardIds.map((id, idx) => {
          const card = state.cards[id];
          if (!card) return null;

          // Drop handler for inserting before this card
          const handleDropOnCard = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverIndex(null);
            try {
              const data = JSON.parse(e.dataTransfer.getData("text/plain"));
              if (data.cardId && data.fromListId) {
                // Don't move if it's the same position
                if (
                  data.fromListId !== list.id ||
                  data.cardId !== id ||
                  idx !==
                    list.cardIds.findIndex((cid) => cid === data.cardId)
                ) {
                  moveCard(data.cardId, data.fromListId, list.id, idx);
                }
              }
            } catch (error) {
              // Invalid data, ignore
            }
          };

          const handleDragOverCard = (e) => {
            try {
              const data = JSON.parse(e.dataTransfer.getData("text/plain"));
              if (data.cardId && data.fromListId) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
                setDragOverIndex(idx);
              }
            } catch (error) {
              // Invalid data, ignore
            }
          };

          const handleDragLeaveCard = (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragOverIndex(null);
            }
          };

          return (
            <div
              key={id}
              className={`transition-all ${
                dragOverIndex === idx
                  ? "pt-2 border-t-2 border-obsidian-border border-dashed"
                  : ""
              }`}
              onDrop={handleDropOnCard}
              onDragOver={handleDragOverCard}
              onDragLeave={handleDragLeaveCard}
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

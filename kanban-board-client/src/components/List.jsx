import { useState } from "react";
import { useBoardState } from "../hooks/useBoardState";
import Card from "./Card";

export default function List({ list }) {
  const { state, addCard, renameList, removeList } = useBoardState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);

  const handleTitleSubmit = () => {
    renameList(list.id, titleInput.trim() || list.title);
    setIsEditingTitle(false);
  };

  return (
    <div
      className="w-[calc(20%-1rem)] min-w-[260px] bg-obsidian-surface border border-obsidian-border rounded p-4 flex flex-col gap-3"
      tabIndex={0}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
            }}
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-semibold cursor-pointer flex-1">
            {list.title}
          </h3>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeList(list.id);
          }}
          className="ml-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
          title="Remove List"
        >
          ✕
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {list.cardIds.length === 0 && (
          <p className="text-obsidian-muted text-sm">No cards</p>
        )}
        {list.cardIds.map((id) => {
          const card = list.cards?.[id] || state.cards?.[id];
          if (!card) return null;
          return (
            <Card
              key={id}
              card={card}
            />
          );
        })}
      </div>

      {/* Add Card Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // prevent bubbling
          addCard(list.id, "New Card");
        }}
        onKeyDown={(e) => e.stopPropagation()} // optional extra safety
        className="mt-2 px-3 py-1 rounded border border-obsidian-border bg-obsidian-bg text-obsidian-text text-sm hover:bg-obsidian-surface transition"
      >
        + Add Card
      </button>
    </div>
  );
}

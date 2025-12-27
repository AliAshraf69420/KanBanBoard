import { useState } from "react";
import { useBoardState } from "../hooks/useBoardState";

export default function Card({ card }) {
  const { renameCard, removeCard } = useBoardState();
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(card.title);

  const handleSubmit = () => {
    renameCard(card.id, input.trim() || card.title);
    setIsEditing(false);
  };

  return (
    <div
      className="bg-obsidian-bg border border-obsidian-border rounded p-2 flex justify-between items-center"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isEditing) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      {isEditing ? (
        <input
          className="bg-obsidian-bg border border-obsidian-border rounded px-2 py-1 text-sm text-obsidian-text w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          autoFocus
        />
      ) : (
        <div className="text-sm font-medium cursor-pointer flex-1">
          {card.title}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeCard(card.listId, card.id);
        }}
        className="ml-2 text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
        title="Remove Card"
      >
        ✕
      </button>
    </div>
  );
}

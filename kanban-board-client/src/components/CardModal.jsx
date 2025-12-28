import { useEffect, useState } from "react";
import { useBoardState } from "../hooks/useBoardState";

export default function CardModal({ card, closeModal }) {
  const { renameCard } = useBoardState();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  /* ---------------- ESC KEY ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeModal]);

  const save = () => {
    renameCard(card.id, title.trim() || card.title, description);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-obsidian-surface p-6 rounded w-[480px] border border-obsidian-border">
        <input
          className="w-full mb-3 bg-obsidian-bg border rounded px-3 py-2 text-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <textarea
          className="w-full h-32 bg-obsidian-bg border rounded px-3 py-2 resize-none"
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={closeModal}
            className="px-3 py-1 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useBoardState } from "../hooks/useBoardState";

export default function CardModal({ card, closeModal }) {
  const { updateCard } = useBoardState();
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [tags, setTags] = useState(card?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const titleInputRef = useRef(null);
  const modalRef = useRef(null);

  // Update state when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setTags(card.tags || []);
    }
  }, [card]);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 0);
    }

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    window.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      modal.removeEventListener("keydown", handleTabKey);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [closeModal]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!card) return;
    updateCard(card.id, {
      title: title.trim() || card.title,
      description: description.trim(),
      tags,
    });
    closeModal();
  };

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-obsidian-surface p-6 rounded-lg w-full max-w-2xl mx-4 border border-obsidian-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2
            id="card-modal-title"
            className="text-xl font-semibold text-obsidian-text"
          >
            Edit Card
          </h2>
          <button
            onClick={closeModal}
            className="text-obsidian-muted hover:text-obsidian-text transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label
            htmlFor="card-title-input"
            className="block text-sm font-medium text-obsidian-text mb-2"
          >
            Title
          </label>
          <input
            id="card-title-input"
            ref={titleInputRef}
            type="text"
            className="w-full bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 text-lg text-obsidian-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title..."
            aria-label="Card title"
          />
        </div>

        {/* Description Textarea */}
        <div className="mb-4">
          <label
            htmlFor="card-description-input"
            className="block text-sm font-medium text-obsidian-text mb-2"
          >
            Description
          </label>
          <textarea
            id="card-description-input"
            className="w-full h-40 bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 text-obsidian-text resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Card description"
          />
        </div>

        {/* Tags Section */}
        <div className="mb-4">
          <label
            htmlFor="card-tag-input"
            className="block text-sm font-medium text-obsidian-text mb-2"
          >
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="card-tag-input"
              type="text"
              className="flex-1 bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 text-sm text-obsidian-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              aria-label="Add tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
              aria-label="Add tag"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-100 transition"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded border border-obsidian-border bg-obsidian-bg text-obsidian-text hover:bg-obsidian-surface transition"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
            aria-label="Save card changes"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

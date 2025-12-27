import { useEffect } from "react";
import { useBoardState } from "./hooks/useBoardState";
import { useOfflineSync } from "./hooks/useOfflineSync";
import Board from "./components/Board";

export default function App() {
  // First get the board state and undo/redo functions
  const { undo, redo } = useBoardState();

  // Then call offline sync
  useOfflineSync();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if (
        ctrlOrCmd &&
        ((isMac && e.shiftKey && e.key === "Z") || (!isMac && e.key === "y"))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="dark min-h-screen p-6 bg-obsidian-bg text-obsidian-text">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="px-3 py-1 rounded border border-obsidian-border bg-obsidian-surface text-obsidian-text hover:bg-obsidian-bg transition"
          >
            Undo
          </button>
          <button
            onClick={redo}
            className="px-3 py-1 rounded border border-obsidian-border bg-obsidian-surface text-obsidian-text hover:bg-obsidian-bg transition"
          >
            Redo
          </button>
        </div>
      </header>

      <Board />
    </div>
  );
}

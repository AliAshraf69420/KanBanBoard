import { useBoardState } from "../hooks/useBoardState";
import List from "./List";

export default function Board() {
  const { state, addList } = useBoardState();
  const lists = (state.listOrder || []).map((id) => state.lists[id]);

  return (
    <div>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => addList("New List")}
          className="px-4 py-2 rounded border border-obsidian-border bg-obsidian-surface text-obsidian-text hover:bg-obsidian-bg transition"
        >
          + Add List
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {lists.length === 0 && (
          <p className="text-obsidian-muted">No lists yet</p>
        )}
        {lists.map((list) => (
          <List
            key={list.id}
            list={list}
          />
        ))}
      </div>
    </div>
  );
}

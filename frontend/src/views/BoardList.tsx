import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBoards, type Board } from "../Api";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../Api";

function CreateBoardForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleCreate() {
    setError(null);
    try {
      const board = await createBoard({ name, key });
      setName("");
      setKey("");
      onCreated();
      navigate(`/boards/${board.id}`);  // jump into the new board
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-panel border border-line bg-surface p-4">
      <h2 className="text-label font-semibold tracking-[-0.01em] text-ink">New board</h2>
      <div className="flex flex-wrap gap-2">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="text-meta font-medium text-ink-muted">Name</span>
          <input
            className="input"
            placeholder="Platform roadmap"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="flex w-28 flex-col gap-1">
          <span className="text-meta font-medium text-ink-muted">Key</span>
          <input
            className="input font-mono uppercase tabular-nums"
            placeholder="PLAT"
            maxLength={5}
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </label>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="mt-0.5 flex gap-2">
        <button
          className="btn btn-md btn-primary"
          onClick={handleCreate}
          disabled={!name.trim() || !key.trim()}
        >
          Create board
        </button>
        <button className="btn btn-md btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}



function BoardList() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    function refetchBoards() {
        setLoading(true);
        getBoards()
            .then((data) => setBoards(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        let ignore = false;
        getBoards()
        .then((data) => { if (!ignore) setBoards(data); })
        .catch((err) => { if (!ignore) setError(err.message); })
        .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, []);

    return (
        <main className="mx-auto min-h-dvh max-w-3xl px-8 py-6">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h1 className="text-title font-semibold tracking-[-0.02em] text-ink">Your boards</h1>
            <div className="flex items-center gap-1">
                <button
                    className="btn btn-md btn-primary"
                    aria-expanded={showCreate}
                    onClick={() => setShowCreate((open) => !open)}
                >
                    + New board
                </button>
            </div>
        </header>

        {showCreate && (
            <div className="mt-4">
            <CreateBoardForm
                onCreated={() => { setShowCreate(false); refetchBoards(); }}
                onCancel={() => setShowCreate(false)}
            />
            </div>
        )}

        {loading ? (
            <div className="mt-6 flex flex-col gap-2">
            <div className="h-14 animate-pulse rounded-card bg-subtle" />
            <div className="h-14 animate-pulse rounded-card bg-subtle" />
            <div className="h-14 animate-pulse rounded-card bg-subtle" />
            </div>
        ) : error ? (
            <p className="mt-6 text-body text-danger" role="alert">{error}</p>
        ) : boards.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-panel border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="text-body font-medium text-ink">No boards yet</p>
            <p className="max-w-sm text-label text-ink-muted">
                A board holds your columns and tasks. Create one to get started.
            </p>
            <button className="btn btn-md btn-primary" onClick={() => setShowCreate(true)}>
                + New board
            </button>
            </div>
        ) : (
            <ul className="mt-6 flex flex-col gap-2">
            {boards.map((board) => (
            <li key={board.id}>
                <Link
                to={`/boards/${board.id}`}
                className="group flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 transition duration-150 hover:border-line-strong hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                <span className="rounded-control bg-accent-soft px-1.5 py-0.5 font-mono text-meta font-medium tracking-wide tabular-nums text-accent">
                    {board.key}
                </span>
                <span className="min-w-0 flex-1 truncate text-body font-medium text-ink">{board.name}</span>
                <span
                    aria-hidden="true"
                    className="text-label text-ink-faint transition duration-150 group-hover:text-ink-muted"
                >
                    →
                </span>
                </Link>
            </li>
            ))}
            </ul>
        )}
        </main>
    );
}

export default BoardList;

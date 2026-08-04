import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    updateBoard,
    deleteBoard,
    type BoardDetail,
    type Column,
} from "../Api";
import DraftTask from "./DraftTask";
import CreateTaskForm from "./CreateTaskForm";
import PriorityTag from "../components/PriorityTag";


function CreateColumnForm({ boardId, nextPosition, onCreated }: {
    boardId: number;
    nextPosition: number;
    onCreated: () => void;
}) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleCreate() {
        setError(null);
        try {
        await createColumn({ board: boardId, name, position: nextPosition });
        setName("");
        onCreated();
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        }
    }

    return (
        <div className="flex w-column shrink-0 flex-col gap-2 rounded-panel border border-dashed border-line-strong p-3">
        <input
            className="input"
            placeholder="New column name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="field-error">{error}</p>}
        <button
            className="btn btn-md btn-secondary w-full"
            onClick={handleCreate}
            disabled={!name.trim()}
        >
            Add column
        </button>
        </div>
    );
}

function ColumnCard({ column, boardId, onChanged }: {
        column: Column;
        boardId: number;
        onChanged: () => void;
    }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(column.name);
    const [error, setError] = useState<string | null>(null);

    async function handleRename() {
        setError(null);
        try {
        await updateColumn(column.id, { name });
        setEditing(false);
        onChanged();
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        }
    }

    async function handleDelete() {
        if (!window.confirm(`Delete column "${column.name}" and its tasks?`)) return;
        setError(null);
        try {
        await deleteColumn(column.id);
        onChanged();
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        }
    }

    return (
    <section className="flex w-column shrink-0 flex-col rounded-panel border border-line bg-subtle">
      {editing ? (
        <div className="flex flex-col gap-2 px-3 pt-3 pb-2">
            <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-1.5">
                <button
                className="btn btn-sm btn-primary"
                onClick={handleRename}
                disabled={!name.trim()}
                >
                Save
                </button>
                <button
                className="btn btn-sm btn-secondary"
                onClick={() => { setName(column.name); setEditing(false); }}
                >
                Cancel
                </button>
            </div>
            </div>
        ) : (
            <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
            <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-label font-semibold tracking-[-0.01em] text-ink">{column.name}</h2>
                <span className="text-meta tabular-nums text-ink-faint">{column.tasks.length}</span>
            </div>
            <div className="flex items-center gap-0.5">
                <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
            </div>
            </header>
        )}
        {error && <p className="field-error px-3 pb-2">{error}</p>}
        <ul className="flex flex-col gap-2 px-3 pb-3">
            {column.tasks.length === 0 ? (
            <li className="flex min-h-24 items-center justify-center rounded-card border border-dashed border-line-strong text-meta text-ink-faint">
                No tasks
            </li>
            ) : (
            column.tasks.map((task) => (
            <li key={task.id}>
            <Link
                to={`/boards/${boardId}/tasks/${task.id}`}
                className="block rounded-card border border-line bg-surface px-3 py-2.5 transition duration-150 hover:border-line-strong hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-meta tracking-wide tabular-nums text-ink-faint">{task.key}</span>
                    <PriorityTag priority={task.priority} />
                </span>
                <span className="mt-1 block text-body font-medium leading-snug text-ink">{task.title}</span>
            </Link>
            </li>
            ))
            )}
        </ul>
    </section>
    );
}

function BoardDetailPage() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState<BoardDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showDraft, setShowDraft] = useState(false);

    const [editingBoard, setEditingBoard] = useState(false);
    const [boardName, setBoardName] = useState("");
    const [boardKey, setBoardKey] = useState("");
    const [actionError, setActionError] = useState<string | null>(null);

    function refetchBoard() {
        if (!boardId) return;
        setLoading(true);
        getBoard(boardId)
            .then((data) => setBoard(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        if (!boardId) return;
        let ignore = false;
        setLoading(true);
        getBoard(boardId)
        .then((data) => { if (!ignore) setBoard(data); })
        .catch((err) => { if (!ignore) setError(err.message); })
        .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [boardId]);

    function startEditBoard() {
        if (!board) return;
        setActionError(null);
        setBoardName(board.name);
        setBoardKey(board.key);
        setEditingBoard(true);
    }

    async function handleSaveBoard() {
        if (!board) return;
        setActionError(null);
        try {
            await updateBoard(board.id, { name: boardName, key: boardKey });
            setEditingBoard(false);
            refetchBoard();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed");
        }
    }

    async function handleDeleteBoard() {
        if (!board) return;
        if (!window.confirm(`Delete board "${board.name}" and everything in it?`)) return;
        setActionError(null);
        try {
            await deleteBoard(board.id);
            navigate("/boards");
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed");
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-[1400px] px-8 py-6">
                <div className="h-8 w-64 animate-pulse rounded-card bg-subtle" />
                <div className="mt-6 flex gap-4">
                    <div className="h-64 w-column animate-pulse rounded-panel bg-subtle" />
                    <div className="h-64 w-column animate-pulse rounded-panel bg-subtle" />
                    <div className="h-64 w-column animate-pulse rounded-panel bg-subtle" />
                </div>
            </main>
        );
    }
    if (error) {
        return (
            <main className="mx-auto max-w-[1400px] px-8 py-6">
                <p className="rounded-panel bg-danger-soft px-4 py-3 text-body text-danger" role="alert">{error}</p>
            </main>
        );
    }
    if (!board) return null;

    return (
        <main className="min-h-dvh">
        <header className="mx-auto max-w-[1400px] px-8 pt-6 pb-5">
        <Link
            to="/boards"
            className="inline-flex items-center gap-1.5 rounded-control text-label text-ink-muted transition duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
            <span aria-hidden="true">←</span> Back to boards
        </Link>
        <div className="mt-3">
        {editingBoard ? (
            <div className="flex items-center gap-2">
                <input
                    className="input max-w-xs"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                />
                <input
                    className="input w-24 font-mono tabular-nums"
                    value={boardKey}
                    onChange={(e) => setBoardKey(e.target.value)}
                />
                <button
                    className="btn btn-md btn-primary"
                    onClick={handleSaveBoard}
                    disabled={!boardName.trim() || !boardKey.trim()}
                >
                    Save
                </button>
                <button
                    className="btn btn-md btn-secondary"
                    onClick={() => setEditingBoard(false)}
                >
                    Cancel
                </button>
            </div>
        ) : (
            <div className="flex items-center justify-between gap-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="rounded-control bg-accent-soft px-1.5 py-0.5 font-mono text-meta font-medium tracking-wide tabular-nums text-accent">
                        {board.key}
                    </span>
                    <h1 className="truncate text-title font-semibold tracking-[-0.02em] text-ink">{board.name}</h1>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <button className="btn btn-sm btn-ghost" onClick={startEditBoard}>
                        Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={handleDeleteBoard}>
                        Delete
                    </button>
                    <span aria-hidden="true" className="mx-2 h-5 w-px bg-line" />
                    <button
                        className="btn btn-md btn-secondary"
                        aria-expanded={showDraft}
                        onClick={() => { setShowDraft((open) => !open); setShowAddTask(false); }}
                    >
                        Draft with AI
                    </button>
                    <button
                        className="btn btn-md btn-primary"
                        aria-expanded={showAddTask}
                        onClick={() => { setShowAddTask((open) => !open); setShowDraft(false); }}
                    >
                        + Add task
                    </button>
                </div>
            </div>
        )}
        </div>
        {actionError && <p className="field-error mt-2">{actionError}</p>}

        {showAddTask && (
            <div className="mt-4 max-w-md">
            <CreateTaskForm
                boardId={board.id}
                columns={board.columns}
                onCreated={() => { setShowAddTask(false); refetchBoard(); }}
                onCancel={() => setShowAddTask(false)}
            />
            </div>
        )}

        {showDraft && (
            <div className="mt-4 max-w-xl">
            <DraftTask
                boardId={board.id}
                columns={board.columns}
                onCreated={() => { setShowDraft(false); refetchBoard(); }}
            />
            </div>
        )}
        </header>

        <div className="overflow-x-auto pb-8">
        <div className="mx-auto max-w-[1400px] px-8">
        <div className="mx-auto flex w-max items-start gap-4">
            {board.columns.map((column) => (
            <ColumnCard
                key={column.id}
                column={column}
                boardId={board.id}
                onChanged={refetchBoard}
            />
            ))}
            <CreateColumnForm
                    boardId={board.id}
                    nextPosition={board.columns.length + 1}
                    onCreated={refetchBoard}
            />
        </div>
        </div>
        </div>
        </main>
    );
}

export default BoardDetailPage;

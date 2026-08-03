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
        <div className="w-64 flex-shrink-0 rounded border-2 border-dashed p-3">
        <input
            className="w-full rounded border p-2 mb-2"
            placeholder="New column name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
        <button
            className="w-full rounded bg-gray-600 text-white p-2 disabled:opacity-50"
            onClick={handleCreate}
            disabled={!name.trim()}
        >
            + Add column
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
    <div className="w-64 flex-shrink-0 rounded bg-gray-100 p-3">
      {editing ? (
        <div className="mb-3 space-y-2">
            <input
                className="w-full rounded border p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
                <button
                className="rounded bg-green-600 text-white px-3 py-1 text-sm disabled:opacity-50"
                onClick={handleRename}
                disabled={!name.trim()}
                >
                Save
                </button>
                <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => { setName(column.name); setEditing(false); }}
                >
                Cancel
                </button>
            </div>
            </div>
        ) : (
            <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{column.name}</h2>
            <div className="flex gap-2 text-xs">
                <button className="text-blue-600 hover:underline" onClick={() => setEditing(true)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={handleDelete}>Delete</button>
            </div>
            </div>
        )}
        {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
        <div className="space-y-2">
            {column.tasks.map((task) => (
            <Link
                key={task.id}
                to={`/boards/${boardId}/tasks/${task.id}`}
                className="block rounded bg-white p-3 shadow-sm hover:shadow"
            >
                <div className="text-xs text-gray-500">{task.key}</div>
                <div className="font-medium">{task.title}</div>
            </Link>
            ))}
        </div>
    </div>
    );
}

function BoardDetailPage() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState<BoardDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);

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

    if (loading) return <main className="p-8">Loading…</main>;
    if (error) return <main className="p-8 text-red-600">Error: {error}</main>;
    if (!board) return null;

    return (
        <main className="p-8">
        <Link to="/boards" className="text-blue-600 hover:underline">
            ← Back to board list
        </Link>
        <div className="mt-4">
        {editingBoard ? (
            <div className="flex items-center gap-2">
                <input
                    className="rounded border p-2"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                />
                <input
                    className="rounded border p-2 w-24"
                    value={boardKey}
                    onChange={(e) => setBoardKey(e.target.value)}
                />
                <button
                    className="rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50"
                    onClick={handleSaveBoard}
                    disabled={!boardName.trim() || !boardKey.trim()}
                >
                    Save
                </button>
                <button
                    className="rounded border px-4 py-2"
                    onClick={() => setEditingBoard(false)}
                >
                    Cancel
                </button>
            </div>
        ) : (
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{board.key} — {board.name}</h1>
                <button
                    className="rounded bg-green-600 text-white px-4 py-2"
                    onClick={() => setShowAddTask(true)}
                >
                    + Add task
                </button>
                <button
                    className="text-sm text-blue-600 underline"
                    onClick={startEditBoard}
                >
                    Edit board
                </button>
                <button
                    className="text-sm text-red-600 underline"
                    onClick={handleDeleteBoard}
                >
                    Delete board
                </button>
            </div>
        )}
        </div>
        {actionError && <p className="mt-2 text-red-600 text-sm">{actionError}</p>}

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

        <div className="mt-6 flex gap-4 overflow-x-auto">
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
        <DraftTask
            boardId={board.id}
            columns={board.columns}
            onCreated={() => {refetchBoard();}}/>
        </main>
    );
}

export default BoardDetailPage;

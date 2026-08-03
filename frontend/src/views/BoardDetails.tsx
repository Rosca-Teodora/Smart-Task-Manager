import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBoard, type BoardDetail } from "../Api";
import DraftTask from "./DraftTask";
import CreateTaskForm from "./CreateTaskForm";
import { createColumn } from "../Api";


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

function BoardDetailPage() {
    const { boardId } = useParams();
    const [board, setBoard] = useState<BoardDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);

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

    if (loading) return <main className="p-8">Loading…</main>;
    if (error) return <main className="p-8 text-red-600">Error: {error}</main>;
    if (!board) return null;

    return (
        <main className="p-8">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{board.key} — {board.name}</h1>
            <button
                className="rounded bg-green-600 text-white px-4 py-2"
                onClick={() => setShowAddTask(true)}
            >
                + Add task
            </button>
        </div>

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
            <div key={column.id} className="w-64 flex-shrink-0 rounded bg-gray-100 p-3">
                <h2 className="font-semibold mb-3">{column.name}</h2>
                <div className="space-y-2">
                {column.tasks.map((task) => (
                    <Link
                    key={task.id}
                    to={`/boards/${board.id}/tasks/${task.id}`}
                    className="block rounded bg-white p-3 shadow-sm hover:shadow"
                    >
                    <div className="text-xs text-gray-500">{task.key}</div>
                    <div className="font-medium">{task.title}</div>
                    </Link>
                ))}
                </div>
            </div>
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
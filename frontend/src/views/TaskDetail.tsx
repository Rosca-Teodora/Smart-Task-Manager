import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getTask,
    getBoard,
    updateTask,
    deleteTask,
    type TaskDetail,
    type Column,
} from "../Api";

function TaskDetailPage() {
    const { boardId, taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [statusId, setStatusId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    function refetchTask() {
        if (!taskId) return;
        getTask(taskId).then((data) => setTask(data)).catch((err) => setError(err.message));
    }

    useEffect(() => {
        if (!taskId || !boardId) return;
        let ignore = false;
        setLoading(true);
        Promise.all([getTask(taskId), getBoard(boardId)])
            .then(([taskData, boardData]) => {
                if (!ignore) {
                    setTask(taskData);
                    setColumns(boardData.columns);
                }
            })
            .catch((err) => { if (!ignore) setError(err.message); })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [taskId, boardId]);

    function startEdit() {
        if (!task) return;
        setActionError(null);
        setTitle(task.title);
        setDescription(task.description);
        setStatusId(task.status);
        setEditing(true);
    }

    async function handleSave() {
        if (!task) return;
        setActionError(null);
        if (statusId === null) {
            setActionError("Pick a column for the task");
            return;
        }
        try {
            await updateTask(task.id, { title, description, status: statusId });
            setEditing(false);
            refetchTask();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Save failed");
        }
    }

    async function handleDelete() {
        if (!task) return;
        if (!window.confirm(`Delete task "${task.title}"?`)) return;
        setActionError(null);
        try {
            await deleteTask(task.id);
            navigate(`/boards/${boardId}`);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Delete failed");
        }
    }

    if (loading) return <main className="p-8">Loading…</main>;
    if (error) return <main className="p-8 text-red-600">Error: {error}</main>;
    if (!task) return null;

    return (
        <main className="p-8 space-y-6">
            <Link to={`/boards/${boardId}`} className="text-blue-600 hover:underline">
                ← Back to board
            </Link>

            {editing ? (
                <div className="space-y-2 max-w-lg">
                    <input
                        className="w-full rounded border p-2 font-medium"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full rounded border p-2 text-sm"
                        rows={4}
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <select
                        className="w-full rounded border p-2 text-sm"
                        value={statusId ?? ""}
                        onChange={(e) => setStatusId(Number(e.target.value))}
                    >
                        {columns.map((column) => (
                            <option key={column.id} value={column.id}>
                                {column.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            className="rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50"
                            onClick={handleSave}
                            disabled={!title.trim()}
                        >
                            Save
                        </button>
                        <button
                            className="rounded border px-4 py-2"
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <div className="text-xs text-gray-500">{task.key}</div>
                        <h1 className="text-2xl font-bold">{task.title}</h1>
                    </div>

                    <p className="whitespace-pre-wrap">{task.description}</p>

                    <div className="text-xs text-gray-500 space-y-1">
                        <div>Created: {new Date(task.created_date).toLocaleString()}</div>
                        <div>Last edited: {new Date(task.last_edited_date).toLocaleString()}</div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="rounded bg-blue-600 text-white px-4 py-2"
                            onClick={startEdit}
                        >
                            Edit task
                        </button>
                        <button
                            className="rounded bg-red-600 text-white px-4 py-2"
                            onClick={handleDelete}
                        >
                            Delete task
                        </button>
                    </div>
                </>
            )}

            {actionError && <p className="text-red-600 text-sm">{actionError}</p>}

            {/* <div className="rounded border-2 border-dashed p-4 text-sm text-gray-500">
                comments to add
            </div> */}
        </main>
    );
}

export default TaskDetailPage;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTask, type TaskDetail } from "../Api";

function TaskDetailPage() {
    const { boardId, taskId } = useParams();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId) return;
        let ignore = false;
        setLoading(true);
        getTask(taskId)
            .then((data) => { if (!ignore) setTask(data); })
            .catch((err) => { if (!ignore) setError(err.message); })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [taskId]);

    if (loading) return <main className="p-8">Loading…</main>;
    if (error) return <main className="p-8 text-red-600">Error: {error}</main>;
    if (!task) return null;

    return (
        <main className="p-8 space-y-6">
            <Link to={`/boards/${boardId}`} className="text-blue-600 hover:underline">
                ← Back to board
            </Link>

            <div>
                <div className="text-xs text-gray-500">{task.key}</div>
                <h1 className="text-2xl font-bold">{task.title}</h1>
            </div>

            <p className="whitespace-pre-wrap">{task.description}</p>

            <div className="text-xs text-gray-500 space-y-1">
                <div>Created: {new Date(task.created_date).toLocaleString()}</div>
                <div>Last edited: {new Date(task.last_edited_date).toLocaleString()}</div>
            </div>

            <div className="rounded border-2 border-dashed p-4 text-sm text-gray-500">
                Comments coming soon
            </div>
        </main>
    );
}

export default TaskDetailPage;

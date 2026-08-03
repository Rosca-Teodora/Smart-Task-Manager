import { useState } from "react";
import { createTask, type Column } from "../Api";

type Props = {
    boardId: number;
    columns: Column[];   // the board's columns, user picks which one the task lands in
    onCreated: () => void;  // callback to refresh the board after saving
    onCancel: () => void;   // close the form without saving
};

function CreateTaskForm({ boardId, columns, onCreated, onCancel }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [statusId, setStatusId] = useState<number | null>(columns[0]?.id ?? null);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setError(null);
        if (statusId === null) {
            setError("Pick a column for the task");
            return;
        }
        try {
            await createTask({
                board: boardId,
                status: statusId,
                title,
                description,
                position: 1.0,  // simple default; ordering can improve later
            });
            onCreated();  // tell the parent to refetch the board (and close)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        }
    }

    return (
        <div className="rounded border p-4 space-y-2">
            <h3 className="font-semibold">New task</h3>
            <input
                className="w-full rounded border p-2 font-medium"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="w-full rounded border p-2 text-sm"
                rows={3}
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
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2">
                <button
                    className="rounded bg-green-600 text-white px-4 py-2 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={!title.trim()}
                >
                    Save task
                </button>
                <button
                    className="rounded border px-4 py-2"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default CreateTaskForm;

import { useState } from "react";
import { draftTask, createTask, type Column } from "../Api";

type Props = {
    boardId: number;
    columns: Column[];   // the board's columns, user picks which one the task lands in
    onCreated: () => void;  // callback to refresh the board after saving
};

function DraftTask({ boardId, columns, onCreated }: Props) {
    const [input, setInput] = useState("");
    const [drafting, setDrafting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusId, setStatusId] = useState<number | null>(columns[0]?.id ?? null);

    // The editable task fields (filled by AI or typed manually)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [editing, setEditing] = useState(false);

    async function handleDraft() {
        setError(null);
        setDrafting(true);
        try {
        const result = await draftTask(input);
        setTitle(result.title);
        setDescription(result.description);
        setPriority(result.priority);
        setEditing(true);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Drafting failed");
        } finally {
        setDrafting(false);
        }
    }

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
        // reset
        setInput("");
        setTitle("");
        setDescription("");
        setPriority("");
        setEditing(false);
        onCreated();  // tell the parent to refetch the board
        } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        }
    }

    return (
        <div className="rounded border p-4 space-y-3">
        <h3 className="font-semibold">Add a task using AI</h3>

        <div className="flex gap-2">
            <input
            className="flex-1 rounded border p-2"
            placeholder="Describe your task roughly…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button
            className="rounded bg-blue-600 text-white px-4 disabled:opacity-50"
            onClick={handleDraft}
            disabled={drafting || !input.trim()}
            >
            {drafting ? "Drafting…" : "Draft with AI"}
            </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {editing && (
            <div className="space-y-2 border-t pt-3">
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
            {priority && (
                <div className="text-xs text-gray-500">
                Suggested priority: <span className="font-medium">{priority}</span>
                </div>
            )}
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
                Save task
                </button>
                <button
                className="rounded border px-4 py-2"
                onClick={() => setEditing(false)}
                >
                Cancel
                </button>
            </div>
            </div>
        )}
        </div>
    );
}

export default DraftTask;
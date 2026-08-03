import { useState } from "react";
import { draftTask, createTask } from "../Api";

type Props = {
    boardId: number;
    statusId: number;   // which column the new task lands in
    onCreated: () => void;  // callback to refresh the board after saving
};

function DraftTask({ boardId, statusId, onCreated }: Props) {
    const [input, setInput] = useState("");
    const [drafting, setDrafting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // The editable draft fields (filled by AI, then user-editable)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [hasDraft, setHasDraft] = useState(false);

    async function handleDraft() {
        setError(null);
        setDrafting(true);
        try {
        const result = await draftTask(input);
        setTitle(result.title);
        setDescription(result.description);
        setPriority(result.priority);
        setHasDraft(true);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Drafting failed");
        } finally {
        setDrafting(false);
        }
    }

    async function handleSave() {
        setError(null);
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
        setHasDraft(false);
        onCreated();  // tell the parent to refetch the board
        } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        }
    }

    return (
        <div className="rounded border p-4 space-y-3">
        <h3 className="font-semibold">Draft a task with AI</h3>

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

        {hasDraft && (
            <div className="space-y-2 border-t pt-3">
            <input
                className="w-full rounded border p-2 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="w-full rounded border p-2 text-sm"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className="text-xs text-gray-500">
                Suggested priority: <span className="font-medium">{priority}</span>
            </div>
            <button
                className="rounded bg-green-600 text-white px-4 py-2"
                onClick={handleSave}
            >
                Save task
            </button>
            </div>
        )}
        </div>
    );
}

export default DraftTask;
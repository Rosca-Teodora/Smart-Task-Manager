import { useState } from "react";
import { createTask, type Column, type Priority } from "../Api";
import { PRIORITY_OPTIONS } from "../components/priority";

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
    const [priority, setPriority] = useState<Priority>("MED");
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
                priority,
                position: 1.0,  // simple default; ordering can improve later
            });
            onCreated();  // tell the parent to refetch the board (and close)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
        }
    }

    return (
        <div className="flex flex-col gap-2.5 rounded-panel border border-line bg-surface p-4">
            <h3 className="text-label font-semibold tracking-[-0.01em] text-ink">New task</h3>
            <input
                className="input font-medium"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="input resize-y leading-snug"
                rows={3}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1">
                    <span className="text-meta font-medium text-ink-muted">Column</span>
                    <select
                        className="input"
                        value={statusId ?? ""}
                        onChange={(e) => setStatusId(Number(e.target.value))}
                    >
                        {columns.map((column) => (
                            <option key={column.id} value={column.id}>
                                {column.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-meta font-medium text-ink-muted">Priority</span>
                    <select
                        className="input"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                    >
                        {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {error && <p className="field-error">{error}</p>}
            <div className="mt-0.5 flex gap-2">
                <button
                    className="btn btn-md btn-primary"
                    onClick={handleSave}
                    disabled={!title.trim()}
                >
                    Save task
                </button>
                <button
                    className="btn btn-md btn-secondary"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default CreateTaskForm;

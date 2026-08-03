import { useState } from "react";
import { draftTask, createTask, type Column, type Priority } from "../Api";
import { PRIORITY_OPTIONS } from "../components/priority";

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
    const [priority, setPriority] = useState<Priority>("MED");
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

    function resetDraft() {
        setTitle("");
        setDescription("");
        setPriority("MED");
        setEditing(false);
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
            priority,
            position: 1.0,  // simple default; ordering can improve later
        });
        // reset
        setInput("");
        resetDraft();
        onCreated();  // tell the parent to refetch the board
        } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        }
    }

    return (
        <section className="rounded-panel border border-line bg-surface p-4" aria-busy={drafting}>
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-label font-semibold tracking-[-0.01em] text-ink">Draft a task with AI</h2>
            <span className="text-meta text-ink-muted">You review everything before it saves</span>
        </header>

        <div className="mt-3 flex flex-col gap-2">
            <textarea
            className="input resize-y leading-snug"
            rows={2}
            placeholder="Describe the task roughly — e.g. filters reset whenever the board reloads"
            value={input}
            disabled={drafting}
            onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex justify-end">
            <button
                className="btn btn-md btn-primary"
                onClick={handleDraft}
                disabled={drafting || !input.trim()}
            >
                {drafting ? "Drafting…" : "Draft with AI"}
            </button>
            </div>
        </div>

        {error && !editing && <p className="field-error mt-2" role="alert">{error}</p>}

        {drafting && (
            <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
            <div className="h-4 w-40 animate-pulse rounded-control bg-subtle" />
            <div className="h-9 animate-pulse rounded-control bg-subtle" />
            <div className="h-20 animate-pulse rounded-control bg-subtle" />
            <div className="h-9 w-1/2 animate-pulse rounded-control bg-subtle" />
            </div>
        )}

        {editing && !drafting && (
            <div className="mt-4 border-t border-line pt-4">
            <p className="mb-3 flex items-center gap-2 rounded-control bg-accent-soft px-2.5 py-1.5 text-meta font-medium text-accent">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                Drafted by AI — check it before saving
            </p>

            <div className="flex flex-col gap-2.5">
                <label className="flex flex-col gap-1">
                <span className="text-meta font-medium text-ink-muted">Title</span>
                <input
                    className="input font-medium"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                </label>

                <label className="flex flex-col gap-1">
                <span className="text-meta font-medium text-ink-muted">Description</span>
                <textarea
                    className="input resize-y leading-snug"
                    rows={3}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                </label>

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

                {error && <p className="field-error" role="alert">{error}</p>}

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
                    onClick={resetDraft}
                >
                    Discard draft
                </button>
                </div>
            </div>
            </div>
        )}
        </section>
    );
}

export default DraftTask;

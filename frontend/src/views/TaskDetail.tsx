import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getTask,
    getBoard,
    updateTask,
    deleteTask,
    createComment,
    getComments,
    deleteComment,
    type Priority,
    type TaskDetail,
    type Column,
    type Comment,
} from "../Api";
import PriorityTag from "../components/PriorityTag";
import { PRIORITY_OPTIONS } from "../components/priority";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
};

function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, DATE_FORMAT);
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="text-meta font-medium text-ink-muted">{label}</dt>
            <dd className="text-right text-label text-ink">{children}</dd>
        </div>
    );
}

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
    const [priority, setPriority] = useState<Priority>("MED");
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [confirmDeleteComment, setConfirmDeleteComment] = useState<number | null>(null);
    const [deletingComment, setDeletingComment] = useState<number | null>(null);

    function refetchTask() {
        if (!taskId) return;
        getTask(taskId).then((data) => {
            setTask(data);
            setComments(data.comments);
            })
            .catch((err)=> setError(err.message));
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
                    setComments(taskData.comments);
                }
            })
            .catch((err) => { if (!ignore) setError(err.message); })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [taskId, boardId]);

    function startEdit() {
        if (!task) return;
        setActionError(null);
        setConfirmDelete(false);
        setTitle(task.title);
        setDescription(task.description);
        setStatusId(task.status);
        setPriority(task.priority);
        setEditing(true);
    }

    async function handleSave() {
        if (!task) return;
        setActionError(null);
        if (statusId === null) {
            setActionError("Pick a column for the task");
            return;
        }
        setSaving(true);
        try {
            await updateTask(task.id, { title: title.trim(), description, status: statusId, priority });
            setEditing(false);
            refetchTask();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!task) return;
        setActionError(null);
        try {
            await deleteTask(task.id);
            navigate(`/boards/${boardId}`);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Delete failed");
            setConfirmDelete(false);
        }
    }

    async function handleAddComment(e: React.FormEvent) {
        e.preventDefault();
        if (!task || !commentText.trim()) return;
        setCommentError(null);
        setPostingComment(true);

        try {
            await createComment({task: task.id, text: commentText.trim()})
            const fresh = await getComments(task.id);
            setComments(fresh);
            setCommentText("");
        } catch (err) {
            setCommentError(err instanceof Error ? err.message : "Could not post comment");
        } finally {
            setPostingComment(false);
        }
    }

    async function handleDeleteComment(commentId: number) {
        setCommentError(null);
        setDeletingComment(commentId);
        try {
            await deleteComment(commentId);
            setComments((current) => current.filter((c) => c.id !== commentId));
            setConfirmDeleteComment(null);
        } catch (err) {
            setCommentError(err instanceof Error ? err.message : "Could not delete comment");
        } finally {
            setDeletingComment(null);
        }
    }

    const backLink = (
        <Link
            to={`/boards/${boardId}`}
            className="inline-flex items-center gap-1.5 rounded-control text-label text-ink-muted transition duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
            <span aria-hidden="true">←</span> Back to board
        </Link>
    );

    if (loading) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
                {backLink}
                <div className="mt-6 h-8 w-2/3 animate-pulse rounded-card bg-subtle" />
                <div className="mt-5 h-36 animate-pulse rounded-panel bg-subtle" />
                <div className="mt-4 h-28 animate-pulse rounded-panel bg-subtle" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
                {backLink}
                <p className="mt-6 rounded-panel bg-danger-soft px-4 py-3 text-body text-danger" role="alert">
                    {error}
                </p>
            </main>
        );
    }

    if (!task) return null;

    const column = columns.find((c) => c.id === task.status);

    return (
        <main className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-3xl px-6 py-8 sm:px-8">
            {backLink}

            {editing ? (
                <section className="mt-5 rounded-panel border border-line bg-surface p-6 shadow-[0_20px_50px_-30px_rgba(28,24,21,0.45)]">
                    <h1 className="text-label font-semibold tracking-[-0.01em] text-ink">Edit task</h1>

                    <div className="mt-5 flex flex-col gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-meta font-medium text-ink-muted">Title</span>
                            <input
                                className="input text-body font-medium"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-meta font-medium text-ink-muted">Description</span>
                            <textarea
                                className="input resize-y leading-relaxed"
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </label>

                        <div className="flex flex-wrap gap-3">
                            <label className="flex min-w-40 flex-1 flex-col gap-1">
                                <span className="text-meta font-medium text-ink-muted">Column</span>
                                <select
                                    className="input"
                                    value={statusId ?? ""}
                                    onChange={(e) => setStatusId(Number(e.target.value))}
                                >
                                    {columns.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex min-w-40 flex-1 flex-col gap-1">
                                <span className="text-meta font-medium text-ink-muted">Priority</span>
                                <select
                                    className="input"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as Priority)}
                                >
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {actionError && (
                            <p className="rounded-control bg-danger-soft px-2.5 py-2 text-meta text-danger" role="alert">
                                {actionError}
                            </p>
                        )}

                        <div className="mt-1 flex gap-2">
                            <button
                                className="btn btn-md btn-primary"
                                onClick={handleSave}
                                disabled={saving || !title.trim()}
                            >
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                            <button className="btn btn-md btn-secondary" onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    <header className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <span className="rounded-control bg-accent-soft px-1.5 py-0.5 font-mono text-meta font-medium tracking-wide tabular-nums text-accent">
                                    {task.key}
                                </span>
                                <PriorityTag priority={task.priority} />
                            </div>
                            <h1 className="mt-2.5 text-title font-semibold tracking-[-0.02em] text-balance text-ink">
                                {task.title}
                            </h1>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <button className="btn btn-md btn-secondary" onClick={startEdit}>
                                Edit task
                            </button>
                            <button
                                className="btn btn-md btn-danger"
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete
                            </button>
                        </div>
                    </header>

                    {confirmDelete && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-panel bg-danger-soft px-4 py-3">
                            <p className="text-label text-danger">
                                Delete {task.key} permanently? This cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button className="btn btn-sm btn-primary" onClick={handleDelete}>
                                    Delete task
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => setConfirmDelete(false)}>
                                    Keep it
                                </button>
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <p className="mt-4 rounded-control bg-danger-soft px-2.5 py-2 text-meta text-danger" role="alert">
                            {actionError}
                        </p>
                    )}

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
                        <section className="rounded-panel border border-line bg-surface p-5">
                            <h2 className="text-meta font-medium text-ink-muted">Description</h2>
                            {task.description.trim() ? (
                                <p className="mt-2.5 whitespace-pre-wrap text-body leading-relaxed text-pretty text-ink">
                                    {task.description}
                                </p>
                            ) : (
                                <p className="mt-2.5 text-body text-ink-faint">
                                    No description yet. Use{" "}
                                    <button
                                        className="rounded-control text-accent underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                                        onClick={startEdit}
                                    >
                                        Edit task
                                    </button>{" "}
                                    to add one.
                                </p>
                            )}
                        </section>

                        <aside className="rounded-panel border border-line bg-subtle px-4 py-2">
                            <dl>
                                <MetaRow label="Column">{column?.name ?? "Unknown"}</MetaRow>
                                <MetaRow label="Priority">
                                    <PriorityTag priority={task.priority} />
                                </MetaRow>
                                <MetaRow label="Created">
                                    <time dateTime={task.created_date} className="tabular-nums">
                                        {formatDate(task.created_date)}
                                    </time>
                                </MetaRow>
                                <MetaRow label="Last edited">
                                    <time dateTime={task.last_edited_date} className="tabular-nums">
                                        {formatDate(task.last_edited_date)}
                                    </time>
                                </MetaRow>
                            </dl>
                        </aside>
                    </div>
                    <section className="mt-4 rounded-panel border border-line bg-surface p-5">
                    <h2 className="text-meta font-medium text-ink-muted">
                        Comments{comments.length > 0 && ` (${comments.length})`}
                    </h2>

                    <div className="mt-3 flex flex-col gap-3">
                        {comments.length === 0 ? (
                            <p className="text-body text-ink-faint">No comments yet.</p>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="group/comment rounded-card bg-subtle px-4 py-3">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-label font-medium text-ink">{c.author}</span>
                                        <time
                                            dateTime={c.created_date}
                                            className="text-meta tabular-nums text-ink-faint"
                                        >
                                            {formatDate(c.created_date)}
                                        </time>
                                        <button
                                            className="btn btn-sm btn-danger ml-auto opacity-0 transition duration-150 group-hover/comment:opacity-100 focus-visible:opacity-100"
                                            aria-label={`Delete comment by ${c.author}`}
                                            onClick={() => setConfirmDeleteComment(c.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="mt-1.5 whitespace-pre-wrap text-body leading-relaxed text-pretty text-ink">
                                        {c.text}
                                    </p>
                                    {confirmDeleteComment === c.id && (
                                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 rounded-control bg-danger-soft px-3 py-2">
                                            <p className="text-meta text-danger">Delete this comment?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    disabled={deletingComment === c.id}
                                                    onClick={() => handleDeleteComment(c.id)}
                                                >
                                                    {deletingComment === c.id ? "Deleting…" : "Delete"}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => setConfirmDeleteComment(null)}
                                                >
                                                    Keep it
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddComment} className="mt-4 flex flex-col gap-2">
                        <textarea
                            className="input resize-y leading-relaxed"
                            rows={3}
                            placeholder="Add a comment…"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        {commentError && (
                            <p className="rounded-control bg-danger-soft px-2.5 py-2 text-meta text-danger" role="alert">
                                {commentError}
                            </p>
                        )}
                        <button
                            className="btn btn-md btn-primary self-start"
                            type="submit"
                            disabled={postingComment || !commentText.trim()}
                        >
                            {postingComment ? "Posting…" : "Post comment"}
                        </button>
                    </form>
                </section>
                </>
            )}
        </main>
    );
}

export default TaskDetailPage;

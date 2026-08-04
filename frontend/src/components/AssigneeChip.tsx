import type { Assignment } from "../Api";
import { toneFor, initialsFor } from "./avatar";

type Props = {
    assignment: Assignment;
    canRemove: boolean;
    removing: boolean;
    onRemove: () => void;
};

function AssigneeChip({ assignment, canRemove, removing, onRemove }: Props) {
    return (
        <li className="flex w-full items-center gap-2 rounded-full bg-surface py-1 pr-1 pl-1 ring-1 ring-line transition duration-150 hover:ring-line-strong">
            <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-meta font-semibold tracking-tight ${toneFor(assignment.username)}`}
            >
                {initialsFor(assignment.username)}
            </span>
            <span className="min-w-0 truncate text-label text-ink">{assignment.username}</span>
            {canRemove && (
                <button
                    type="button"
                    aria-label={`Unassign ${assignment.username}`}
                    disabled={removing}
                    onClick={onRemove}
                    className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full text-meta text-ink-faint transition duration-150 hover:bg-danger-soft hover:text-danger active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
                >
                    <span aria-hidden="true">{removing ? "…" : "✕"}</span>
                </button>
            )}
        </li>
    );
}

export default AssigneeChip;

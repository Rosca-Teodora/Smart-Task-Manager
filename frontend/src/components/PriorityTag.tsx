import type { Priority } from "../Api";
import { PRIORITY_LABEL as LABEL } from "./priority";

const DOT: Record<Priority, string> = {
    LOW: "bg-line-strong",
    MED: "bg-ink-muted",
    HIGH: "bg-danger",
};

function PriorityTag({ priority }: { priority: Priority }) {
    const level = priority in LABEL ? priority : "MED";

    return (
        <span className="inline-flex items-center gap-1.5 text-meta text-ink-muted">
            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${DOT[level]}`} />
            <span className="sr-only">Priority: </span>
            {LABEL[level]}
        </span>
    );
}

export default PriorityTag;

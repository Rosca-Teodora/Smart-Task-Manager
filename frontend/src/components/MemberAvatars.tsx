import type { BoardMember } from "../Api";

const MAX_SHOWN = 5;

/* One hue family, four legible steps, so members stay distinguishable
   at a glance without introducing a second accent colour. */
const TONES = [
    "bg-accent text-white",
    "bg-accent-soft text-accent",
    "bg-ink text-canvas",
    "bg-subtle text-ink-muted",
];

function toneFor(username: string) {
    let hash = 0;
    for (const char of username) {
        hash = (hash * 31 + char.charCodeAt(0)) % 997;
    }
    return TONES[hash % TONES.length];
}

function initialsFor(username: string) {
    const parts = username.split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatRole(role: string) {
    if (!role) return "Member";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function Avatar({ member }: { member: BoardMember }) {
    return (
        <li className="group relative -ml-1.5 first:ml-0">
            <span
                tabIndex={0}
                className={`flex size-8 items-center justify-center rounded-full text-meta font-semibold tracking-tight ring-2 ring-canvas transition duration-150 group-hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${toneFor(member.username)}`}
            >
                <span aria-hidden="true">{initialsFor(member.username)}</span>
                <span className="sr-only">{member.username}, {formatRole(member.role)}</span>
            </span>

            <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 flex -translate-x-1/2 translate-y-1 flex-col items-center gap-0.5 rounded-control bg-ink px-2.5 py-1.5 opacity-0 shadow-[0_10px_24px_-12px_rgba(28,24,21,0.7)] transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
            >
                <span className="whitespace-nowrap text-meta font-medium text-canvas">
                    {member.username}
                </span>
                <span className="whitespace-nowrap text-meta text-line-strong">
                    {formatRole(member.role)}
                </span>
            </span>
        </li>
    );
}

function MemberAvatars({ members }: { members: BoardMember[] }) {
    if (members.length === 0) {
        return <p className="text-meta text-ink-faint">No members yet</p>;
    }

    const shown = members.slice(0, MAX_SHOWN);
    const overflow = members.length - shown.length;

    return (
        <div className="flex items-center gap-2.5">
            <ul className="flex items-center">
                {shown.map((member) => (
                    <Avatar key={member.username} member={member} />
                ))}
                {overflow > 0 && (
                    <li
                        className="-ml-1.5 flex size-8 items-center justify-center rounded-full bg-surface text-meta font-medium tabular-nums text-ink-muted ring-2 ring-canvas"
                        title={members.slice(MAX_SHOWN).map((m) => m.username).join(", ")}
                    >
                        +{overflow}
                    </li>
                )}
            </ul>
            <span className="text-meta text-ink-faint">
                {members.length} {members.length === 1 ? "member" : "members"}
            </span>
        </div>
    );
}

export default MemberAvatars;

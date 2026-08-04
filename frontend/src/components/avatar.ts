/* One hue family, four legible steps, so members stay distinguishable
   at a glance without introducing a second accent colour. */
const TONES = [
    "bg-accent text-white",
    "bg-accent-soft text-accent",
    "bg-ink text-canvas",
    "bg-subtle text-ink-muted",
];

export function toneFor(username: string) {
    let hash = 0;
    for (const char of username) {
        hash = (hash * 31 + char.charCodeAt(0)) % 997;
    }
    return TONES[hash % TONES.length];
}

export function initialsFor(username: string) {
    const parts = username.split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatRole(role: string) {
    if (!role) return "Member";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

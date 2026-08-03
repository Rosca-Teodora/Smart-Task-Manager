import type { Priority } from "../Api";

export const PRIORITY_LABEL: Record<Priority, string> = {
    LOW: "Low",
    MED: "Medium",
    HIGH: "High",
};

export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABEL) as Priority[]).map(
    (value) => ({ value, label: PRIORITY_LABEL[value] })
);

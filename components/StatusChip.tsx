"use client";

import type { Status } from "@/lib/types";
import { STATUSES } from "@/lib/types";

type Props = {
  value: Status;
  onChange?: (next: Status) => void;
  interactive?: boolean;
};

export default function StatusChip({ value, onChange, interactive }: Props) {
  const cycle = () => {
    if (!onChange) return;
    const i = STATUSES.indexOf(value);
    onChange(STATUSES[(i + 1) % STATUSES.length]);
  };

  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-colors";
  const palette =
    value === "Completed"
      ? "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)]"
      : value === "Parked"
      ? "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)]"
      : value === "In Progress"
      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
      : value === "Worth Developing"
      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]";

  if (!interactive) {
    return <span className={`${base} ${palette}`}>{value}</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        cycle();
      }}
      className={`${base} ${palette} hover:opacity-80 cursor-pointer`}
      title="Tap to change status"
      aria-label={`Status: ${value}. Tap to change.`}
    >
      {value}
    </button>
  );
}

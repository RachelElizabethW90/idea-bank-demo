"use client";

import { useState } from "react";
import type { Filters as F } from "@/lib/types";
import { ENERGIES, STATUSES } from "@/lib/types";
import type { NamedOption, PainPoint } from "@/lib/types";

type Props = {
  value: F;
  onChange: (next: F) => void;
  formats: NamedOption[];
  series: NamedOption[];
  painPoints: PainPoint[];
  activeCount: number;
};

export default function Filters({
  value,
  onChange,
  formats,
  series,
  painPoints,
  activeCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<F>) => onChange({ ...value, ...patch });

  const toggle = <K extends keyof F>(k: K, item: string) => {
    const arr = value[k] as unknown as string[];
    const has = arr.includes(item);
    const next = has ? arr.filter((x) => x !== item) : [...arr, item];
    onChange({ ...value, [k]: next } as F);
  };

  const label = open
    ? "Hide filters"
    : activeCount > 0
      ? `Show filters (${activeCount} active)`
      : "Show filters";

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="filters-panel"
        className="w-full cursor-pointer select-none px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium">Filters &amp; sort</span>
        <span className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <span>{label}</span>
          <span
            aria-hidden
            className="inline-block transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            {"▾"}
          </span>
        </span>
      </button>
      {open && (
      <div
        id="filters-panel"
        className="px-4 pb-4 pt-1 space-y-4 border-t border-[color:var(--border)]"
      >
        <section>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Sort by
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              ["excitement", "Most exciting"],
              ["newest", "Newest"],
              ["updated", "Recently updated"],
            ] as const).map(([key, label]) => (
              <Pill
                key={key}
                active={value.sort === key}
                onClick={() => update({ sort: key })}
              >
                {label}
              </Pill>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Brain dump
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              ["any", "Any"],
              ["has", "Has one"],
              ["needs", "Needs one"],
            ] as const).map(([key, label]) => (
              <Pill
                key={key}
                active={value.brain_dump === key}
                onClick={() => update({ brain_dump: key })}
              >
                {label}
              </Pill>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Pill
                key={s}
                active={value.statuses.includes(s)}
                onClick={() => toggle("statuses", s)}
              >
                {s}
              </Pill>
            ))}
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <input
              type="checkbox"
              checked={value.show_parked_completed}
              onChange={(e) =>
                update({ show_parked_completed: e.target.checked })
              }
              className="accent-[color:var(--accent)]"
            />
            Show Parked and Completed in default view
          </label>
        </section>

        <section>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Energy
          </label>
          <div className="flex flex-wrap gap-2">
            {ENERGIES.map((e) => (
              <Pill
                key={e}
                active={value.energies.includes(e)}
                onClick={() => toggle("energies", e)}
              >
                {e}
              </Pill>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Minimum excitement
          </label>
          <div className="flex flex-wrap gap-2">
            {[null, 1, 2, 3, 4, 5].map((n) => (
              <Pill
                key={String(n)}
                active={value.min_excitement === n}
                onClick={() => update({ min_excitement: n })}
              >
                {n === null ? "Any" : `${n}+ ♥`}
              </Pill>
            ))}
          </div>
        </section>

        {formats.length > 0 && (
          <section>
            <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
              Format
            </label>
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <Pill
                  key={f.id}
                  active={value.format_ids.includes(f.id)}
                  onClick={() => toggle("format_ids", f.id)}
                >
                  {f.name}
                </Pill>
              ))}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section>
            <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
              Series
            </label>
            <div className="flex flex-wrap gap-2">
              {series.map((s) => (
                <Pill
                  key={s.id}
                  active={value.series_ids.includes(s.id)}
                  onClick={() => toggle("series_ids", s.id)}
                >
                  {s.name}
                </Pill>
              ))}
            </div>
          </section>
        )}

        {painPoints.length > 0 && (
          <section>
            <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
              Pain point
            </label>
            <div className="flex flex-wrap gap-2">
              {painPoints.map((p) => (
                <Pill
                  key={p.id}
                  active={value.pain_point_ids.includes(p.id)}
                  onClick={() => toggle("pain_point_ids", p.id)}
                >
                  {p.name}
                </Pill>
              ))}
            </div>
          </section>
        )}
      </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--accent)]/40"
      }`}
    >
      {children}
    </button>
  );
}

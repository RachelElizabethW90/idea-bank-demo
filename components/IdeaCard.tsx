"use client";

import Link from "next/link";
import type { Idea, NamedOption, PainPoint, Status } from "@/lib/types";
import Hearts from "./Hearts";
import StatusChip from "./StatusChip";

type Props = {
  idea: Idea;
  formats: NamedOption[];
  series: NamedOption[];
  painPoints: PainPoint[];
  onStatusChange: (id: string, next: Status) => void;
};

export default function IdeaCard({
  idea,
  formats,
  series,
  painPoints,
  onStatusChange,
}: Props) {
  const fmt = formats.find((f) => f.id === idea.format_id)?.name;
  const ser = series.find((s) => s.id === idea.series_id)?.name;
  const pp = painPoints
    .filter((p) => idea.pain_point_ids.includes(p.id))
    .map((p) => p.name);
  const hasBrainDump = idea.brain_dump.trim().length > 0;

  return (
    <Link
      href={`/idea/${idea.id}`}
      className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 hover:border-[color:var(--accent)]/60 transition-colors no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium leading-snug flex-1">
          {idea.title || "Untitled"}
        </h3>
        <StatusChip
          value={idea.status}
          interactive
          onChange={(next) => onStatusChange(idea.id, next)}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--muted)]">
        {idea.excitement !== null && (
          <Hearts value={idea.excitement} readOnly size="sm" />
        )}
        {idea.energy && <span>{idea.energy}</span>}
        {fmt && <span>{fmt}</span>}
        {ser && <span>{ser}</span>}
        {hasBrainDump && (
          <span aria-label="Has brain dump" title="Has brain dump">
            {"✎"} brain dump
          </span>
        )}
      </div>

      {pp.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {pp.map((name) => (
            <span
              key={name}
              className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[11px] text-[color:var(--muted)]"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

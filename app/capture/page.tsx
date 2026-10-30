"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { useIdeaBank } from "@/lib/store";
import { parseCapture, type ParsedCapture } from "@/lib/parse-capture";

export default function CapturePage() {
  const router = useRouter();
  const { ready, state, createIdea, updateIdea } = useIdeaBank();
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedCapture | null>(null);
  const [edited, setEdited] = useState<ParsedCapture | null>(null);

  const sortedFormats = useMemo(
    () => [...state.formats].sort((a, b) => a.sort_order - b.sort_order),
    [state.formats],
  );
  const sortedSeries = useMemo(
    () => [...state.series].sort((a, b) => a.sort_order - b.sort_order),
    [state.series],
  );
  const sortedPainPoints = useMemo(
    () => [...state.pain_points].sort((a, b) => a.sort_order - b.sort_order),
    [state.pain_points],
  );

  const onReview = () => {
    if (!raw.trim()) return;
    const p = parseCapture(
      raw,
      sortedFormats,
      sortedSeries,
      sortedPainPoints,
    );
    setParsed(p);
    setEdited(p);
  };

  const onSave = () => {
    if (!edited) return;
    const title = edited.title.trim() || "Untitled";
    const idea = createIdea(title);
    updateIdea(idea.id, {
      format_id: edited.format_id,
      series_id: edited.series_id,
      pain_point_ids: edited.pain_point_ids,
      brain_dump: edited.brain_dump,
    });
    router.push(`/idea/${idea.id}`);
  };

  if (!ready) {
    return (
      <Shell>
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  if (!parsed || !edited) {
    return (
      <Shell>
        <div className="space-y-4">
          <div>
            <Link
              href="/"
              className="text-sm text-[color:var(--muted)] no-underline"
            >
              {"←"} Back
            </Link>
            <h1 className="mt-2 text-xl font-semibold">Paste a capture</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Paste the full AI response. The app pulls out the title and tags
              it recognizes; the whole text goes into the brain dump.
            </p>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={16}
            placeholder="Paste the capture here…"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 text-base font-mono outline-none focus:border-[color:var(--accent)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReview}
              disabled={!raw.trim()}
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-[color:var(--accent-ink)] disabled:opacity-40 cursor-pointer"
            >
              Review
            </button>
            <Link
              href="/"
              className="rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm no-underline"
            >
              Cancel
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <div>
          <button
            type="button"
            onClick={() => {
              setParsed(null);
              setEdited(null);
            }}
            className="text-sm text-[color:var(--muted)] cursor-pointer"
          >
            {"←"} Edit paste
          </button>
          <h1 className="mt-2 text-xl font-semibold">Review</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Fix anything, then Save.
          </p>
        </div>

        <Field label="Title">
          <input
            type="text"
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-base outline-none focus:border-[color:var(--accent)]"
          />
        </Field>

        <Field label="Format">
          <select
            value={edited.format_id ?? ""}
            onChange={(e) =>
              setEdited({ ...edited, format_id: e.target.value || null })
            }
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-base outline-none focus:border-[color:var(--accent)]"
          >
            <option value="">—</option>
            {sortedFormats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {edited.unknown_format && !edited.format_id && (
            <HelpBlank name={edited.unknown_format} />
          )}
        </Field>

        <Field label="Series">
          <select
            value={edited.series_id ?? ""}
            onChange={(e) =>
              setEdited({ ...edited, series_id: e.target.value || null })
            }
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-base outline-none focus:border-[color:var(--accent)]"
          >
            <option value="">—</option>
            {sortedSeries.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {edited.unknown_series && !edited.series_id && (
            <HelpBlank name={edited.unknown_series} />
          )}
        </Field>

        <Field label="Pain points">
          <div className="space-y-1.5">
            {sortedPainPoints.map((p) => {
              const checked = edited.pain_point_ids.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? edited.pain_point_ids.filter((x) => x !== p.id)
                        : [...edited.pain_point_ids, p.id];
                      setEdited({ ...edited, pain_point_ids: next });
                    }}
                    className="mt-1 accent-[color:var(--accent)]"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{p.name}</span>
                    {p.description && (
                      <span className="block text-xs text-[color:var(--muted)] mt-0.5">
                        {p.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {edited.unknown_pain_points.length > 0 && (
            <p className="mt-2 text-xs text-[color:var(--muted)]">
              Left blank because not on list:{" "}
              {edited.unknown_pain_points.join(", ")}
            </p>
          )}
        </Field>

        <Field label="Brain dump">
          <textarea
            value={edited.brain_dump}
            onChange={(e) =>
              setEdited({ ...edited, brain_dump: e.target.value })
            }
            rows={10}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)]"
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-[color:var(--accent-ink)] cursor-pointer"
          >
            Save idea
          </button>
          <Link
            href="/"
            className="rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm no-underline"
          >
            Cancel
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function HelpBlank({ name }: { name: string }) {
  return (
    <p className="mt-1 text-xs text-[color:var(--muted)]">
      Left blank because &ldquo;{name}&rdquo; isn&rsquo;t on your list. Add it
      in Settings if you want it.
    </p>
  );
}

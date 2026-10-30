"use client";

import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import { useIdeaBank } from "@/lib/store";
import { buildCapturePrompt } from "@/lib/capture-prompt";
import { downloadCsv, ideasToCsv } from "@/lib/csv";
import type { NamedOption } from "@/lib/types";

export default function SettingsPage() {
  const {
    ready,
    state,
    addOption,
    renameOption,
    removeOption,
    reorderOption,
    addPainPoint,
    updatePainPoint,
    removePainPoint,
    reorderPainPoint,
  } = useIdeaBank();

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

  const capturePrompt = useMemo(
    () => buildCapturePrompt(sortedFormats, sortedSeries, sortedPainPoints),
    [sortedFormats, sortedSeries, sortedPainPoints],
  );
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(capturePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const onExport = () => {
    const csv = ideasToCsv(
      state.ideas,
      sortedFormats,
      sortedSeries,
      sortedPainPoints,
    );
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`idea-bank-${date}.csv`, csv);
  };

  if (!ready) {
    return (
      <Shell>
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-8">
        <section>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            Status and Energy are fixed. Everything else is yours to edit.
          </p>
        </section>

        <OptionList
          title="Formats"
          items={sortedFormats}
          onAdd={(name) => addOption("formats", name)}
          onRename={(id, name) => renameOption("formats", id, name)}
          onRemove={(id) => removeOption("formats", id)}
          onReorder={(id, dir) => reorderOption("formats", id, dir)}
          countUsage={(id) =>
            state.ideas.filter((i) => i.format_id === id).length
          }
          helper="How it's filmed."
          itemKind="format"
        />

        <OptionList
          title="Series"
          items={sortedSeries}
          onAdd={(name) => addOption("series", name)}
          onRename={(id, name) => renameOption("series", id, name)}
          onRemove={(id) => removeOption("series", id)}
          onReorder={(id, dir) => reorderOption("series", id, dir)}
          countUsage={(id) =>
            state.ideas.filter((i) => i.series_id === id).length
          }
          helper="A recurring show or collection. Blank means standalone."
          itemKind="series"
        />

        <PainPointList
          items={sortedPainPoints}
          onAdd={(name, desc) => addPainPoint(name, desc)}
          onRename={(id, name, desc) =>
            updatePainPoint(id, { name, description: desc })
          }
          onRemove={removePainPoint}
          onReorder={reorderPainPoint}
          countUsage={(id) =>
            state.ideas.filter((i) => i.pain_point_ids.includes(id)).length
          }
        />

        <section>
          <h2 className="text-base font-semibold">Capture Prompt</h2>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            Send this as the last message of any AI brain dump. It updates
            automatically when your lists change.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-sm font-medium text-[color:var(--accent-ink)] cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-xs leading-relaxed">
            {capturePrompt}
          </pre>
        </section>

        <section>
          <h2 className="text-base font-semibold">Backup</h2>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            Download all your ideas as a spreadsheet, including brain dumps and
            chat links.
          </p>
          <button
            type="button"
            onClick={onExport}
            className="mt-2 rounded-lg border border-[color:var(--accent)] px-3 py-1.5 text-sm font-medium text-[color:var(--accent)] cursor-pointer"
          >
            Download all ideas (CSV)
          </button>
        </section>

        <section>
          <h2 className="text-base font-semibold">App icon</h2>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#2f5d3a" }}
              aria-label="Idea Bank icon"
            >
              <Lightbulb />
            </div>
            <p className="text-xs text-[color:var(--muted)] max-w-sm">
              Forest green with a white lightbulb. You can replace it later by
              dropping a new PNG into the <code>public/</code> folder.
            </p>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function OptionList({
  title,
  items,
  onAdd,
  onRename,
  onRemove,
  onReorder,
  countUsage,
  helper,
  itemKind,
}: {
  title: string;
  items: NamedOption[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => number;
  onReorder: (id: string, dir: -1 | 1) => void;
  countUsage: (id: string) => number;
  helper?: string;
  itemKind: string;
}) {
  const [adding, setAdding] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-base font-semibold">{title}</h2>
      {helper && (
        <p className="text-sm text-[color:var(--muted)] mt-1">{helper}</p>
      )}
      <ul className="mt-2 space-y-1.5">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1.5"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => onRename(item.id, e.target.value)}
              className="flex-1 bg-transparent px-1 py-1 text-sm outline-none"
              aria-label={`${itemKind} name`}
            />
            <button
              type="button"
              onClick={() => onReorder(item.id, -1)}
              disabled={idx === 0}
              aria-label="Move up"
              className="rounded px-2 py-1 text-xs text-[color:var(--muted)] disabled:opacity-30 cursor-pointer"
            >
              {"↑"}
            </button>
            <button
              type="button"
              onClick={() => onReorder(item.id, 1)}
              disabled={idx === items.length - 1}
              aria-label="Move down"
              className="rounded px-2 py-1 text-xs text-[color:var(--muted)] disabled:opacity-30 cursor-pointer"
            >
              {"↓"}
            </button>
            <button
              type="button"
              onClick={() => setPendingRemove(item.id)}
              aria-label="Remove"
              className="rounded px-2 py-1 text-xs text-[color:var(--danger)] cursor-pointer"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = adding.trim();
          if (!t) return;
          onAdd(t);
          setAdding("");
        }}
        className="mt-2 flex gap-2"
      >
        <input
          type="text"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder={`Add a ${itemKind}…`}
          className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="submit"
          disabled={!adding.trim()}
          className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-[color:var(--accent-ink)] disabled:opacity-40 cursor-pointer"
        >
          Add
        </button>
      </form>

      {pendingRemove && (
        <RemoveConfirm
          itemKind={itemKind}
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => {
            onRemove(pendingRemove);
            setPendingRemove(null);
          }}
          itemName={items.find((i) => i.id === pendingRemove)?.name ?? ""}
          count={countUsage(pendingRemove)}
        />
      )}
    </section>
  );
}

function PainPointList({
  items,
  onAdd,
  onRename,
  onRemove,
  onReorder,
  countUsage,
}: {
  items: { id: string; name: string; description: string; sort_order: number }[];
  onAdd: (name: string, description: string) => void;
  onRename: (id: string, name: string, description: string) => void;
  onRemove: (id: string) => number;
  onReorder: (id: string, dir: -1 | 1) => void;
  countUsage: (id: string) => number;
}) {
  const [addingName, setAddingName] = useState("");
  const [addingDesc, setAddingDesc] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-base font-semibold">Pain points</h2>
      <p className="text-sm text-[color:var(--muted)] mt-1">
        The problem the viewer has that this video helps with. Each has an
        optional one-line description shown when tagging.
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 space-y-1"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  onRename(item.id, e.target.value, item.description)
                }
                className="flex-1 bg-transparent px-1 py-1 text-sm font-medium outline-none"
                aria-label="Pain point name"
              />
              <button
                type="button"
                onClick={() => onReorder(item.id, -1)}
                disabled={idx === 0}
                aria-label="Move up"
                className="rounded px-2 py-1 text-xs text-[color:var(--muted)] disabled:opacity-30 cursor-pointer"
              >
                {"↑"}
              </button>
              <button
                type="button"
                onClick={() => onReorder(item.id, 1)}
                disabled={idx === items.length - 1}
                aria-label="Move down"
                className="rounded px-2 py-1 text-xs text-[color:var(--muted)] disabled:opacity-30 cursor-pointer"
              >
                {"↓"}
              </button>
              <button
                type="button"
                onClick={() => setPendingRemove(item.id)}
                aria-label="Remove"
                className="rounded px-2 py-1 text-xs text-[color:var(--danger)] cursor-pointer"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={item.description}
              onChange={(e) => onRename(item.id, item.name, e.target.value)}
              placeholder="One-line description (optional)"
              className="w-full bg-transparent px-1 py-1 text-xs text-[color:var(--muted)] outline-none"
              aria-label="Description"
            />
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = addingName.trim();
          if (!n) return;
          onAdd(n, addingDesc.trim());
          setAddingName("");
          setAddingDesc("");
        }}
        className="mt-3 space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-2"
      >
        <input
          type="text"
          value={addingName}
          onChange={(e) => setAddingName(e.target.value)}
          placeholder="Add a pain point…"
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
        />
        <input
          type="text"
          value={addingDesc}
          onChange={(e) => setAddingDesc(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="submit"
          disabled={!addingName.trim()}
          className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-[color:var(--accent-ink)] disabled:opacity-40 cursor-pointer"
        >
          Add
        </button>
      </form>

      {pendingRemove && (
        <RemoveConfirm
          itemKind="pain point"
          itemName={items.find((i) => i.id === pendingRemove)?.name ?? ""}
          count={countUsage(pendingRemove)}
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => {
            onRemove(pendingRemove);
            setPendingRemove(null);
          }}
        />
      )}
    </section>
  );
}

function RemoveConfirm({
  itemKind,
  itemName,
  count,
  onCancel,
  onConfirm,
}: {
  itemKind: string;
  itemName: string;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const usage =
    count === 0
      ? "No ideas use it."
      : count === 1
      ? "1 idea uses it — it will keep everything else and just lose this tag."
      : `${count} ideas use it — they will keep everything else and just lose this tag.`;
  return (
    <div className="mt-2 rounded-lg border border-[color:var(--danger)]/40 bg-[color:var(--surface-2)] p-3 space-y-2">
      <p className="text-sm">
        Remove {itemKind} <strong>{itemName}</strong>? {usage} Nothing is
        deleted.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-[color:var(--danger)] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Lightbulb() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.6 4.6 0 0 1 8.91 14" />
    </svg>
  );
}

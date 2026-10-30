"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Shell from "@/components/Shell";
import Hearts from "@/components/Hearts";
import { useIdeaBank } from "@/lib/store";
import { ENERGIES, STATUSES } from "@/lib/types";
import type { Energy, Status } from "@/lib/types";
import { parseCapture } from "@/lib/parse-capture";

export default function IdeaDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { ready, state, updateIdea, deleteIdea } = useIdeaBank();

  const idea = useMemo(
    () => state.ideas.find((i) => i.id === id),
    [state.ideas, id],
  );

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

  const [titleDraft, setTitleDraft] = useState(idea?.title ?? "");
  const [brainDraft, setBrainDraft] = useState(idea?.brain_dump ?? "");
  const [chatDraft, setChatDraft] = useState(idea?.chat_link ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pasteBoxOpen, setPasteBoxOpen] = useState(false);
  const [extraPaste, setExtraPaste] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const syncRef = useRef({ id, title: idea?.title, brain: idea?.brain_dump });
  useEffect(() => {
    if (!idea) return;
    if (syncRef.current.id !== idea.id) {
      setTitleDraft(idea.title);
      setBrainDraft(idea.brain_dump);
      setChatDraft(idea.chat_link);
      syncRef.current = {
        id: idea.id,
        title: idea.title,
        brain: idea.brain_dump,
      };
    }
  }, [idea]);

  const scheduleSave = (
    patch: Partial<{ title: string; brain_dump: string; chat_link: string }>,
  ) => {
    if (!idea) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateIdea(idea.id, patch);
      setSaveState("saved");
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setSaveState("idle"), 1500);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  if (!ready) {
    return (
      <Shell>
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  if (!idea) {
    return (
      <Shell>
        <p className="text-sm text-[color:var(--muted)]">
          Idea not found.{" "}
          <Link href="/" className="underline">
            Back to list
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const togglePainPoint = (ppId: string) => {
    const has = idea.pain_point_ids.includes(ppId);
    const next = has
      ? idea.pain_point_ids.filter((x) => x !== ppId)
      : [...idea.pain_point_ids, ppId];
    updateIdea(idea.id, { pain_point_ids: next });
  };

  const onPasteIntoIdea = () => {
    if (!extraPaste.trim()) return;
    const p = parseCapture(
      extraPaste,
      sortedFormats,
      sortedSeries,
      sortedPainPoints,
    );
    const divider = `\n\n---\nAdded ${new Date().toLocaleDateString()}\n`;
    const newBrain =
      (brainDraft.trim() ? brainDraft + divider : "") + p.brain_dump;
    setBrainDraft(newBrain);
    const patch: Partial<{
      brain_dump: string;
      format_id: string | null;
      series_id: string | null;
      pain_point_ids: string[];
    }> = { brain_dump: newBrain };
    if (!idea.format_id && p.format_id) patch.format_id = p.format_id;
    if (!idea.series_id && p.series_id) patch.series_id = p.series_id;
    if (idea.pain_point_ids.length === 0 && p.pain_point_ids.length) {
      patch.pain_point_ids = p.pain_point_ids;
    }
    updateIdea(idea.id, patch);
    setExtraPaste("");
    setPasteBoxOpen(false);
  };

  const onDelete = () => {
    deleteIdea(idea.id);
    router.push("/");
  };

  return (
    <Shell>
      <div className="space-y-5">
        <div>
          <Link
            href="/"
            className="text-sm text-[color:var(--muted)] no-underline"
          >
            {"←"} Back
          </Link>
          <div className="mt-2 flex items-center justify-between gap-3">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => {
                setTitleDraft(e.target.value);
                scheduleSave({ title: e.target.value });
              }}
              className="flex-1 bg-transparent text-xl font-semibold outline-none"
              aria-label="Title"
            />
            <SaveIndicator state={saveState} />
          </div>
        </div>

        <Row label="Status">
          <select
            value={idea.status}
            onChange={(e) =>
              updateIdea(idea.id, { status: e.target.value as Status })
            }
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Energy">
          <select
            value={idea.energy ?? ""}
            onChange={(e) =>
              updateIdea(idea.id, {
                energy: (e.target.value || null) as Energy | null,
              })
            }
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            <option value="">—</option>
            {ENERGIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Excitement">
          <Hearts
            value={idea.excitement}
            onChange={(v) => updateIdea(idea.id, { excitement: v })}
          />
        </Row>

        <Row label="Format">
          <select
            value={idea.format_id ?? ""}
            onChange={(e) =>
              updateIdea(idea.id, { format_id: e.target.value || null })
            }
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            <option value="">—</option>
            {sortedFormats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Series">
          <select
            value={idea.series_id ?? ""}
            onChange={(e) =>
              updateIdea(idea.id, { series_id: e.target.value || null })
            }
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            <option value="">—</option>
            {sortedSeries.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Row>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-[color:var(--muted)] uppercase tracking-wide">
            Pain points
          </label>
          <p className="mb-2 text-xs text-[color:var(--muted)]">
            The problem the viewer has that this video helps with.
          </p>
          <div className="space-y-1.5">
            {sortedPainPoints.map((p) => {
              const checked = idea.pain_point_ids.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePainPoint(p.id)}
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
        </div>

        <Row label="Chat link">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="url"
              value={chatDraft}
              onChange={(e) => {
                setChatDraft(e.target.value);
                scheduleSave({ chat_link: e.target.value });
              }}
              placeholder="https://chat.example.com/…"
              className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
            />
            {chatDraft.trim() && (
              <a
                href={chatDraft}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg border border-[color:var(--accent)] px-3 py-2 text-xs text-[color:var(--accent)] no-underline"
              >
                Open
              </a>
            )}
          </div>
        </Row>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[color:var(--muted)] uppercase tracking-wide">
              Brain dump
            </label>
            <button
              type="button"
              onClick={() => setPasteBoxOpen((v) => !v)}
              className="text-xs text-[color:var(--accent)] cursor-pointer"
            >
              {pasteBoxOpen ? "Cancel" : "Paste a capture into this idea"}
            </button>
          </div>
          {pasteBoxOpen && (
            <div className="mb-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 space-y-2">
              <textarea
                value={extraPaste}
                onChange={(e) => setExtraPaste(e.target.value)}
                rows={6}
                placeholder="Paste additional capture text here…"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)]"
              />
              <button
                type="button"
                onClick={onPasteIntoIdea}
                disabled={!extraPaste.trim()}
                className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--accent-ink)] disabled:opacity-40 cursor-pointer"
              >
                Append to brain dump
              </button>
            </div>
          )}
          <textarea
            value={brainDraft}
            onChange={(e) => {
              setBrainDraft(e.target.value);
              scheduleSave({ brain_dump: e.target.value });
            }}
            rows={14}
            placeholder="Paste the AI chat here, or type notes…"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)] whitespace-pre-wrap"
          />
        </div>

        <div className="pt-4 border-t border-[color:var(--border)] space-y-2">
          <h3 className="text-sm font-medium">Danger zone</h3>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-[color:var(--danger)] underline underline-offset-2 cursor-pointer"
            >
              Delete this idea…
            </button>
          ) : (
            <div className="rounded-lg border border-[color:var(--danger)]/40 bg-[color:var(--surface-2)] p-3 space-y-2">
              <p className="text-sm">
                Delete this idea, its brain dump, and its attachments? This
                can&rsquo;t be undone.
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                If you&rsquo;re not sure, change its status to{" "}
                <strong>Parked</strong> instead — it&rsquo;ll stay in your bank
                but out of the default view.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateIdea(idea.id, { status: "Parked" });
                    setShowDeleteConfirm(false);
                  }}
                  className="rounded-lg border border-[color:var(--accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--accent)] cursor-pointer"
                >
                  Park instead
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg bg-[color:var(--danger)] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-24 shrink-0 text-xs font-medium text-[color:var(--muted)] uppercase tracking-wide">
        {label}
      </label>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <span className="text-xs text-[color:var(--muted)]">
      {state === "saving" ? "Saving…" : "Saved"}
    </span>
  );
}

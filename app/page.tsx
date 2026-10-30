"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import IdeaCard from "@/components/IdeaCard";
import Filters from "@/components/Filters";
import { useIdeaBank } from "@/lib/store";
import { applyFilters, countActiveFilters, useFilters } from "@/lib/filters";
import { DEFAULT_FILTERS } from "@/lib/types";

export default function HomePage() {
  const { ready, state, createIdea, updateIdea } = useIdeaBank();
  const [filters, setFilters] = useFilters();
  const [title, setTitle] = useState("");

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

  const visible = useMemo(
    () => applyFilters(state.ideas, filters),
    [state.ideas, filters],
  );

  const activeCount = countActiveFilters(filters);

  const onQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    createIdea(t);
    setTitle("");
  };

  if (!ready) {
    return (
      <Shell>
        <p className="text-sm text-[color:var(--muted)]">Loading your ideas…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <form onSubmit={onQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add an idea…"
            aria-label="Quick add idea title"
            className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 text-base outline-none focus:border-[color:var(--accent)]"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="rounded-lg bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-[color:var(--accent-ink)] disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Link
            href="/capture"
            className="rounded-lg border border-[color:var(--accent)] px-3 py-2 text-sm font-medium text-[color:var(--accent)] no-underline"
          >
            Paste a capture
          </Link>
          <span className="text-xs text-[color:var(--muted)]">
            {state.ideas.length} total
          </span>
        </div>

        <input
          type="search"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search title or brain dump…"
          aria-label="Search"
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 text-base outline-none focus:border-[color:var(--accent)]"
        />

        <Filters
          value={filters}
          onChange={setFilters}
          formats={sortedFormats}
          series={sortedSeries}
          painPoints={sortedPainPoints}
          activeCount={activeCount}
        />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-sm text-[color:var(--muted)] underline underline-offset-2 cursor-pointer"
          >
            Clear filters
          </button>
        )}

        <section className="space-y-2">
          {visible.length === 0 && (
            <p className="text-sm text-[color:var(--muted)] py-6 text-center">
              No ideas match. Try clearing filters, or add one above.
            </p>
          )}
          {visible.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              formats={sortedFormats}
              series={sortedSeries}
              painPoints={sortedPainPoints}
              onStatusChange={(id, next) => updateIdea(id, { status: next })}
            />
          ))}
        </section>
      </div>
    </Shell>
  );
}

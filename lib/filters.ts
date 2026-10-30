"use client";

import { useEffect, useState } from "react";
import type { Filters, Idea } from "./types";
import { DEFAULT_FILTERS } from "./types";

const FKEY = "idea-bank:filters:v1";

export function useFilters(): [Filters, (f: Filters) => void] {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FKEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Filters>;
        // Hydrate from localStorage on mount — external-system sync.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters({ ...DEFAULT_FILTERS, ...parsed });
      }
    } catch {
      /* ignore */
    }
     
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(FKEY, JSON.stringify(filters));
    } catch {
      /* ignore */
    }
  }, [filters, mounted]);

  return [filters, setFilters];
}

export function countActiveFilters(f: Filters): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.statuses.length) n++;
  if (f.energies.length) n++;
  if (f.min_excitement !== null) n++;
  if (f.format_ids.length) n++;
  if (f.series_ids.length) n++;
  if (f.pain_point_ids.length) n++;
  if (f.brain_dump !== "any") n++;
  if (f.show_parked_completed) n++;
  return n;
}

export function applyFilters(ideas: Idea[], f: Filters): Idea[] {
  const q = f.search.trim().toLowerCase();
  let out = ideas.filter((i) => {
    // search over title + brain dump
    if (q) {
      const hay = `${i.title}\n${i.brain_dump}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // status
    if (f.statuses.length > 0) {
      if (!f.statuses.includes(i.status)) return false;
    } else if (!f.show_parked_completed) {
      if (i.status === "Parked" || i.status === "Completed") return false;
    }

    if (f.energies.length > 0 && (!i.energy || !f.energies.includes(i.energy)))
      return false;
    if (f.min_excitement !== null) {
      if ((i.excitement ?? 0) < f.min_excitement) return false;
    }
    if (f.format_ids.length > 0 && (!i.format_id || !f.format_ids.includes(i.format_id)))
      return false;
    if (f.series_ids.length > 0 && (!i.series_id || !f.series_ids.includes(i.series_id)))
      return false;
    if (f.pain_point_ids.length > 0) {
      const any = i.pain_point_ids.some((p) => f.pain_point_ids.includes(p));
      if (!any) return false;
    }
    if (f.brain_dump === "has" && !i.brain_dump.trim()) return false;
    if (f.brain_dump === "needs" && i.brain_dump.trim()) return false;

    return true;
  });

  const cmpUpdated = (a: Idea, b: Idea) =>
    b.updated_at.localeCompare(a.updated_at);

  if (f.sort === "excitement") {
    out = out.sort((a, b) => {
      const ea = a.excitement ?? -1;
      const eb = b.excitement ?? -1;
      if (eb !== ea) return eb - ea;
      return cmpUpdated(a, b);
    });
  } else if (f.sort === "newest") {
    out = out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else {
    out = out.sort(cmpUpdated);
  }

  return out;
}

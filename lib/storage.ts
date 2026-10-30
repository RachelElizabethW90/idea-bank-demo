"use client";

import type { IdeaBankState } from "./types";
import { createSeedState, SCHEMA_VERSION } from "./seed";

const KEY = "idea-bank:v1";

const nowIso = () => new Date().toISOString();

export function loadState(): IdeaBankState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seed = createSeedState(nowIso);
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as IdeaBankState;
    if (parsed.schema_version !== SCHEMA_VERSION) {
      return createSeedState(nowIso);
    }
    return parsed;
  } catch {
    return createSeedState(nowIso);
  }
}

export function saveState(state: IdeaBankState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or disabled; swallow for M1
  }
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const t = Date.now().toString(36);
  return `${prefix}-${t}-${rand}`;
}

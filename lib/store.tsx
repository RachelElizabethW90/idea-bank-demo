"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Idea,
  IdeaBankState,
  NamedOption,
  PainPoint,
  Status,
} from "./types";
import { loadState, newId, saveState } from "./storage";
import { createSeedState } from "./seed";

type Patch = Partial<Omit<Idea, "id" | "created_at">>;

type Ctx = {
  ready: boolean;
  state: IdeaBankState;
  // ideas
  createIdea(title: string): Idea;
  updateIdea(id: string, patch: Patch): void;
  deleteIdea(id: string): void;
  getIdea(id: string): Idea | undefined;
  // lists
  addOption(kind: "formats" | "series", name: string): NamedOption;
  renameOption(kind: "formats" | "series", id: string, name: string): void;
  removeOption(kind: "formats" | "series", id: string): number;
  reorderOption(kind: "formats" | "series", id: string, dir: -1 | 1): void;
  addPainPoint(name: string, description: string): PainPoint;
  updatePainPoint(id: string, patch: Partial<Omit<PainPoint, "id">>): void;
  removePainPoint(id: string): number;
  reorderPainPoint(id: string, dir: -1 | 1): void;
};

const IdeaBankContext = createContext<Ctx | null>(null);

export function IdeaBankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IdeaBankState>(() => createSeedState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount — external-system sync, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
     
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const nowIso = () => new Date().toISOString();

  const createIdea = useCallback<Ctx["createIdea"]>((title) => {
    const t = nowIso();
    const idea: Idea = {
      id: newId("idea"),
      title: title.trim(),
      status: "Raw",
      energy: null,
      excitement: null,
      format_id: null,
      series_id: null,
      pain_point_ids: [],
      brain_dump: "",
      chat_link: "",
      created_at: t,
      updated_at: t,
    };
    setState((s) => ({ ...s, ideas: [idea, ...s.ideas] }));
    return idea;
  }, []);

  const updateIdea = useCallback<Ctx["updateIdea"]>((id, patch) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.map((i) =>
        i.id === id ? { ...i, ...patch, updated_at: nowIso() } : i,
      ),
    }));
  }, []);

  const deleteIdea = useCallback<Ctx["deleteIdea"]>((id) => {
    setState((s) => ({
      ...s,
      ideas: s.ideas.filter((i) => i.id !== id),
      attachments: s.attachments.filter((a) => a.idea_id !== id),
    }));
  }, []);

  const getIdea = useCallback<Ctx["getIdea"]>(
    (id) => state.ideas.find((i) => i.id === id),
    [state.ideas],
  );

  const addOption = useCallback<Ctx["addOption"]>((kind, name) => {
    const trimmed = name.trim();
    const opt: NamedOption = {
      id: newId(kind === "formats" ? "fmt" : "ser"),
      name: trimmed,
      sort_order: 0,
    };
    setState((s) => {
      const list = s[kind];
      const next: NamedOption[] = [
        ...list,
        { ...opt, sort_order: list.length },
      ];
      return { ...s, [kind]: next };
    });
    return opt;
  }, []);

  const renameOption = useCallback<Ctx["renameOption"]>((kind, id, name) => {
    const trimmed = name.trim();
    setState((s) => ({
      ...s,
      [kind]: s[kind].map((o) => (o.id === id ? { ...o, name: trimmed } : o)),
    }));
  }, []);

  const removeOption = useCallback<Ctx["removeOption"]>((kind, id) => {
    let count = 0;
    setState((s) => {
      const field = kind === "formats" ? "format_id" : "series_id";
      count = s.ideas.filter((i) => i[field] === id).length;
      return {
        ...s,
        [kind]: s[kind].filter((o) => o.id !== id),
        ideas: s.ideas.map((i) =>
          i[field] === id ? { ...i, [field]: null, updated_at: nowIso() } : i,
        ),
      };
    });
    return count;
  }, []);

  const reorderOption = useCallback<Ctx["reorderOption"]>((kind, id, dir) => {
    setState((s) => {
      const list = [...s[kind]].sort((a, b) => a.sort_order - b.sort_order);
      const idx = list.findIndex((o) => o.id === id);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= list.length) return s;
      const [item] = list.splice(idx, 1);
      list.splice(newIdx, 0, item);
      return {
        ...s,
        [kind]: list.map((o, i) => ({ ...o, sort_order: i })),
      };
    });
  }, []);

  const addPainPoint = useCallback<Ctx["addPainPoint"]>((name, description) => {
    const pp: PainPoint = {
      id: newId("pp"),
      name: name.trim(),
      description: description.trim(),
      sort_order: 0,
    };
    setState((s) => ({
      ...s,
      pain_points: [
        ...s.pain_points,
        { ...pp, sort_order: s.pain_points.length },
      ],
    }));
    return pp;
  }, []);

  const updatePainPoint = useCallback<Ctx["updatePainPoint"]>((id, patch) => {
    setState((s) => ({
      ...s,
      pain_points: s.pain_points.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }));
  }, []);

  const removePainPoint = useCallback<Ctx["removePainPoint"]>((id) => {
    let count = 0;
    setState((s) => {
      count = s.ideas.filter((i) => i.pain_point_ids.includes(id)).length;
      return {
        ...s,
        pain_points: s.pain_points.filter((p) => p.id !== id),
        ideas: s.ideas.map((i) =>
          i.pain_point_ids.includes(id)
            ? {
                ...i,
                pain_point_ids: i.pain_point_ids.filter((p) => p !== id),
                updated_at: nowIso(),
              }
            : i,
        ),
      };
    });
    return count;
  }, []);

  const reorderPainPoint = useCallback<Ctx["reorderPainPoint"]>((id, dir) => {
    setState((s) => {
      const list = [...s.pain_points].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const idx = list.findIndex((o) => o.id === id);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= list.length) return s;
      const [item] = list.splice(idx, 1);
      list.splice(newIdx, 0, item);
      return {
        ...s,
        pain_points: list.map((o, i) => ({ ...o, sort_order: i })),
      };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      state,
      createIdea,
      updateIdea,
      deleteIdea,
      getIdea,
      addOption,
      renameOption,
      removeOption,
      reorderOption,
      addPainPoint,
      updatePainPoint,
      removePainPoint,
      reorderPainPoint,
    }),
    [
      ready,
      state,
      createIdea,
      updateIdea,
      deleteIdea,
      getIdea,
      addOption,
      renameOption,
      removeOption,
      reorderOption,
      addPainPoint,
      updatePainPoint,
      removePainPoint,
      reorderPainPoint,
    ],
  );

  return (
    <IdeaBankContext.Provider value={value}>
      {children}
    </IdeaBankContext.Provider>
  );
}

export function useIdeaBank(): Ctx {
  const ctx = useContext(IdeaBankContext);
  if (!ctx) throw new Error("useIdeaBank must be used inside IdeaBankProvider");
  return ctx;
}

export function statusCycle(s: Status): Status {
  const order: Status[] = [
    "Raw",
    "Worth Developing",
    "In Progress",
    "Completed",
    "Parked",
  ];
  const i = order.indexOf(s);
  return order[(i + 1) % order.length];
}

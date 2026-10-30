import type { NamedOption, PainPoint } from "./types";

export type ParsedCapture = {
  title: string;
  format_id: string | null;
  series_id: string | null;
  pain_point_ids: string[];
  brain_dump: string;
  unknown_format: string | null;
  unknown_series: string | null;
  unknown_pain_points: string[];
};

const LABEL_RE = /^\s*(?:#{1,6}\s*)?(?:\*{1,3})?\s*(IDEA|FORMAT|SERIES|PAIN POINTS?)\s*(?:\*{1,3})?\s*:\s*(.*)$/i;

export function parseCapture(
  text: string,
  formats: NamedOption[],
  series: NamedOption[],
  painPoints: PainPoint[],
): ParsedCapture {
  const result: ParsedCapture = {
    title: "",
    format_id: null,
    series_id: null,
    pain_point_ids: [],
    brain_dump: text,
    unknown_format: null,
    unknown_series: null,
    unknown_pain_points: [],
  };

  const lines = text.split(/\r?\n/);
  let sawAnyLabel = false;

  for (const line of lines) {
    const m = line.match(LABEL_RE);
    if (!m) continue;
    const raw = m[1].toUpperCase();
    const label =
      raw === "PAIN POINTS" || raw === "PAIN POINT" ? "PAIN_POINTS" : raw;
    const value = stripInlineMarks(m[2]).trim();
    sawAnyLabel = true;

    if (label === "IDEA") {
      if (value) result.title = value;
    } else if (!value) {
      continue; // blank value for non-IDEA label: skip quietly
    } else if (label === "FORMAT") {
      const match = findByName(formats, value);
      if (match) result.format_id = match.id;
      else result.unknown_format = value;
    } else if (label === "SERIES") {
      const match = findByName(series, value);
      if (match) result.series_id = match.id;
      else result.unknown_series = value;
    } else if (label === "PAIN_POINTS") {
      const parts = value
        .split(";")
        .map((p) => stripInlineMarks(p).trim())
        .filter(Boolean);
      for (const p of parts) {
        const match = findByName(painPoints, p);
        if (match) {
          if (!result.pain_point_ids.includes(match.id)) {
            result.pain_point_ids.push(match.id);
          }
        } else {
          result.unknown_pain_points.push(p);
        }
      }
    }
  }

  if (!sawAnyLabel) {
    const firstLine = lines.find((l) => l.trim().length > 0);
    if (firstLine) result.title = firstLine.trim();
  }

  return result;
}

function findByName<T extends { name: string }>(items: T[], value: string): T | null {
  const needle = value.toLowerCase().trim();
  for (const item of items) {
    if (item.name.toLowerCase() === needle) return item;
  }
  return null;
}

function stripInlineMarks(s: string): string {
  // remove bold/italic markers that AIs put around values: **x**, *x*, _x_
  return s
    .replace(/^\s*\*{1,3}\s*/g, "")
    .replace(/\s*\*{1,3}\s*$/g, "")
    .replace(/^\s*_+\s*/g, "")
    .replace(/\s*_+\s*$/g, "")
    .trim();
}

import type { Idea, NamedOption, PainPoint } from "./types";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ideasToCsv(
  ideas: Idea[],
  formats: NamedOption[],
  series: NamedOption[],
  painPoints: PainPoint[],
): string {
  const fById = new Map(formats.map((f) => [f.id, f.name]));
  const sById = new Map(series.map((s) => [s.id, s.name]));
  const pById = new Map(painPoints.map((p) => [p.id, p.name]));

  const header = [
    "Title",
    "Status",
    "Energy",
    "Excitement",
    "Format",
    "Series",
    "Pain points",
    "Brain dump",
    "Chat link",
    "Created at",
    "Updated at",
  ];

  const rows = ideas.map((i) => [
    i.title,
    i.status,
    i.energy ?? "",
    i.excitement ?? "",
    i.format_id ? fById.get(i.format_id) ?? "" : "",
    i.series_id ? sById.get(i.series_id) ?? "" : "",
    i.pain_point_ids
      .map((p) => pById.get(p))
      .filter(Boolean)
      .join("; "),
    i.brain_dump,
    i.chat_link,
    i.created_at,
    i.updated_at,
  ]);

  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

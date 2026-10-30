export const STATUSES = [
  "Raw",
  "Worth Developing",
  "In Progress",
  "Completed",
  "Parked",
] as const;
export type Status = (typeof STATUSES)[number];

export const ENERGIES = ["Quick Win", "Medium Lift", "Big Project"] as const;
export type Energy = (typeof ENERGIES)[number];

export type SortMode = "excitement" | "newest" | "updated";

export type Idea = {
  id: string;
  title: string;
  status: Status;
  energy: Energy | null;
  excitement: number | null;
  format_id: string | null;
  series_id: string | null;
  pain_point_ids: string[];
  brain_dump: string;
  chat_link: string;
  created_at: string;
  updated_at: string;
};

export type NamedOption = {
  id: string;
  name: string;
  sort_order: number;
};

export type PainPoint = NamedOption & {
  description: string;
};

export type Attachment = {
  id: string;
  idea_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  size: number;
  text_extracted: boolean;
  created_at: string;
};

export type IdeaBankState = {
  ideas: Idea[];
  formats: NamedOption[];
  series: NamedOption[];
  pain_points: PainPoint[];
  attachments: Attachment[];
  schema_version: number;
};

export type Filters = {
  search: string;
  statuses: Status[];
  energies: Energy[];
  min_excitement: number | null;
  format_ids: string[];
  series_ids: string[];
  pain_point_ids: string[];
  brain_dump: "any" | "has" | "needs";
  sort: SortMode;
  show_parked_completed: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  search: "",
  statuses: [],
  energies: [],
  min_excitement: null,
  format_ids: [],
  series_ids: [],
  pain_point_ids: [],
  brain_dump: "any",
  sort: "excitement",
  show_parked_completed: false,
};

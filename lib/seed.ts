import type { IdeaBankState, Idea, NamedOption, PainPoint } from "./types";

// Static placeholder timestamp used only for the SSR prerender; the client
// replaces it with Date.now() inside loadState on first mount.
const PLACEHOLDER_TS = "1970-01-01T00:00:00.000Z";

export const SCHEMA_VERSION = 1;

export function createSeedState(nowIsoFn?: () => string): IdeaBankState {
  const t = nowIsoFn ? nowIsoFn() : PLACEHOLDER_TS;
  const formats: NamedOption[] = [
    { id: "fmt-talking-head", name: "Talking Head", sort_order: 0 },
    { id: "fmt-vlog", name: "Vlog", sort_order: 1 },
    { id: "fmt-short", name: "Short", sort_order: 2 },
  ];

  const series: NamedOption[] = [
    { id: "ser-weeknight-wins", name: "Weeknight Wins", sort_order: 0 },
    { id: "ser-pantry-basics", name: "Pantry Basics", sort_order: 1 },
    { id: "ser-seasonal-kitchen", name: "Seasonal Kitchen", sort_order: 2 },
    { id: "ser-behind-the-stove", name: "Behind the Stove", sort_order: 3 },
  ];

  const painPoints: PainPoint[] = [
    {
      id: "pp-hard-to-start",
      name: "Hard to start",
      description: "stares at a blank page, can't pick the first idea",
      sort_order: 0,
    },
    {
      id: "pp-ideas-disappear",
      name: "Ideas disappear",
      description:
        "saves ideas in random notes and never finds them again",
      sort_order: 1,
    },
    {
      id: "pp-tool-overwhelm",
      name: "Overwhelmed by tools",
      description: "too many apps, nothing sticks",
      sort_order: 2,
    },
    {
      id: "pp-inconsistent",
      name: "Inconsistent output",
      description: "posts in bursts, then goes quiet for weeks",
      sort_order: 3,
    },
    {
      id: "pp-perfectionism",
      name: "Perfectionism blocks posting",
      description: "edits forever, nothing ships",
      sort_order: 4,
    },
    {
      id: "pp-fun",
      name: "None (just for fun)",
      description: "no specific problem, just enjoyable",
      sort_order: 5,
    },
  ];

  const idea = (overrides: Partial<Idea> & { id: string; title: string }): Idea => ({
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
    ...overrides,
  });

  const ideas: Idea[] = [
    idea({
      id: "starter-1",
      title: "10 pantry staples that make every weeknight easier",
      status: "Worth Developing",
      energy: "Quick Win",
      excitement: 4,
      format_id: "fmt-talking-head",
      series_id: "ser-pantry-basics",
      pain_point_ids: ["pp-hard-to-start"],
      brain_dump:
        `IDEA: 10 pantry staples that make every weeknight easier\n` +
        `SUMMARY: A simple list video for people who open the cupboard and feel stuck.\n` +
        `KEY POINTS: canned beans, rice, chili crisp, frozen peas, good stock cubes. Each one gets a 'turns into' example.\n` +
        `ROUGH OUTLINE: 1. Why a pantry beats a meal plan 2. The 10 staples 3. One dinner using five of them\n` +
        `OPEN QUESTIONS: Film at the shelf or at the counter?`,
    }),
    idea({
      id: "starter-2",
      title: "One sheet-pan dinner, three ways",
      status: "In Progress",
      energy: "Medium Lift",
      excitement: 5,
      format_id: "fmt-vlog",
      series_id: "ser-weeknight-wins",
      pain_point_ids: ["pp-tool-overwhelm", "pp-inconsistent"],
      brain_dump:
        "Same base (chicken thighs, potatoes, onions), three flavor swaps: lemon herb, gochujang, smoky paprika. Show the shopping list once. Ends with which one my family picked.",
    }),
    idea({
      id: "starter-3",
      title: "How to keep fresh herbs alive for two weeks",
      status: "Raw",
      energy: "Quick Win",
      excitement: 3,
      format_id: "fmt-short",
      series_id: "ser-pantry-basics",
    }),
    idea({
      id: "starter-4",
      title: "What I cook when I really don't feel like cooking",
      status: "Raw",
      energy: "Medium Lift",
      excitement: 4,
      format_id: "fmt-talking-head",
      series_id: "ser-behind-the-stove",
      pain_point_ids: ["pp-perfectionism"],
    }),
    idea({
      id: "starter-5",
      title: "A fall soup rotation for the whole month",
      status: "Parked",
      energy: "Big Project",
      excitement: 2,
      format_id: "fmt-vlog",
      series_id: "ser-seasonal-kitchen",
      pain_point_ids: ["pp-fun"],
    }),
  ];

  return {
    ideas,
    formats,
    series,
    pain_points: painPoints,
    attachments: [],
    schema_version: SCHEMA_VERSION,
  };
}

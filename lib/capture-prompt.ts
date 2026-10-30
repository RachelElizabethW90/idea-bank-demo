import type { NamedOption, PainPoint } from "./types";

export function buildCapturePrompt(
  formats: NamedOption[],
  series: NamedOption[],
  painPoints: PainPoint[],
): string {
  const formatList = formats
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((f) => f.name)
    .join(", ");

  const seriesList = series
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => s.name)
    .join(", ");

  const painLines = painPoints
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) =>
      p.description ? `- ${p.name} = ${p.description}` : `- ${p.name}`,
    )
    .join("\n");

  return `Wrap up this brain dump for a content idea bank.

Rules:
- Cover everything I said in this chat. Don't drop details, examples, or stories.
- Keep my wording wherever you can. Don't add ideas, opinions, or examples I didn't give.
- If something wasn't discussed, leave that line blank. Don't guess.
- Use exactly the format below, with the labels in capital letters.

IDEA: [short, plain title for the idea]
FORMAT: [one of: ${formatList}]
SERIES: [one of: ${seriesList}, or blank if standalone]
PAIN POINTS: [one or more names from this list, separated by semicolons. Pick the problem the viewer has that this video helps with:
${painLines}]

SUMMARY:
[What this video is about and why, in a few sentences, from what I said]

KEY POINTS, STORIES, AND EXAMPLES I MENTIONED:
- [bullet list, my words]

ROUGH OUTLINE:
1. [section]
2. [section]

RESEARCH OR GAPS WE FOUND:
- [anything we looked up or flagged as missing]

OPEN QUESTIONS:
- [things I still need to decide]

After that, also give me the same content as a downloadable Word document named with today's date and the idea title.`;
}

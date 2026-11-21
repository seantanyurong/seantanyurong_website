/*
  Turns rows from the Notion "Side Quests DB" into the site's sidequests.
  No imports so the Node test runner can load this file directly.

  Columns read: Name (title), Status (select), Quarter (multi-select),
  Public (checkbox — only ticked rows are shown).
*/

export type Sidequest = {
  slug: string;
  title: string;
  // e.g. "Done - 2025 Q3", "In Progress - 2026 Q4", "In the future"
  description: string;
};

const STATUS_LABEL: Record<string, string> = {
  Completed: "Done",
  "In Progress": "In Progress",
};

export function parseSidequests(pages: unknown[]): Sidequest[] {
  const items: Sidequest[] = [];
  for (const page of pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = page as any;
    const props = p?.properties;
    if (!props?.Public?.checkbox) continue;

    const title = ((props.Name?.title ?? []) as { plain_text?: string }[])
      .map((t) => t.plain_text ?? "")
      .join("")
      .trim();
    if (!title) continue;

    const label = STATUS_LABEL[props.Status?.select?.name];
    const quarters = ((props.Quarter?.multi_select ?? []) as { name?: string }[])
      .map((q) => q.name ?? "")
      .filter(Boolean)
      .sort();
    const latest = quarters.at(-1);

    items.push({
      slug: String(p.id),
      title,
      description: label
        ? latest
          ? `${label} - ${latest}`
          : label
        : "In the future",
    });
  }
  return items;
}

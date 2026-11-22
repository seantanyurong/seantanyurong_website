/*
  Turns rows from the Notion "Side Quests DB" into the site's sidequests.
  No imports so the Node test runner can load this file directly.

  Columns read: Name (title), Status (select), Quarter (multi-select),
  Public (checkbox — only ticked rows are shown).
*/

export type SidequestStatus = "now" | "done" | "someday";

export type Sidequest = {
  slug: string;
  title: string;
  // e.g. "Done - 2025 Q3", "In Progress - 2026 Q4", "In the future"
  description: string;
  status: SidequestStatus;
  quarter: string | null; // latest quarter, only for now/done
};

const STATUS: Record<string, { label: string; status: SidequestStatus }> = {
  Completed: { label: "Done", status: "done" },
  "In Progress": { label: "In Progress", status: "now" },
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

    const known = STATUS[props.Status?.select?.name];
    const quarters = ((props.Quarter?.multi_select ?? []) as { name?: string }[])
      .map((q) => q.name ?? "")
      .filter(Boolean)
      .sort();
    const latest = known ? (quarters.at(-1) ?? null) : null;

    items.push({
      slug: String(p.id),
      title,
      description: known
        ? latest
          ? `${known.label} - ${latest}`
          : known.label
        : "In the future",
      status: known?.status ?? "someday",
      quarter: latest,
    });
  }
  return items;
}

export function groupSidequests(items: Sidequest[]) {
  return {
    now: items.filter((s) => s.status === "now"),
    done: items.filter((s) => s.status === "done"),
    someday: items.filter((s) => s.status === "someday"),
  };
}

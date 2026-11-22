/*
  Turns rows from the Notion "Gear" database into the Gear section's rows.
  No imports so the Node test runner can load this file directly.

  Columns read: Name (title), Category (select), Note (text), Link (url),
  Image (url), Order (number), Public (checkbox — only ticked rows are shown).
*/

export type GearItem = {
  slug: string;
  name: string;
  category: string; // a Category option from Notion (e.g. EDC, Desk)
  note: string | null;
  link: string | null;
  image: string | null;
  order: number | null;
};

// A simple same-site path like "/gear/photo.jpg" — no "//host" or "..".
const sitePath = (v: unknown) =>
  typeof v === "string" && /^\/[\w\-./]+$/.test(v) && !v.startsWith("//") && !v.includes("..")
    ? v
    : null;

const text = (parts: unknown): string =>
  ((parts ?? []) as { plain_text?: string }[])
    .map((t) => t.plain_text ?? "")
    .join("")
    .trim();

export function parseGear(pages: unknown[]): GearItem[] {
  const items: GearItem[] = [];
  for (const page of pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = page as any;
    const props = p?.properties;
    if (!props?.Public?.checkbox) continue;

    const name = text(props.Name?.title);
    const category: unknown = props.Category?.select?.name;
    if (!name || typeof category !== "string" || !category) continue;

    const webUrl = (v: unknown) =>
      typeof v === "string" && /^https?:\/\//i.test(v) ? v : null;
    const order: unknown = props.Order?.number;
    items.push({
      slug: String(p.id),
      name,
      category,
      note: text(props.Note?.rich_text) || null,
      // Only real web links — never javascript:, data: or other schemes.
      link: webUrl(props.Link?.url),
      // Images may also be files in /public (e.g. "/gear/custom-keyboard.jpg").
      image: webUrl(props.Image?.url) ?? sitePath(props.Image?.url),
      order: typeof order === "number" ? order : null,
    });
  }
  return items;
}

/*
  Groups items by category in the order the options are arranged in Notion
  (`categoryOrder`), so renaming or reordering a category there just works.
  Categories missing from that list go last, alphabetically.
*/
export function groupGear(items: GearItem[], categoryOrder: string[] = []) {
  const byOrder = (a: GearItem, b: GearItem) => {
    if (a.order !== b.order) {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    }
    return a.name.localeCompare(b.name);
  };
  const present = [...new Set(items.map((i) => i.category))];
  const rank = (c: string) => {
    const i = categoryOrder.indexOf(c);
    return i === -1 ? Infinity : i;
  };
  present.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return present.map((category) => ({
    category,
    items: items.filter((i) => i.category === category).sort(byOrder),
  }));
}

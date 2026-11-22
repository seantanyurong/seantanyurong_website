/*
  Turns rows from the Notion "Gear" database into the /gear page's lists.
  No imports so the Node test runner can load this file directly.

  Columns read: Name (title), Category (select), Note (text), Link (url),
  Image (url), Order (number), Public (checkbox — only ticked rows are shown).
*/

export const GEAR_CATEGORIES = ["EDC", "Setup", "Travel", "Motorcycle"] as const;
export type GearCategory = (typeof GEAR_CATEGORIES)[number];

export type GearItem = {
  slug: string;
  name: string;
  category: GearCategory;
  note: string | null;
  link: string | null;
  image: string | null;
  order: number | null;
};

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
    const category = props.Category?.select?.name;
    if (!name || !GEAR_CATEGORIES.includes(category)) continue;

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
      image: webUrl(props.Image?.url),
      order: typeof order === "number" ? order : null,
    });
  }
  return items;
}

export function groupGear(items: GearItem[]) {
  const byOrder = (a: GearItem, b: GearItem) => {
    if (a.order !== b.order) {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    }
    return a.name.localeCompare(b.name);
  };
  return GEAR_CATEGORIES.map((category) => ({
    category,
    items: items.filter((i) => i.category === category).sort(byOrder),
  })).filter((g) => g.items.length > 0);
}

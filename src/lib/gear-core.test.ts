import { test } from "node:test";
import assert from "node:assert/strict";
import { groupGear, parseGear } from "./gear-core.ts";

function row(
  id: string,
  name: string,
  category: string | null,
  opts: { note?: string; link?: string; order?: number; isPublic?: boolean } = {},
) {
  return {
    id,
    properties: {
      Name: { type: "title", title: [{ plain_text: name }] },
      Category: { type: "select", select: category ? { name: category } : null },
      Note: { type: "rich_text", rich_text: opts.note ? [{ plain_text: opts.note }] : [] },
      Link: { type: "url", url: opts.link ?? null },
      Order: { type: "number", number: opts.order ?? null },
      Public: { type: "checkbox", checkbox: opts.isPublic ?? true },
    },
  };
}

test("parses public rows with note and link", () => {
  const [item] = parseGear([
    row("a", "Leatherman Arc", "EDC", { note: "Daily multitool", link: "https://example.com" }),
  ]);
  assert.deepEqual(item, {
    slug: "a",
    name: "Leatherman Arc",
    category: "EDC",
    note: "Daily multitool",
    link: "https://example.com",
    order: null,
  });
});

test("skips private, untitled, uncategorised and malformed rows", () => {
  const items = parseGear([
    row("a", "Hidden", "EDC", { isPublic: false }),
    row("b", "  ", "EDC"),
    row("c", "No category", null),
    row("d", "Unknown category", "Kitchen"),
    null,
    {},
  ]);
  assert.deepEqual(items, []);
});

test("groups in EDC, Setup, Travel, Motorcycle order and drops empty groups", () => {
  const groups = groupGear(
    parseGear([
      row("m", "Helmet", "Motorcycle"),
      row("s", "Keyboard", "Setup"),
      row("e", "Knife", "EDC"),
    ]),
  );
  assert.deepEqual(groups.map((g) => g.category), ["EDC", "Setup", "Motorcycle"]);
});

test("sorts within a category by Order, then name; unordered items last", () => {
  const [group] = groupGear(
    parseGear([
      row("1", "Zeta", "Setup"),
      row("2", "Beta", "Setup", { order: 2 }),
      row("3", "Alpha", "Setup"),
      row("4", "Gamma", "Setup", { order: 1 }),
    ]),
  );
  assert.deepEqual(group.items.map((i) => i.name), ["Gamma", "Beta", "Alpha", "Zeta"]);
});

test("only http(s) links are kept", () => {
  const [item] = parseGear([row("a", "Thing", "EDC", { link: "javascript:alert(1)" })]);
  assert.equal(item.link, null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { groupGear, parseGear } from "./gear-core.ts";

function row(
  id: string,
  name: string,
  category: string | null,
  opts: { note?: string; link?: string; image?: string; order?: number; isPublic?: boolean } = {},
) {
  return {
    id,
    properties: {
      Name: { type: "title", title: [{ plain_text: name }] },
      Category: { type: "select", select: category ? { name: category } : null },
      Note: { type: "rich_text", rich_text: opts.note ? [{ plain_text: opts.note }] : [] },
      Link: { type: "url", url: opts.link ?? null },
      Image: { type: "url", url: opts.image ?? null },
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
    image: null,
    order: null,
  });
});

test("skips private, untitled, uncategorised and malformed rows", () => {
  const items = parseGear([
    row("a", "Hidden", "EDC", { isPublic: false }),
    row("b", "  ", "EDC"),
    row("c", "No category", null),
    null,
    {},
  ]);
  assert.deepEqual(items, []);
});

test("accepts any category name from Notion", () => {
  const [item] = parseGear([row("a", "Racquet", "Tennis")]);
  assert.equal(item.category, "Tennis");
});

test("groups in Notion's option order, drops empty groups, unknowns last", () => {
  const groups = groupGear(
    parseGear([
      row("t", "Racquet", "Tennis"),
      row("m", "Helmet", "Motorcycle"),
      row("d", "Keyboard", "Desk"),
      row("e", "Knife", "EDC"),
      row("z", "Mystery", "Zzz"),
    ]),
    ["EDC", "Desk", "Travel", "Motorcycle", "Tennis"],
  );
  assert.deepEqual(groups.map((g) => g.category), ["EDC", "Desk", "Motorcycle", "Tennis", "Zzz"]);
});

test("sorts within a category by Order, then name; unordered items last", () => {
  const [group] = groupGear(
    parseGear([
      row("1", "Zeta", "Desk"),
      row("2", "Beta", "Desk", { order: 2 }),
      row("3", "Alpha", "Desk"),
      row("4", "Gamma", "Desk", { order: 1 }),
    ]),
    ["Desk"],
  );
  assert.deepEqual(group.items.map((i) => i.name), ["Gamma", "Beta", "Alpha", "Zeta"]);
});

test("only http(s) links are kept", () => {
  const [item] = parseGear([row("a", "Thing", "EDC", { link: "javascript:alert(1)" })]);
  assert.equal(item.link, null);
});

test("reads an http(s) image link and ignores anything else", () => {
  const [ok, bad] = parseGear([
    row("a", "Pack", "EDC", { image: "https://cdn.example.com/pack.jpg" }),
    row("b", "Watch", "EDC", { image: "data:image/png;base64,AAAA" }),
  ]);
  assert.equal(ok.image, "https://cdn.example.com/pack.jpg");
  assert.equal(bad.image, null);
});

test("accepts a site path for the image, but not protocol-relative or odd paths", () => {
  const [local, protoRel, traversal] = parseGear([
    row("a", "Keyboard", "Desk", { image: "/gear/custom-keyboard.jpg" }),
    row("b", "Sneaky", "Desk", { image: "//evil.example.com/x.jpg" }),
    row("c", "Odd", "Desk", { image: "/gear/../secret.jpg" }),
  ]);
  assert.equal(local.image, "/gear/custom-keyboard.jpg");
  assert.equal(protoRel.image, null);
  assert.equal(traversal.image, null);
});

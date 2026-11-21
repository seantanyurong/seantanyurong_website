import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSidequests } from "./sidequests-core.ts";

function row(
  id: string,
  name: string,
  status: string | null,
  quarters: string[] = [],
  isPublic = true,
) {
  return {
    id,
    properties: {
      Name: { type: "title", title: [{ plain_text: name }] },
      Status: { type: "select", select: status ? { name: status } : null },
      Quarter: { type: "multi_select", multi_select: quarters.map((name) => ({ name })) },
      Public: { type: "checkbox", checkbox: isPublic },
    },
  };
}

test("maps Notion status and quarter to the site's description", () => {
  const items = parseSidequests([
    row("a", "Set up a smart room", "Completed", ["2025 Q3"]),
    row("b", "Reach Diamond in Brawlhalla", "In Progress", ["2026 Q4"]),
    row("c", "Learn thai", "Incomplete"),
  ]);
  assert.deepEqual(
    items.map((s) => [s.slug, s.title, s.description]),
    [
      ["a", "Set up a smart room", "Done - 2025 Q3"],
      ["b", "Reach Diamond in Brawlhalla", "In Progress - 2026 Q4"],
      ["c", "Learn thai", "In the future"],
    ],
  );
});

test("uses the latest quarter when several are set", () => {
  const [s] = parseSidequests([row("a", "Learn malay", "In Progress", ["2026 Q4", "2025 Q1", "2026 Q2"])]);
  assert.equal(s.description, "In Progress - 2026 Q4");
});

test("an in-progress or done quest without a quarter still reads sensibly", () => {
  const items = parseSidequests([
    row("a", "Fish tank", "In Progress"),
    row("b", "Baguette", "Completed"),
  ]);
  assert.deepEqual(items.map((s) => s.description), ["In Progress", "Done"]);
});

test("only Public rows are returned", () => {
  const items = parseSidequests([
    row("a", "Shown", "Incomplete"),
    row("b", "Build and paint a Warhammer Army", "Incomplete", [], false),
  ]);
  assert.deepEqual(items.map((s) => s.title), ["Shown"]);
});

test("trims names and skips untitled or malformed rows", () => {
  const items = parseSidequests([
    row("a", "  Build and paint  ", "Incomplete"),
    row("b", "   ", "Incomplete"),
    null,
    {},
  ]);
  assert.deepEqual(items.map((s) => s.title), ["Build and paint"]);
});

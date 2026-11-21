import { test } from "node:test";
import assert from "node:assert/strict";
import { EDGES, INTRO, LOOPS, NODES } from "./life-os.ts";

const ids = new Set(NODES.map((n) => n.id));

test("every edge connects two known nodes", () => {
  for (const e of EDGES) {
    assert.ok(ids.has(e.from), `unknown from: ${e.from}`);
    assert.ok(ids.has(e.to), `unknown to: ${e.to}`);
  }
});

test("every node has a description and both layouts", () => {
  for (const n of NODES) {
    assert.ok(n.description.length > 20, `${n.id} needs a description`);
    for (const layout of [n.desktop, n.mobile]) {
      assert.ok(layout.w > 0 && layout.h > 0, `${n.id} needs a size`);
    }
  }
});

test("every edge has a path for both layouts", () => {
  for (const e of EDGES) {
    assert.match(e.desktop, /^M/);
    assert.match(e.mobile, /^M/);
  }
});

test("covers the parts Sean asked for", () => {
  for (const id of [
    "droplet", "hermes", "server", "telegram", "notion", "sheet",
    "website", "weekly", "quarterly", "yearly", "album", "photos", "dashboard",
  ]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "reviews"));
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "dashboard"));
  assert.ok(!EDGES.some((e) => e.from === "notion" && e.to === "weekly"));
  assert.ok(EDGES.some((e) => e.from === "weekly" && e.to === "quarterly"));
  assert.ok(EDGES.some((e) => e.from === "quarterly" && e.to === "yearly"));
  assert.ok(EDGES.some((e) => e.from === "quarterly" && e.to === "album" && e.dashed));
  assert.ok(EDGES.some((e) => e.from === "photos" && e.to === "album" && e.dashed));
});

test("copy never leaks ids, money amounts or private pages", () => {
  const copy = JSON.stringify({ NODES, EDGES, INTRO, LOOPS });
  assert.doesNotMatch(copy, /[0-9a-f]{8}-?[0-9a-f]{4}/i, "looks like an id");
  assert.doesNotMatch(copy, /1PqeQ|FIRE_SHEET|GOOGLE_SA|NOTION_TOKEN/);
  assert.doesNotMatch(copy, /\$\s?\d{3,}|\d{3,}\.\d{2}/, "looks like a real amount");
  assert.doesNotMatch(copy, /girlfriend|housing|proposal|milestone/i);
  assert.doesNotMatch(copy, /\b\d{1,3}(\.\d{1,3}){3}\b/, "looks like an IP address");
});

test("the review system box contains weekly, quarterly and yearly on both layouts", () => {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const box = byId.reviews;
  assert.ok(box, "missing reviews box");
  assert.equal(box.kind, "group");
  for (const layout of ["desktop", "mobile"] as const) {
    const outer = box[layout];
    for (const id of ["weekly", "quarterly", "yearly"]) {
      const r = byId[id][layout];
      assert.ok(
        r.x >= outer.x && r.y >= outer.y &&
          r.x + r.w <= outer.x + outer.w && r.y + r.h <= outer.y + outer.h,
        `${id} sticks out of the review box on ${layout}`,
      );
    }
    for (const id of ["album", "photos"]) {
      const r = byId[id][layout];
      assert.ok(r.y >= outer.y + outer.h, `${id} should sit below the review box on ${layout}`);
    }
  }
});

test("no two boxes overlap (except boxes inside their group)", () => {
  const inside = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
    a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
  for (const layout of ["desktop", "mobile"] as const) {
    for (const a of NODES) {
      for (const b of NODES) {
        if (a.id >= b.id) continue;
        const ra = a[layout];
        const rb = b[layout];
        if (inside(ra, rb) || inside(rb, ra)) continue;
        const overlap =
          ra.x < rb.x + rb.w && rb.x < ra.x + ra.w && ra.y < rb.y + rb.h && rb.y < ra.y + ra.h;
        assert.ok(!overlap, `${a.id} overlaps ${b.id} on ${layout}`);
      }
    }
  }
});

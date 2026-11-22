import { test } from "node:test";
import assert from "node:assert/strict";
import { EDGES, INTRO, NODES } from "./life-os.ts";

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
    "droplet", "hermes", "server", "telegram", "notion", "calendar", "website",
    "rituals", "daily", "weekly", "monthly", "quarterly", "yearly", "travel", "album", "photos",
  ]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "rituals"));
  for (const gone of ["sheet", "dashboard", "reviews"]) {
    assert.ok(!ids.has(gone), `${gone} should be folded into rituals`);
  }
  for (const [a, b] of [["daily", "weekly"], ["weekly", "monthly"], ["monthly", "quarterly"]]) {
    assert.ok(EDGES.some((e) => e.from === a && e.to === b), `${a} -> ${b}`);
  }
  assert.ok(
    EDGES.some((e) => e.from === "calendar" && e.to === "hermes" && e.twoWay),
    "calendar <-> hermes should be two-way",
  );
  assert.ok(!EDGES.some((e) => e.from === "notion" && e.to === "weekly"));
  assert.ok(EDGES.some((e) => e.from === "quarterly" && e.to === "yearly"));
  assert.ok(EDGES.some((e) => e.from === "quarterly" && e.to === "album" && e.dashed));
  assert.ok(EDGES.some((e) => e.from === "photos" && e.to === "album" && e.dashed));
});

test("copy never leaks ids, money amounts or private pages", () => {
  const copy = JSON.stringify({ NODES, EDGES, INTRO });
  assert.doesNotMatch(copy, /[0-9a-f]{8}-?[0-9a-f]{4}/i, "looks like an id");
  assert.doesNotMatch(copy, /1PqeQ|FIRE_SHEET|GOOGLE_SA|NOTION_TOKEN/);
  assert.doesNotMatch(copy, /\$\s?\d{3,}|\d{3,}\.\d{2}/, "looks like a real amount");
  assert.doesNotMatch(copy, /girlfriend|housing|proposal|milestone/i);
  assert.doesNotMatch(copy, /\b\d{1,3}(\.\d{1,3}){3}\b/, "looks like an IP address");
});

test("the rituals frame contains every ritual on both layouts", () => {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const box = byId.rituals;
  assert.ok(box, "missing rituals frame");
  assert.equal(box.kind, "group");
  for (const layout of ["desktop", "mobile"] as const) {
    const outer = box[layout];
    for (const id of ["daily", "weekly", "monthly", "quarterly", "yearly", "travel", "album", "photos"]) {
      const r = byId[id][layout];
      assert.ok(
        r.x >= outer.x && r.y >= outer.y &&
          r.x + r.w <= outer.x + outer.w && r.y + r.h <= outer.y + outer.h,
        `${id} sticks out of the rituals frame on ${layout}`,
      );
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

test("the website sits inside a Vercel frame on both layouts", () => {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const frame = byId.vercel;
  assert.ok(frame, "missing vercel frame");
  assert.equal(frame.kind, "group");
  for (const layout of ["desktop", "mobile"] as const) {
    const o = frame[layout];
    const r = byId.website[layout];
    assert.ok(
      r.x >= o.x && r.y >= o.y && r.x + r.w <= o.x + o.w && r.y + r.h <= o.y + o.h,
      `website sticks out of the vercel frame on ${layout}`,
    );
  }
});

test("the database lists the tables the review system uses", () => {
  const tables = NODES.find((n) => n.id === "notion")!.lines ?? [];
  for (const t of ["weekly_reviews", "quarterly_reviews", "goals"]) {
    assert.ok(tables.includes(t), `missing table ${t}`);
  }
});

test("the time tracker is not part of the system", () => {
  assert.doesNotMatch(JSON.stringify({ NODES, INTRO }), /time.?tracker|hours/i);
});

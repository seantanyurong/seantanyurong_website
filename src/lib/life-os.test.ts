import { test } from "node:test";
import assert from "node:assert/strict";
import { EDGES, INTRO, NODES, dbSectionBands } from "./life-os.ts";

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
    "rituals", "weekly", "monthly", "quarterly", "yearly", "album", "photos",
    "todo", "tasks", "daily",
    "travel", "tripPlanner", "tripAlbum",
  ]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "rituals"));
  for (const gone of ["sheet", "dashboard", "reviews"]) {
    assert.ok(!ids.has(gone), `${gone} should be folded into rituals`);
  }
  for (const [a, b] of [["weekly", "monthly"], ["monthly", "quarterly"]]) {
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
    for (const id of ["weekly", "monthly", "quarterly", "yearly", "album", "photos"]) {
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
  const tables = (NODES.find((n) => n.id === "notion")!.sections ?? []).flatMap((s) => s.tables);
  for (const t of ["weekly_reviews", "quarterly_reviews", "goals"]) {
    assert.ok(tables.includes(t), `missing table ${t}`);
  }
});

test("the time tracker is not part of the system", () => {
  assert.doesNotMatch(JSON.stringify({ NODES, INTRO }), /time.?tracker|hours/i);
});

test("box titles fit inside their boxes on both layouts", () => {
  // Rough sans-serif width: ~0.5em per character. Box titles are 15px
  // (x1.15 on phones) with 16px left padding.
  for (const layout of ["desktop", "mobile"] as const) {
    const scale = layout === "mobile" ? 1.15 : 1;
    for (const n of NODES) {
      if (n.kind !== "box") continue;
      const width = n.label.length * 15 * scale * 0.5 + 16 + 8;
      assert.ok(width <= n[layout].w, `"${n.label}" overflows its box on ${layout}`);
    }
  }
});

test("travel is its own system: planner then album, fed by the database", () => {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  assert.equal(byId.travel?.kind, "group");
  for (const layout of ["desktop", "mobile"] as const) {
    const o = byId.travel[layout];
    const r = byId.rituals[layout];
    const overlap = o.x < r.x + r.w && r.x < o.x + o.w && o.y < r.y + r.h && r.y < o.y + o.h;
    assert.ok(!overlap, `travel frame overlaps rituals on ${layout}`);
    for (const id of ["tripPlanner", "tripAlbum"]) {
      const b = byId[id][layout];
      assert.ok(
        b.x >= o.x && b.y >= o.y && b.x + b.w <= o.x + o.w && b.y + b.h <= o.y + o.h,
        `${id} sticks out of the travel frame on ${layout}`,
      );
    }
  }
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "travel"));
  assert.ok(EDGES.some((e) => e.from === "tripPlanner" && e.to === "tripAlbum" && e.dashed));
  assert.match(byId.tripPlanner.sub ?? "", /notion/i);
  assert.match(byId.tripAlbum.sub ?? "", /google photos/i);
});

test("todos are their own system: task list feeds the daily dashboard", () => {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  assert.equal(byId.todo?.kind, "group");
  for (const layout of ["desktop", "mobile"] as const) {
    const o = byId.todo[layout];
    for (const other of ["rituals", "travel"]) {
      const r = byId[other][layout];
      const overlap = o.x < r.x + r.w && r.x < o.x + o.w && o.y < r.y + r.h && r.y < o.y + o.h;
      assert.ok(!overlap, `todo frame overlaps ${other} on ${layout}`);
    }
    for (const id of ["tasks", "daily"]) {
      const b = byId[id][layout];
      assert.ok(
        b.x >= o.x && b.y >= o.y && b.x + b.w <= o.x + o.w && b.y + b.h <= o.y + o.h,
        `${id} sticks out of the todo frame on ${layout}`,
      );
    }
  }
  assert.ok(EDGES.some((e) => e.from === "notion" && e.to === "todo"));
  assert.ok(EDGES.some((e) => e.from === "tasks" && e.to === "daily"));
  assert.ok(!EDGES.some((e) => e.from === "daily" && e.to === "weekly"));
});

test("the database groups its tables by what uses them", () => {
  const notion = NODES.find((n) => n.id === "notion")!;
  const sections = notion.sections ?? [];
  assert.deepEqual(
    sections.map((s) => s.id),
    ["money", "travel", "tasks", "gear", "reviews"],
  );
  const tables = sections.flatMap((s) => s.tables);
  assert.equal(new Set(tables).size, tables.length, "a table is listed twice");
  for (const t of ["expenses", "travel", "trip_stops", "actions", "gear", "side_quests"]) {
    assert.ok(tables.includes(t), `missing table ${t}`);
  }
});

test("section arrows leave from their section's rows, inside the database", () => {
  const notion = NODES.find((n) => n.id === "notion")!;
  const sectionEdges = EDGES.filter((e) => e.fromSection);
  assert.deepEqual(
    sectionEdges.map((e) => `${e.fromSection}->${e.to}`).sort(),
    ["reviews->rituals", "tasks->todo", "travel->travel"],
  );
  for (const layout of ["desktop", "mobile"] as const) {
    const bands = dbSectionBands(notion, layout);
    const r = notion[layout];
    // Every section fits inside the cylinder (above its curved bottom).
    assert.ok(bands.at(-1)!.bottom <= r.y + r.h - 18, `sections overflow the database on ${layout}`);
    for (const e of sectionEdges) {
      const band = bands.find((b) => b.id === e.fromSection)!;
      const [, x, y] = e[layout].match(/^M\s*([\d.]+)[\s,]+([\d.]+)/)!.map(Number);
      const onSide = x === r.x || x === r.x + r.w;
      const fromBottom = y >= r.y + r.h - 20 && band === bands.at(-1);
      assert.ok(
        (onSide && y >= band.top && y <= band.bottom) || fromBottom,
        `${e.fromSection} -> ${e.to} does not leave from its section on ${layout}`,
      );
    }
  }
});

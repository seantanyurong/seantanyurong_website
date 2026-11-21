import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getSidequests } from "./sidequests.ts";

const realFetch = globalThis.fetch;
const realEnv = { ...process.env };
const quietError = console.error;

beforeEach(() => {
  process.env.NOTION_TOKEN = "test-token";
  process.env.NOTION_SIDEQUESTS_DB_ID = "sq";
  delete process.env.NEXT_PHASE;
  console.error = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...realEnv };
  console.error = quietError;
});

const row = (id: string, name: string, status: string, quarters: string[] = []) => ({
  id,
  properties: {
    Name: { title: [{ plain_text: name }] },
    Status: { select: { name: status } },
    Quarter: { multi_select: quarters.map((name) => ({ name })) },
    Public: { checkbox: true },
  },
});

test("fetches all pages and sorts in progress, then done (newest first), then future", async () => {
  const pages = [
    [row("a", "Learn thai", "Incomplete"), row("b", "Smart room", "Completed", ["2025 Q3"])],
    [row("c", "Brawlhalla", "In Progress", ["2026 Q4"]), row("d", "2A license", "Completed", ["2026 Q2"])],
  ];
  let call = 0;
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /data_sources\/sq\/query$/);
    const body = JSON.parse(String(init?.body));
    assert.equal(body.start_cursor, call === 0 ? undefined : "next");
    const results = pages[call++];
    return Response.json({ results, has_more: call < pages.length, next_cursor: "next" });
  };
  const items = await getSidequests();
  assert.deepEqual(items.map((s) => s.title), ["Brawlhalla", "2A license", "Smart room", "Learn thai"]);
});

test("returns [] without env vars", async () => {
  delete process.env.NOTION_SIDEQUESTS_DB_ID;
  assert.deepEqual(await getSidequests(), []);
});

test("throws at runtime on Notion failure, returns [] during build", async () => {
  globalThis.fetch = async () => new Response("nope", { status: 500 });
  await assert.rejects(getSidequests());
  process.env.NEXT_PHASE = "phase-production-build";
  assert.deepEqual(await getSidequests(), []);
});

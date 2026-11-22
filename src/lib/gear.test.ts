import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getGear } from "./gear.ts";

const realFetch = globalThis.fetch;
const realEnv = { ...process.env };
const quietError = console.error;

beforeEach(() => {
  process.env.NOTION_TOKEN = "test-token";
  process.env.NOTION_GEAR_DB_ID = "gear";
  delete process.env.NEXT_PHASE;
  console.error = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...realEnv };
  console.error = quietError;
});

test("reads the Gear data source", async () => {
  globalThis.fetch = async (url) => {
    assert.match(String(url), /data_sources\/gear\/query$/);
    return Response.json({
      results: [{
        id: "a",
        properties: {
          Name: { title: [{ plain_text: "Knife" }] },
          Category: { select: { name: "EDC" } },
          Public: { checkbox: true },
        },
      }],
      has_more: false,
    });
  };
  assert.deepEqual((await getGear()).map((i) => i.name), ["Knife"]);
});

test("returns [] without env vars", async () => {
  delete process.env.NOTION_GEAR_DB_ID;
  assert.deepEqual(await getGear(), []);
});

test("throws at runtime on failure, [] during build", async () => {
  globalThis.fetch = async () => new Response("nope", { status: 500 });
  await assert.rejects(getGear());
  process.env.NEXT_PHASE = "phase-production-build";
  assert.deepEqual(await getGear(), []);
});

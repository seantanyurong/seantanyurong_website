import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getPlacePins } from "./places.ts";

const realFetch = globalThis.fetch;
const realEnv = { ...process.env };
const quietError = console.error;

beforeEach(() => {
  process.env.NOTION_TOKEN = "test-token";
  process.env.NOTION_TRAVEL_DB_ID = "db";
  delete process.env.NEXT_PHASE;
  console.error = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...realEnv };
  console.error = quietError;
});

test("returns [] without env vars", async () => {
  delete process.env.NOTION_TOKEN;
  assert.deepEqual(await getPlacePins(), []);
});

test("throws on Notion failure at runtime so ISR keeps the last good page", async () => {
  globalThis.fetch = async () => new Response("bad gateway", { status: 502 });
  await assert.rejects(getPlacePins());
});

test("returns [] on Notion failure during the production build", async () => {
  process.env.NEXT_PHASE = "phase-production-build";
  globalThis.fetch = async () => new Response("bad gateway", { status: 502 });
  assert.deepEqual(await getPlacePins(), []);
});

test("aborts a hung request after the timeout", async () => {
  process.env.NEXT_PHASE = "phase-production-build";
  globalThis.fetch = (_url, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
    });
  const started = Date.now();
  assert.deepEqual(await getPlacePins({ timeoutMs: 50 }), []);
  assert.ok(Date.now() - started < 2000);
});

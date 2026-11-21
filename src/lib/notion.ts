/*
  Shared Notion data-source access for server code (uses NOTION_TOKEN).

  Failure policy, used by every Notion-backed section:
  - Notion error/timeout during `next build` → fallback value, so the build
    never fails.
  - Notion error/timeout during runtime revalidation → throw, so Next keeps
    serving the last successfully generated page.
*/

const NOTION_VERSION = "2026-03-11";

export type QueryOptions = { pageSize?: number; timeoutMs?: number };

export async function queryAll(
  dataSourceId: string,
  { pageSize = 100, timeoutMs = 10_000 }: QueryOptions = {},
): Promise<unknown[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const pages: unknown[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: pageSize,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!res.ok) {
      throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    pages.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

export async function withNotionFallback<T>(
  label: string,
  load: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await load();
  } catch (err) {
    console.error(`[${label}]`, err);
    if (process.env.NEXT_PHASE === "phase-production-build") return fallback;
    throw err;
  }
}

import { parsePins, type Pin } from "./places-core.ts";

/*
  Reads the Notion "Travel DB" data source and returns map pins.
  Server-only: uses NOTION_TOKEN. Any failure returns [] so the Places
  section simply hides instead of breaking the build.
*/

const NOTION_VERSION = "2026-03-11";

export async function getPlacePins(pageSize = 100): Promise<Pin[]> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_TRAVEL_DB_ID;
  if (!token || !dataSourceId) return [];

  try {
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
        },
      );
      if (!res.ok) {
        console.error("[places] Notion query failed:", res.status, await res.text());
        return [];
      }
      const data = await res.json();
      pages.push(...(data.results ?? []));
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    return parsePins(pages, new Date().toISOString().slice(0, 10));
  } catch (err) {
    console.error("[places] Notion query error:", err);
    return [];
  }
}

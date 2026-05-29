import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/*
  Content lives as markdown files under /content/{projects,sidequests}.
  We read frontmatter only (no body — the live sections don't render markdown
  bodies). Schemas mirror the originals from the Astro site so existing files
  validate without edits.
*/

const CONTENT_ROOT = path.join(process.cwd(), "content");

const baseSchema = z.object({
  title: z.string(),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export const projectSchema = baseSchema.extend({
  url: z.string(),
  date: z.coerce.date(),
  // Optional 1-line blurb shown under the title on the card.
  description: z.string().optional(),
  // Optional path (e.g. "/projects/knife-sharpening-sg.png") served from
  // /public. When set, the card renders as an image-variant card.
  image: z.string().optional(),
  // Controls how wide the card is in the grid. true = spans 2 columns at sm+
  // (the showcase "bento" treatment). false = single column (compact card).
  // Only meaningful when `image` is set — text cards are always 1 column.
  wide: z.boolean().optional().default(true),
});

export const sidequestSchema = baseSchema.extend({
  description: z.string(),
});

export type Project = z.infer<typeof projectSchema> & { slug: string };
export type Sidequest = z.infer<typeof sidequestSchema> & { slug: string };

async function readDir<T extends z.ZodObject<z.ZodRawShape>>(
  dir: string,
  schema: T,
): Promise<(z.infer<T> & { slug: string })[]> {
  const dirPath = path.join(CONTENT_ROOT, dir);
  const files = await fs.readdir(dirPath);
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(dirPath, file), "utf8");
        const { data } = matter(raw);
        const parsed = schema.parse(data) as z.infer<T>;
        return { ...parsed, slug: file.replace(/\.md$/, "") };
      }),
  );
  return entries;
}

export async function getProjects(): Promise<Project[]> {
  const items = await readDir("projects", projectSchema);
  return items
    .filter((p) => !p.draft)
    .sort((a, b) => {
      // Featured projects float to the top; everything else falls back to
      // newest-first by date.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.date.valueOf() - a.date.valueOf();
    });
}

/*
  Sort key for sidequests.
  Descriptions encode status + quarter (e.g. "Done - 2025 Q3", "In Progress -
  2026 Q2", "In the future"). We rank by status, then by recency.
*/
function sidequestSortKey(desc: string): { rank: number; quarter: number } {
  const m = desc.match(/(Done|In Progress)\s*-\s*(\d{4})\s*Q([1-4])/i);
  if (m) {
    const status = m[1].toLowerCase();
    const year = Number(m[2]);
    const q = Number(m[3]);
    const quarter = year * 10 + q;
    // In Progress first (rank 0), then Done (rank 1).
    return { rank: status === "in progress" ? 0 : 1, quarter };
  }
  // "In the future" or any unrecognised value lands last.
  return { rank: 2, quarter: 0 };
}

export async function getSidequests(): Promise<Sidequest[]> {
  const items = await readDir("sidequests", sidequestSchema);
  return items
    .filter((p) => !p.draft)
    .sort((a, b) => {
      const ka = sidequestSortKey(a.description);
      const kb = sidequestSortKey(b.description);
      if (ka.rank !== kb.rank) return ka.rank - kb.rank;
      // Within a rank: most-recent quarter first; ties broken alphabetically.
      if (ka.quarter !== kb.quarter) return kb.quarter - ka.quarter;
      return a.title.localeCompare(b.title);
    });
}

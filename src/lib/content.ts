import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/*
  Projects live as markdown files under /content/projects. (Sidequests come
  from Notion — see sidequests.ts.)
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
  // Optional short headline stat (e.g. "$50K+ EARNED", "2000+ KNIVES",
  // "1.7K CHATS"). Renders as a glass pill on the front of image cards.
  // Keep it tight — 3-4 words max — so it reads at a glance.
  stat: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema> & { slug: string };

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

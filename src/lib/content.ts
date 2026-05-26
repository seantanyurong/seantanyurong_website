import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/*
  Content lives as markdown files under /content/{projects,bucketList}.
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
});

export const bucketListSchema = baseSchema.extend({
  description: z.string(),
});

export type Project = z.infer<typeof projectSchema> & { slug: string };
export type BucketListItem = z.infer<typeof bucketListSchema> & { slug: string };

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
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export async function getBucketList(): Promise<BucketListItem[]> {
  const items = await readDir("bucketList", bucketListSchema);
  return items
    .filter((p) => !p.draft)
    .sort((a, b) => a.title.localeCompare(b.title));
}

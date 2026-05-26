import type { BucketListItem } from "@/lib/content";

/*
  Bucket list — two-column rows: title (left) — description (right, muted).
  No links: these are aspirational. Sorted alphabetically by title in the loader.
*/

function stripPrefix(title: string) {
  // Titles look like "Side Quest: Make a killer baguette" — drop the prefix.
  const m = title.match(/^[^:]+:\s*(.+)$/);
  return m ? m[1] : title;
}

export function BucketList({ items }: { items: BucketListItem[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((b) => (
        <li
          key={b.slug}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-6"
        >
          <span className="text-[15px] text-neutral-900">
            {stripPrefix(b.title)}
          </span>
          <span className="text-sm italic text-neutral-400">
            {b.description}
          </span>
        </li>
      ))}
    </ul>
  );
}

import type { Sidequest } from "@/lib/content";

/*
  Sidequests — two-column rows: title (left) — status (right, muted).
  No links: these are aspirational. Sorted in the loader by status + recency.
*/

function stripPrefix(title: string) {
  // Titles look like "Side Quest: Make a killer baguette" — drop the prefix.
  const m = title.match(/^[^:]+:\s*(.+)$/);
  return m ? m[1] : title;
}

export function Sidequests({ items }: { items: Sidequest[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((s) => (
        <li
          key={s.slug}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-6"
        >
          <span className="text-[15px] text-neutral-900">
            {stripPrefix(s.title)}
          </span>
          <span className="text-sm italic text-neutral-400">
            {s.description}
          </span>
        </li>
      ))}
    </ul>
  );
}

import type { TeamItem } from "@/lib/content";
import { ArrowUpRight } from "@/components/icons";

/*
  Team list — Jordi-style single-column rows: title — date — arrow.
  Restrained, scannable; the only section likely to stay small.
*/

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function TeamList({ items }: { items: TeamItem[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((t) => (
        <li key={t.slug}>
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-baseline justify-between gap-4 py-4 transition-colors hover:bg-neutral-50/60 -mx-2 px-2 rounded-lg"
          >
            <span className="flex items-baseline gap-2 text-[15px] text-neutral-900">
              {t.title}
              <ArrowUpRight className="h-3 w-3 text-neutral-400 transition-colors group-hover:text-neutral-900" />
            </span>
            <time
              dateTime={t.date.toISOString()}
              className="shrink-0 font-mono text-xs text-neutral-400"
            >
              {formatDate(t.date)}
            </time>
          </a>
        </li>
      ))}
    </ul>
  );
}

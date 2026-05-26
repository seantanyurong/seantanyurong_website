import type { Project } from "@/lib/content";
import { ArrowUpRight } from "@/components/icons";

/*
  Projects grid — Chester-style bento cards.
  Each card: title (serif), date (mono muted), external link arrow on hover.
  No images yet (content doesn't carry them) so cards lean on type + spacing.
*/

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function stripTypePrefix(title: string) {
  // Many titles are prefixed like "Website: Donna" — strip the "X:" prefix
  // for visual cleanliness while keeping the kind as a small label.
  const m = title.match(/^([^:]+):\s*(.+)$/);
  if (!m) return { kind: null as string | null, name: title };
  return { kind: m[1], name: m[2] };
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        const { kind, name } = stripTypePrefix(p.title);
        return (
          <li key={p.slug}>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex h-full min-h-[140px] flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
            >
              <div>
                {kind && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                    {kind}
                  </span>
                )}
                <h3
                  className={`font-serif text-xl leading-snug text-neutral-900 ${
                    kind ? "mt-1" : ""
                  }`}
                >
                  {name}
                </h3>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <time
                  dateTime={p.date.toISOString()}
                  className="font-mono text-xs text-neutral-400"
                >
                  {formatDate(p.date)}
                </time>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

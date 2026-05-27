import Image from "next/image";
import type { Project } from "@/lib/content";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";

/*
  Projects grid — two card variants in a bento layout:

  - TEXT variant (default): kind label, serif title, optional description,
    date, arrow. 1 column.
  - IMAGE variant (when `featured: true` AND `image` is set): full-bleed
    screenshot with title overlay. Spans 2 columns on >= sm.

  Cards inherit their order from getProjects() — featured-first, then by date.
*/

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function stripTypePrefix(title: string) {
  // Many titles are "Website: Donna" — separate the kind label and the name.
  const m = title.match(/^([^:]+):\s*(.+)$/);
  if (!m) return { kind: null as string | null, name: title };
  return { kind: m[1], name: m[2] };
}

function CardChrome({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm transition-colors group-hover:bg-neutral-900 group-hover:text-white">
      {children}
    </span>
  );
}

function TextCard({ project }: { project: Project }) {
  const { kind, name } = stripTypePrefix(project.title);
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-full min-h-[160px] flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
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
        {project.description && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {project.description}
          </p>
        )}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <time
          dateTime={project.date.toISOString()}
          className="font-mono text-xs text-neutral-400"
        >
          {formatDate(project.date)}
        </time>
        <CardChrome>
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </CardChrome>
      </div>
    </a>
  );
}

function ImageCard({ project }: { project: Project }) {
  // Caller guarantees project.image is defined.
  const { kind, name } = stripTypePrefix(project.title);
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className="group relative isolate flex aspect-[2/1] flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none sm:col-span-2"
    >
      <Image
        src={project.image!}
        alt={name}
        fill
        priority
        sizes="(min-width: 1024px) 66vw, (min-width: 640px) 100vw, 100vw"
        className="-z-10 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="flex items-end justify-between p-5 text-white">
        <div>
          {kind && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
              {kind}
            </span>
          )}
          <h3 className="mt-1 font-serif text-2xl leading-tight">{name}</h3>
          {project.description && (
            <p className="mt-1 max-w-md text-sm text-white/80">
              {project.description}
            </p>
          )}
        </div>
        <CardChrome>
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </CardChrome>
      </div>
    </a>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        const useImage = p.featured && p.image;
        return (
          <li key={p.slug} className={useImage ? "sm:col-span-2" : ""}>
            {useImage ? <ImageCard project={p} /> : <TextCard project={p} />}
          </li>
        );
      })}
    </ul>
  );
}

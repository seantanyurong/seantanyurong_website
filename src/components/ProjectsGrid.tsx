"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/content";
import {
  ArrowPathRoundedSquareIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/20/solid";

/*
  Projects grid — two card variants in a bento layout:

  - TEXT variant (default): kind label, serif title, optional description,
    date, arrow. 1 column.
  - IMAGE variant (when `image` is set): full-bleed screenshot with title
    overlay. Spans 2 columns on >= sm. The `featured` flag is independent —
    it only controls sort order (pinning to the top of the list).

  Cards inherit their order from getProjects() — featured-first, then by date.
*/

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
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

/* Mobile-only flip button. Sits in the same corner where the desktop arrow
   chrome lives, but on tap it toggles the card's flipped state instead of
   navigating. preventDefault + stopPropagation keep the parent <a> from
   firing alongside it. */
function FlipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Flip card"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm transition-colors active:bg-neutral-900 active:text-white sm:hidden"
    >
      <ArrowPathRoundedSquareIcon className="h-3.5 w-3.5" />
    </button>
  );
}

function TextCard({ project }: { project: Project }) {
  const { kind, name } = stripTypePrefix(project.title);
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-full min-h-55 flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
    >
      <div>
        {kind && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
            {kind}
          </span>
        )}
        <h3 className="font-serif text-xl leading-snug text-neutral-900">
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

function ImageCard({ project, wide }: { project: Project; wide: boolean }) {
  // Caller guarantees project.image is defined.
  const { kind, name } = stripTypePrefix(project.title);
  // Desktop flips on hover; mobile flips on tap (state below).
  const [flipped, setFlipped] = useState(false);
  const toggleFlip = () => setFlipped((v) => !v);
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className={`group block rounded-2xl perspective-distant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
        wide ? "sm:aspect-2/1" : "sm:aspect-square"
      }`}
    >
      {/* Rotating wrapper. Hovering the outer .group flips this 180° on Y;
          front and back faces sit on opposite sides via backface-visibility.
          The min-h lives on this wrapper (not the outer <a>) because the
          absolute-positioned faces inside need a positioned ancestor with a
          resolved height — on mobile, where the outer <a> has no aspect ratio,
          `h-full` would resolve to `auto` and the faces would collapse. */}
      <div
        className={`relative h-full min-h-55 w-full transition-transform duration-700 ease-out transform-3d group-hover:rotate-y-180 group-focus-visible:rotate-y-180 ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT: image with title overlay (the existing card design). */}
        <div className="absolute inset-0 isolate flex flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 backface-hidden">
          <Image
            src={project.image!}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, (min-width: 640px) 100vw, 100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
          <div className="flex items-end justify-between p-5 text-white">
            <div>
              {kind && (
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                  {kind}
                </span>
              )}
              <h3 className="font-serif text-2xl leading-tight">{name}</h3>
            </div>
            {/* Desktop: decorative arrow chrome (whole card is the link).
                Mobile: tap-to-flip button replaces it. */}
            <span className="hidden sm:flex">
              <CardChrome>
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </CardChrome>
            </span>
            <FlipButton onClick={toggleFlip} />
          </div>
        </div>

        {/* BACK: dark panel with the full description. Pre-rotated 180° so
            it's facing away by default, then comes forward when the wrapper
            flips. */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-white backface-hidden rotate-y-180">
          {kind && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
              {kind}
            </span>
          )}
          <h3 className="font-serif text-2xl leading-tight">{name}</h3>
          {project.description && (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
              {project.description}
            </p>
          )}
          <div className="mt-auto flex justify-end gap-2 pt-4">
            <span className="hidden sm:flex">
              <CardChrome>
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </CardChrome>
            </span>
            <FlipButton onClick={toggleFlip} />
          </div>
        </div>
      </div>
    </a>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  // Wide image cards (the showcase 2-col bento) alternate sides at the lg
  // breakpoint (3-col grid). 1st on the left (cols 1-2), 2nd on the right
  // (cols 2-3), and so on. Combined with `grid-auto-flow: dense`, text cards
  // backfill the leftover cell on the opposite side automatically.
  // Narrow image cards (1 col) don't alternate — they slot in like text cards.
  let wideImageIdx = 0;
  return (
    <ul className="grid grid-flow-row-dense grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        const useImage = !!p.image;
        const wide = useImage && p.wide;
        let liClass = '';
        if (wide) {
          const posClass =
            wideImageIdx % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-2';
          liClass = `sm:col-span-2 ${posClass}`;
          wideImageIdx++;
        }
        return (
          <li key={p.slug} className={liClass}>
            {useImage ? (
              <ImageCard project={p} wide={p.wide} />
            ) : (
              <TextCard project={p} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

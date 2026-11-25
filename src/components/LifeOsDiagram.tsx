"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  DB_ROWS,
  DESKTOP,
  EDGES,
  MOBILE,
  NODES,
  dbSectionBands,
  type LifeOsNode,
} from "@/lib/life-os";

/*
  Life OS diagram — hand-built SVG in two layouts (wide + stacked for phones).
  Hover, focus or tap a part to read what it does in the panel underneath.
  Arrows carry a slow "data flow" animation (static with reduced motion);
  the analog photo album is drawn dashed and warm because it's done by hand.
*/

type Layout = "desktop" | "mobile";

function Node({
  node,
  layout,
  active,
  onSelect,
}: {
  node: LifeOsNode;
  layout: Layout;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const { x, y, w, h } = node[layout];
  const fs = layout === "mobile" ? 1.15 : 1; // text reads smaller on phones
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node.id);
    }
  };
  const interactive = {
    role: "button",
    tabIndex: 0,
    "aria-label": `${node.label}: ${node.description}`,
    "aria-pressed": active,
    onClick: () => onSelect(node.id),
    onMouseEnter: () => onSelect(node.id),
    onFocus: () => onSelect(node.id),
    onKeyDown,
    className: "cursor-pointer outline-none [&:focus-visible>.frame]:stroke-blue-400",
  } as const;

  if (node.kind === "group") {
    return (
      <g {...interactive}>
        <rect
          className={`frame fill-neutral-50 ${active ? "stroke-lime-500" : "stroke-neutral-200"}`}
          x={x} y={y} width={w} height={h} rx={16} strokeWidth={1.5}
        />
        <text
          x={x + w - 24}
          y={node.labelAt === "bottom" ? y + h - 12 : y + 26}
          textAnchor="end"
          className="fill-neutral-400 font-sans uppercase"
          fontSize={11 * fs}
          letterSpacing="0.16em"
        >
          {node.label}
        </text>
      </g>
    );
  }

  if (node.kind === "db") {
    const ry = 18;
    const body = `M${x} ${y + ry} L${x} ${y + h - ry} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} L${x + w} ${y + ry}`;
    return (
      <g {...interactive}>
        <path d={body} className={`frame fill-teal-50 ${active ? "stroke-teal-500" : "stroke-teal-300"}`} strokeWidth={1.5} />
        <ellipse
          cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry}
          className={`frame fill-teal-100 ${active ? "stroke-teal-500" : "stroke-teal-300"}`} strokeWidth={1.5}
        />
        <text x={x + w / 2} y={y + 64} textAnchor="middle" className="fill-neutral-900 font-serif" fontSize={26 * fs}>
          {node.label}
        </text>
        <text x={x + w / 2} y={y + 84} textAnchor="middle" className="fill-teal-700 font-sans" fontSize={11 * fs}>
          {node.sub}
        </text>
        {dbSectionBands(node, layout).map((band) => (
          <g key={band.id}>
            <text
              x={x + 24} y={band.top + 11 * fs}
              className="fill-teal-600 font-sans uppercase" fontSize={9.5 * fs} letterSpacing="0.14em"
            >
              {band.label}
            </text>
            {band.tables.map((table, i) => (
              <text
                key={table} x={x + 32}
                y={band.top + (DB_ROWS.header + (i + 1) * DB_ROWS.line - 5) * fs}
                className="fill-teal-900 font-mono" fontSize={12 * fs}
              >
                {table}
              </text>
            ))}
          </g>
        ))}
      </g>
    );
  }

  const isPill = node.kind === "pill";
  const isAnalog = node.kind === "analog";
  const frame = isAnalog
    ? `fill-amber-50 ${active ? "stroke-amber-600" : "stroke-amber-400"}`
    : `fill-white ${active ? "stroke-lime-500" : "stroke-neutral-200"}`;

  return (
    <g {...interactive}>
      <rect
        className={`frame ${frame} transition-colors`}
        x={x} y={y} width={w} height={h}
        rx={isPill ? h / 2 : isAnalog ? 6 : 10}
        strokeWidth={1.5}
        strokeDasharray={isAnalog ? "5 4" : undefined}
      />
      {isPill ? (
        <>
          <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" className="fill-neutral-900 font-sans" fontSize={13 * fs}>
            {node.label}
          </text>
          {node.sub && (
            <text x={x + w / 2} y={y + h / 2 + 15 * fs} textAnchor="middle" className="fill-neutral-500 font-sans" fontSize={11 * fs}>
              {node.sub}
            </text>
          )}
        </>
      ) : (
        <>
          <text
            x={x + 16} y={y + 28}
            className={isAnalog ? "fill-amber-900 font-serif italic" : "fill-neutral-900 font-sans"}
            fontSize={(isAnalog ? 19 : 15) * fs}
          >
            {node.label}
          </text>
          <text x={x + 16} y={y + 48} className={isAnalog ? "fill-amber-700 font-sans" : "fill-neutral-500 font-sans"} fontSize={11 * fs}>
            {node.sub}
          </text>
          {node.lines?.map((line, i) => (
            <text key={line} x={x + 16} y={y + 78 + i * (layout === "mobile" ? 28 : 20)} className="fill-neutral-600 font-mono" fontSize={11 * fs}>
              {line}
            </text>
          ))}
        </>
      )}
    </g>
  );
}

function Diagram({
  layout,
  active,
  onSelect,
  className,
}: {
  layout: Layout;
  active: string | null;
  onSelect: (id: string) => void;
  className: string;
}) {
  const size = layout === "desktop" ? DESKTOP : MOBILE;
  const markerId = `life-os-arrow-${layout}`;
  return (
    <svg
      viewBox={`0 0 ${size.width} ${size.height}`}
      className={className}
      role="group"
      aria-label="Diagram of my Life OS"
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-neutral-300" />
        </marker>
      </defs>

      {/* Groups first so their children draw on top. */}
      {NODES.filter((n) => n.kind === "group").map((n) => (
        <Node key={n.id} node={n} layout={layout} active={active === n.id} onSelect={onSelect} />
      ))}

      {EDGES.map((e) => {
        const d = e[layout];
        const lit = active === e.from || active === e.to;
        return (
          <g key={`${e.from}-${e.to}`} aria-hidden>
            <path
              d={d} fill="none" strokeWidth={1.5}
              markerEnd={`url(#${markerId})`}
              markerStart={e.twoWay ? `url(#${markerId})` : undefined}
              strokeDasharray={e.dashed ? "4 5" : undefined}
              className={e.dashed ? "stroke-amber-400" : lit ? "stroke-teal-300" : "stroke-neutral-200"}
            />
            {!e.dashed && (
              <path d={d} fill="none" strokeWidth={2} strokeLinecap="round" strokeDasharray="2 12" className="life-os-flow stroke-teal-500" />
            )}
          </g>
        );
      })}

      {NODES.filter((n) => n.kind !== "group").map((n) => (
        <Node key={n.id} node={n} layout={layout} active={active === n.id} onSelect={onSelect} />
      ))}

      {/* Dots on top, where arrows leave their database section. */}
      {EDGES.filter((e) => e.fromSection).map((e) => (
        <SectionPort key={`${e.from}-${e.to}-port`} d={e[layout]} />
      ))}
    </svg>
  );
}

// A small dot where an arrow leaves its database section.
function SectionPort({ d }: { d: string }) {
  const [, cx, cy] = d.match(/^M\s*([\d.]+)[\s,]+([\d.]+)/) ?? [];
  if (!cx) return null;
  return <circle cx={cx} cy={cy} r={3.5} className="fill-teal-500 stroke-teal-50" strokeWidth={1.5} />;
}

function NodeTitle({ node }: { node: LifeOsNode }) {
  return (
    <p className={`text-sm ${node.kind === "analog" ? "font-serif italic text-amber-900" : "font-medium text-neutral-900"}`}>
      {node.label}
      {node.sub && <span className="font-normal text-neutral-500"> · {node.sub}</span>}
    </p>
  );
}

export function LifeOsDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const node = NODES.find((n) => n.id === active);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Escape or a tap outside the diagram (and its card) closes the details.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !cardRef.current?.contains(target)) setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [active]);

  return (
    <div ref={rootRef}>
      <p className="mb-4 text-sm text-neutral-500 sm:hidden">
        Tap any part of the diagram to see what it does.
      </p>
      <Diagram layout="desktop" active={active} onSelect={setActive} className="hidden h-auto w-full sm:block" />
      <Diagram layout="mobile" active={active} onSelect={setActive} className="h-auto w-full sm:hidden" />

      {/* Desktop: panel under the diagram. */}
      <div aria-live="polite" className="mt-6 hidden min-h-[5.5rem] rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 sm:block">
        {node ? (
          <>
            <NodeTitle node={node} />
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{node.description}</p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-neutral-500">
            Hover or tap any part of the diagram to see what it does.
          </p>
        )}
      </div>

      {/* Phones: the diagram is tall, so details pop up pinned to the bottom of
          the screen. Rendered into <body> because an animated (transformed)
          ancestor would otherwise pin it to the page instead of the screen. */}
      {node && createPortal(
        <div
          ref={cardRef}
          role="dialog"
          aria-label={node.label}
          className="fade-up fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md sm:hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <NodeTitle node={node} />
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-neutral-500 hover:text-neutral-900"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{node.description}</p>
        </div>,
        document.body,
      )}
    </div>
  );
}

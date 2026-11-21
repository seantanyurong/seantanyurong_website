"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  activePin,
  clusterPoints,
  clusterRadiusFor,
  formatMonth,
  pinUiReducer,
  type Pin,
} from "@/lib/places-core";

/*
  Interactive pin overlay for PlacesMap. Each cluster is a focusable button
  positioned in % over the SVG. Hover, keyboard focus, or tap shows a tooltip
  with the trip name and when Sean went; Escape or tapping elsewhere hides it.
  Points are clustered by the map's measured width so 24px hit targets never
  overlap (e.g. on a phone most of SE Asia becomes one dot).
*/

export type MapPoint = Pick<Pin, "key" | "label" | "visits"> & {
  x: number; // SVG units
  y: number;
};

type MapCluster = {
  left: number; // % of map width
  top: number; // % of map height
  pins: MapPoint[];
};

function visitLine(heading: string, v: Pin["visits"][number]) {
  return [
    v.trip !== heading ? v.trip : null,
    formatMonth(v.departure),
    v.tripType,
  ]
    .filter(Boolean)
    .join(" · ");
}

function describe(cluster: MapCluster) {
  return cluster.pins
    .map((p) => {
      return `${p.label}: ${p.visits.map((v) => visitLine(p.label, v)).join(", ")}`;
    })
    .join("; ");
}

export function PlacesMapPins({
  points,
  width,
  height,
}: {
  points: MapPoint[];
  width: number;
  height: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Server render assumes the map is drawn at its SVG width; re-measured below.
  const [renderedWidth, setRenderedWidth] = useState(width);
  const [ui, dispatch] = useReducer(pinUiReducer, {
    hover: null,
    focus: null,
    pinned: null,
  });
  const active = activePin(ui);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setRenderedWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clusters: MapCluster[] = useMemo(
    () =>
      clusterPoints(points, clusterRadiusFor(renderedWidth, width)).map(
        (c) => ({
          left: (c.x / width) * 100,
          top: (c.y / height) * 100,
          pins: c.items,
        }),
      ),
    [points, renderedWidth, width, height],
  );

  // Cluster indices change when the map is resized; close any open tooltip.
  useEffect(() => dispatch({ type: "dismiss" }), [clusters]);

  // Tap/click outside the pins or press Escape to dismiss.
  useEffect(() => {
    if (active === null) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        dispatch({ type: "dismiss" });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "dismiss" });
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {clusters.map((cluster, i) => {
        const isActive = active === i;
        const multi = cluster.pins.length > 1;
        // Keep the tooltip inside the map near the edges.
        const horizontal =
          cluster.left > 65
            ? "right-0"
            : cluster.left < 35
              ? "left-0"
              : "left-1/2 -translate-x-1/2";
        const vertical = cluster.top < 35 ? "top-full mt-2" : "bottom-full mb-2";

        return (
          <div
            key={cluster.pins.map((p) => p.key).join("|")}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${isActive ? "z-20" : "z-10"}`}
            style={{ left: `${cluster.left}%`, top: `${cluster.top}%` }}
            onMouseEnter={() => dispatch({ type: "enter", index: i })}
            onMouseLeave={() => dispatch({ type: "leave", index: i })}
          >
            <button
              type="button"
              aria-label={describe(cluster)}
              aria-expanded={isActive}
              onFocus={() => dispatch({ type: "focus", index: i })}
              onBlur={() => dispatch({ type: "blur", index: i })}
              onClick={() => dispatch({ type: "click", index: i })}
              className="group/pin flex h-6 w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <span
                className={`block rounded-full bg-teal-500 ring-2 ring-white transition-transform duration-150 group-hover/pin:scale-125 ${
                  multi ? "h-3 w-3" : "h-2 w-2"
                } ${isActive ? "scale-125" : ""}`}
              />
            </button>

            {isActive && (
              <div
                role="tooltip"
                className={`pointer-events-none absolute w-max max-w-[16rem] rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-left shadow-sm backdrop-blur-md ${horizontal} ${vertical}`}
              >
                <ul className="space-y-1.5">
                  {cluster.pins.map((p) => (
                    <li key={p.key}>
                      <p className="text-sm text-neutral-900">{p.label}</p>
                      {p.visits.map((v) => (
                        <p
                          key={v.departure + v.trip}
                          className="font-mono text-[11px] text-neutral-500"
                        >
                          {visitLine(p.label, v)}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

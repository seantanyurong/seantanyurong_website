"use client";

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  activePin,
  clusterPoints,
  clusterRadiusFor,
  formatMonth,
  lerpView,
  pinUiReducer,
  zoomTo,
  type Pin,
  type View,
} from "@/lib/places-core";

/*
  Interactive part of PlacesMap. Owns the SVG viewBox so the map can zoom.

  - Pins are clustered by the current view and the map's measured width, so
    24px hit targets never overlap.
  - Clicking a cluster of several places zooms into them; clicking a single
    place (or a cluster that can't zoom further) pins its tooltip.
  - Hover / keyboard focus show the tooltip. Escape closes the tooltip, then
    zooms back out. "← World" zooms out too.
*/

export type MapPoint = Pick<Pin, "key" | "label" | "visits"> & {
  x: number; // SVG units
  y: number;
};

type MapCluster = { x: number; y: number; pins: MapPoint[] };

const ZOOM_MS = 450;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function visitLine(heading: string, v: Pin["visits"][number]) {
  return [v.trip !== heading ? v.trip : null, formatMonth(v.departure)]
    .filter(Boolean)
    .join(" · ");
}

function describe(pins: MapPoint[]) {
  return pins
    .map((p) => `${p.label}: ${p.visits.map((v) => visitLine(p.label, v)).join(", ")}`)
    .join("; ");
}

const sameView = (a: View, b: View) =>
  Math.abs(a.x - b.x) < 0.5 &&
  Math.abs(a.y - b.y) < 0.5 &&
  Math.abs(a.w - b.w) < 0.5;

export function PlacesMapView({
  points,
  width,
  height,
  label,
  children,
}: {
  points: MapPoint[];
  width: number;
  height: number;
  label: string;
  children: ReactNode; // the country <path>s
}) {
  const full: View = useMemo(
    () => ({ x: 0, y: 0, w: width, h: height }),
    [width, height],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  // Server render assumes the map is drawn at its SVG width; re-measured below.
  const [renderedWidth, setRenderedWidth] = useState(width);
  const [target, setTarget] = useState<View>(full); // where we're zooming to
  const [view, setView] = useState<View>(full); // what's drawn this frame
  // Latest drawn view, read when a new zoom starts (declared before the
  // animation effect so it's synced first).
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const zoomed = !sameView(target, full);

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

  // Animate the drawn view towards the target.
  useEffect(() => {
    const from = viewRef.current;
    if (
      sameView(from, target) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setView(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / ZOOM_MS, 1);
      setView(lerpView(from, target, easeInOut(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  // Clusters are computed for the target view, so pins split (or merge) as
  // soon as a zoom starts and then slide into place.
  const clusters: MapCluster[] = useMemo(() => {
    const visible = points.filter(
      (p) =>
        p.x >= target.x &&
        p.x <= target.x + target.w &&
        p.y >= target.y &&
        p.y <= target.y + target.h,
    );
    return clusterPoints(visible, clusterRadiusFor(renderedWidth, target.w)).map(
      (c) => ({ x: c.x, y: c.y, pins: c.items }),
    );
  }, [points, target, renderedWidth]);

  // Cluster indices change on resize/zoom; close any open tooltip.
  useEffect(() => dispatch({ type: "dismiss" }), [clusters]);

  // Escape closes the tooltip first, then zooms out. Tapping outside closes
  // the tooltip.
  useEffect(() => {
    if (active === null && !zoomed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active !== null) dispatch({ type: "dismiss" });
      else setTarget(full);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (active !== null && !rootRef.current?.contains(e.target as Node)) {
        dispatch({ type: "dismiss" });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [active, zoomed, full]);

  const onClusterClick = (cluster: MapCluster, i: number) => {
    if (cluster.pins.length > 1) {
      const next = zoomTo(cluster.pins, { width, height });
      if (!sameView(next, target)) {
        setTarget(next);
        return;
      }
    }
    dispatch({ type: "click", index: i });
  };

  return (
    <div ref={rootRef} className="relative">
      <svg
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className="h-auto w-full"
        role="img"
        aria-label={label}
      >
        {children}
      </svg>

      <div className="absolute inset-0">
        {clusters.map((cluster, i) => {
          const left = ((cluster.x - view.x) / view.w) * 100;
          const top = ((cluster.y - view.y) / view.h) * 100;
          // Mid-animation a pin can be outside the drawn area; don't show it.
          if (left < -2 || left > 102 || top < -2 || top > 102) return null;

          const isActive = active === i;
          const multi = cluster.pins.length > 1;
          // Keep the tooltip inside the map near the edges.
          const horizontal =
            left > 65 ? "right-0" : left < 35 ? "left-0" : "left-1/2 -translate-x-1/2";
          const vertical = top < 35 ? "top-full mt-2" : "bottom-full mb-2";

          return (
            <div
              key={cluster.pins.map((p) => p.key).join("|")}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${isActive ? "z-20" : "z-10"}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              onMouseEnter={() => dispatch({ type: "enter", index: i })}
              onMouseLeave={() => dispatch({ type: "leave", index: i })}
            >
              <button
                type="button"
                aria-label={
                  multi
                    ? `Zoom in on ${cluster.pins.length} places — ${describe(cluster.pins)}`
                    : describe(cluster.pins)
                }
                onFocus={() => dispatch({ type: "focus", index: i })}
                onBlur={() => dispatch({ type: "blur", index: i })}
                onClick={() => onClusterClick(cluster, i)}
                className="group/pin flex h-6 w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <span
                  className={`block rounded-full bg-teal-500 ring-2 ring-paper transition-transform duration-150 group-hover/pin:scale-125 ${
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
                  {multi && (
                    <p className="mt-2 text-[11px] text-neutral-500">
                      Click to zoom in
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setTarget(full)}
          className="absolute bottom-2 left-2 z-30 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-sm tracking-tight text-neutral-500 shadow-sm backdrop-blur-md transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        >
          ← World
        </button>
      )}
    </div>
  );
}

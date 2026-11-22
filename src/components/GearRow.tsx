"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/*
  One swipeable row of gear tiles. Phones swipe (with the next tile peeking
  in); desktop gets ‹ › buttons beside the heading, shown only when the row
  actually overflows and disabled at each end. Snap scrolling, no auto-play.
*/
export function GearRow({ title, children }: { title: string; children: ReactNode }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const overflowing = edges.prev || edges.next;
  const button =
    "flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:text-neutral-600";

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
          {title}
        </h3>
        <span aria-hidden className="h-px flex-1 bg-neutral-100" />
        {overflowing && (
          <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label={`Scroll ${title} left`} className={button} disabled={!edges.prev} onClick={() => page(-1)}>
              ‹
            </button>
            <button type="button" aria-label={`Scroll ${title} right`} className={button} disabled={!edges.next} onClick={() => page(1)}>
              ›
            </button>
          </div>
        )}
      </div>
      <ul
        ref={scroller}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-1 px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}

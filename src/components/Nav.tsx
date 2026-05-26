"use client";

import { useEffect, useRef, useState } from "react";

/*
  Sticky pill nav with a sliding active indicator that tracks the section
  currently in view. Inspired by chester.how's top nav.
*/

type NavItem = { id: string; label: string };

const items: NavItem[] = [
  { id: "top", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "sidequests", label: "Sidequests" },
];

export function Nav() {
  const [active, setActive] = useState<string>("top");
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Track which section is in view using IntersectionObserver.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top that is intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Position the sliding indicator behind the active link.
  useEffect(() => {
    const link = linkRefs.current[active];
    const container = containerRef.current;
    if (!link || !container) return;
    const linkRect = link.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setIndicator({
      left: linkRect.left - containerRect.left,
      width: linkRect.width,
    });
  }, [active]);

  return (
    <nav className="pointer-events-none sticky top-0 z-10 flex items-center justify-center px-1 py-4">
      <div
        ref={containerRef}
        className="pointer-events-auto relative flex rounded-full border border-neutral-200 bg-white/70 p-1 shadow-sm backdrop-blur-md"
      >
        <div
          className="absolute top-1 -z-10 h-[calc(100%-0.5rem)] rounded-full bg-neutral-100 transition-[left,width] duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {items.map((item) => (
          <a
            key={item.id}
            ref={(el) => {
              linkRefs.current[item.id] = el;
            }}
            href={`#${item.id}`}
            className={`rounded-full px-3 py-1 text-sm tracking-tight transition-colors focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none ${
              active === item.id
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

import { ChevronDownIcon } from "@heroicons/react/20/solid";

/*
  Section heading — small uppercase eyebrow + serif title with a colored
  underline accent. The `accent` prop maps to a Tailwind decoration color
  picked per section.

  When `collapsible` is true the heading expects to live inside a
  <summary> whose parent <details class="group"> drives the chevron
  rotation via the `group-open:` variant. The whole block stays a div so it
  can be rendered both as a static heading and as a summary child without
  invalid HTML nesting.
*/

type Accent = "teal" | "orange" | "purple" | "rose" | "lime";

const accentDecoration: Record<Accent, string> = {
  teal: "decoration-teal-400",
  orange: "decoration-orange-400",
  purple: "decoration-purple-400",
  rose: "decoration-rose-400",
  lime: "decoration-lime-400",
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  count,
  collapsible = false,
}: {
  eyebrow: string;
  title: string;
  accent: Accent;
  count?: number;
  collapsible?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        collapsible ? "" : "mb-8"
      }`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
          {eyebrow}
        </p>
        <h2
          className={`mt-1 font-serif text-3xl font-normal leading-tight text-neutral-900 underline decoration-4 underline-offset-[6px] sm:text-4xl ${accentDecoration[accent]}`}
        >
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-baseline gap-3">
        {typeof count === "number" && (
          <span className="font-mono text-xs text-neutral-400">
            {String(count).padStart(2, "0")}
          </span>
        )}
        {collapsible && (
          <ChevronDownIcon className="h-4 w-4 self-center text-neutral-400 transition-transform duration-200 group-open:rotate-180" />
        )}
      </div>
    </div>
  );
}

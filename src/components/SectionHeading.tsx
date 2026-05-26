/*
  Section heading — small uppercase eyebrow + serif title with a colored
  underline accent. The `accent` prop maps to a Tailwind decoration color
  picked per section.
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
}: {
  eyebrow: string;
  title: string;
  accent: Accent;
  count?: number;
}) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-4">
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
      {typeof count === "number" && (
        <span className="font-mono text-xs text-neutral-400">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

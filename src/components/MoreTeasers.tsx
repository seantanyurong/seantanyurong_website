import Link from "next/link";
import { groupGear, type GearItem } from "@/lib/gear-core";

/*
  Home-page teasers for the deep-dive pages. Each card is one link, so the
  whole card is the tap target.
*/

const card =
  "group flex flex-col rounded-2xl border border-neutral-200 p-5 transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:p-6";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
      {children}
    </p>
  );
}

function Title({ children, accent }: { children: string; accent: string }) {
  return (
    <h3
      className={`mt-1 font-serif text-2xl leading-tight text-neutral-900 underline decoration-4 underline-offset-[6px] ${accent}`}
    >
      {children}
    </h3>
  );
}

function Cta({ children }: { children: string }) {
  return (
    <span className="mt-auto pt-5 text-sm text-neutral-500 transition-colors group-hover:text-neutral-900">
      {children}{" "}
      <span
        aria-hidden
        className="inline-block transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </span>
  );
}

// Hand-picked items for the Gear card's thumbnails, matched by name.
const FEATURED = ["go pack", "mx anywhere", "yonex", "yamaha"];

// The featured items that have photos, topped up (if any are missing) with
// one photo per category so the card never shows a gap.
function pickPreviews(gear: GearItem[], categories: string[]) {
  const withPhoto = gear.filter((g) => g.image);
  const picked: GearItem[] = [];
  for (const name of FEATURED) {
    const hit = withPhoto.find((g) => g.name.toLowerCase().includes(name));
    if (hit && !picked.includes(hit)) picked.push(hit);
  }
  for (const group of groupGear(withPhoto, categories)) {
    if (picked.length >= 4) break;
    const first = group.items.find((g) => !picked.includes(g));
    if (first) picked.push(first);
  }
  return picked.slice(0, 4);
}

const TOOLS = ["Notion", "AI agent", "Telegram", "Node server", "Google Sheets"];

export function MoreTeasers({
  gear,
  categories,
}: {
  gear: GearItem[];
  categories: string[];
}) {
  const previews = pickPreviews(gear, categories);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link href="/life-os" className={card}>
        <Eyebrow>How I run things</Eyebrow>
        <Title accent="decoration-lime-400">Life OS</Title>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
          My life runs on a small, slightly over-engineered system built
          around daily, weekly, monthly and quarterly rituals.
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {TOOLS.map((t) => (
            <li
              key={t}
              className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600"
            >
              {t}
            </li>
          ))}
        </ul>
        <Cta>See the system</Cta>
      </Link>

      {gear.length > 0 && (
        <Link href="/gear" className={card}>
          <Eyebrow>What I use</Eyebrow>
          <Title accent="decoration-rose-400">Gear</Title>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
            The things I use day to day.
          </p>
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {previews.map((g) => (
                <div
                  key={g.slug}
                  className="aspect-square overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.image!}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <Cta>{`See all ${gear.length}`}</Cta>
        </Link>
      )}
    </div>
  );
}

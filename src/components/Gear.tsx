import { groupGear, type GearItem } from "@/lib/gear-core";

/*
  Gear — four compact columns (two by two on phones): EDC, Setup, Travel,
  Motorcycle. Item name (linked when there's a link) with a short note and,
  when the Notion row has an Image link, a small product photo.
  Sourced from the Notion "Gear" database.
*/
export function Gear({ items }: { items: GearItem[] }) {
  const groups = groupGear(items);
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-3 border-b border-neutral-100 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
            {group.category}
          </h3>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item.slug} className="flex items-start gap-3">
                {item.image && (
                  // Plain <img>: product photos are hot-linked from the maker's
                  // site, so there's nothing for next/image to optimise.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg border border-neutral-100 bg-neutral-50 object-contain p-1"
                  />
                )}
                <div className="min-w-0">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[15px] text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
                    >
                      {item.name}
                      <span aria-hidden className="ml-1 text-neutral-500">↗</span>
                    </a>
                  ) : (
                    <span className="text-[15px] text-neutral-900">{item.name}</span>
                  )}
                  {item.note && (
                    <p className="mt-0.5 text-sm leading-snug text-neutral-500">
                      {item.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

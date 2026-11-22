import { groupGear, type GearItem } from "@/lib/gear-core";

/*
  Gear — four compact columns (two by two on phones): EDC, Setup, Travel,
  Motorcycle. Item name (linked when there's a link) with a short note.
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
              <li key={item.slug}>
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

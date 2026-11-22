import { groupGear, type GearItem } from "@/lib/gear-core";

/*
  Gear — one row per category (EDC, Setup, Travel, Motorcycle), each a shelf
  of square tiles: product photo (or the item's initial until there is one),
  then the name (linked when there's a link) and a short note.
  Sourced from the Notion "Gear" database.
*/

function Tile({ item }: { item: GearItem }) {
  const square = (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 transition-colors group-hover:border-neutral-300">
      {item.image ? (
        // Plain <img>: product photos are hot-linked from the maker's site,
        // so there's nothing for next/image to optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-4 mix-blend-multiply"
        />
      ) : (
        <span aria-hidden className="font-serif text-4xl text-neutral-300">
          {item.name.charAt(0)}
        </span>
      )}
    </div>
  );

  const caption = (
    <div className="mt-2">
      <p className="text-sm text-neutral-900">
        {item.name}
        {item.link && (
          <span aria-hidden className="ml-1 text-neutral-500">↗</span>
        )}
      </p>
      {item.note && (
        <p className="mt-0.5 text-sm leading-snug text-neutral-500">
          {item.note}
        </p>
      )}
    </div>
  );

  return item.link ? (
    <a href={item.link} target="_blank" rel="noreferrer" className="group block">
      {square}
      {caption}
    </a>
  ) : (
    <div>
      {square}
      {caption}
    </div>
  );
}

export function Gear({ items }: { items: GearItem[] }) {
  const groups = groupGear(items);
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
            {group.category}
            <span aria-hidden className="h-px flex-1 bg-neutral-100" />
          </h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Tile item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

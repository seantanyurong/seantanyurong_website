import { groupGear, type GearItem } from "@/lib/gear-core";
import { GearRow } from "./GearRow";

/*
  Gear — one swipeable row per category (in Notion's option order) of
  square tiles: product photo (or the item's initial until there is one),
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

export function Gear({ items, categories }: { items: GearItem[]; categories: string[] }) {
  const groups = groupGear(items, categories);
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <GearRow key={group.category} title={group.category}>
          {group.items.map((item) => (
            <li
              key={item.slug}
              className="w-[calc((100%-2rem)/2.3)] flex-none snap-start sm:w-40"
            >
              <Tile item={item} />
            </li>
          ))}
        </GearRow>
      ))}
    </div>
  );
}

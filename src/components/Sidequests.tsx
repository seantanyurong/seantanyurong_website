import {
  groupSidequests,
  type Sidequest,
} from "@/lib/sidequests-core";

/*
  Sidequests, grouped so what I'm doing and what I've finished aren't buried
  under the bucket list:
  - Now / Done: rows with the quarter on the right.
  - Someday: compact wrapped chips.
  Sourced from Notion and sorted in the loader by status + recency.
*/

function GroupLabel({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-neutral-400">
      {children}
    </h3>
  );
}

function Rows({ items }: { items: Sidequest[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((s) => (
        <li
          key={s.slug}
          className="flex items-baseline justify-between gap-6 py-3"
        >
          <span className="text-[15px] text-neutral-900">{s.title}</span>
          {s.quarter && (
            <span className="shrink-0 font-mono text-xs text-neutral-400">
              {s.quarter}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Sidequests({ items }: { items: Sidequest[] }) {
  const { now, done, someday } = groupSidequests(items);
  return (
    <div className="space-y-10">
      {now.length > 0 && (
        <div>
          <GroupLabel>Now</GroupLabel>
          <Rows items={now} />
        </div>
      )}
      {done.length > 0 && (
        <div>
          <GroupLabel>Done</GroupLabel>
          <Rows items={done} />
        </div>
      )}
      {someday.length > 0 && (
        <div>
          <GroupLabel>Someday</GroupLabel>
          <ul className="flex flex-wrap gap-2">
            {someday.map((s) => (
              <li
                key={s.slug}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700"
              >
                {s.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

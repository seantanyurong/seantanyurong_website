import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { getGear } from "@/lib/gear";
import { groupGear } from "@/lib/gear-core";

export const metadata: Metadata = {
  title: "Gear · Sean Tan",
  description: "The things I carry, ride and work with.",
};

// Re-fetch from Notion at most once a day.
export const revalidate = 86400;

export default async function GearPage() {
  const groups = groupGear(await getGear());

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-8 sm:px-8 sm:pt-12">
      <Link
        href="/"
        className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-900"
      >
        ← Sean Tan
      </Link>

      <div className="mt-10">
        <SectionHeading eyebrow="What I use" title="Gear" accent="rose" />
      </div>

      {groups.length === 0 ? (
        <p className="text-[15px] text-neutral-600">
          Still putting this list together — check back soon.
        </p>
      ) : (
        <div className="space-y-12 pb-20">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-600">
                {group.category}
                <span aria-hidden className="h-px flex-1 bg-neutral-100" />
              </h2>
              <ul className="divide-y divide-neutral-100">
                {group.items.map((item) => (
                  <li key={item.slug} className="py-3">
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
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                        {item.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Footer />
    </main>
  );
}

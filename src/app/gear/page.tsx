import type { Metadata } from "next";
import { SubPage } from "@/components/SubPage";
import { SectionHeading } from "@/components/SectionHeading";
import { Gear } from "@/components/Gear";
import { getGear } from "@/lib/gear";

// Re-fetch gear from Notion at most once a day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Gear · Sean Tan",
  description: "The things Sean uses day to day.",
};

export default async function GearPage() {
  const gear = await getGear();
  return (
    <SubPage>
      <SectionHeading
        as="h1"
        eyebrow="What I use"
        title="Gear"
        accent="rose"
        count={gear.items.length}
      />
      {gear.items.length > 0 ? (
        <Gear items={gear.items} categories={gear.categories} />
      ) : (
        <p className="text-[15px] text-neutral-500">Nothing here yet.</p>
      )}
    </SubPage>
  );
}

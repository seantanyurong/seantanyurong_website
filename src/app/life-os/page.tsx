import type { Metadata } from "next";
import { SubPage } from "@/components/SubPage";
import { SectionHeading } from "@/components/SectionHeading";
import { LifeOsDiagram } from "@/components/LifeOsDiagram";
import { INTRO } from "@/lib/life-os";

export const metadata: Metadata = {
  title: "Life OS · Sean Tan",
  description:
    "How Sean runs his life: Notion as the database, an AI agent and a server to maintain it, and rituals on top.",
};

export default function LifeOsPage() {
  return (
    <SubPage>
      <SectionHeading as="h1" eyebrow="How I run things" title="Life OS" accent="lime" />
      <p className="mb-8 max-w-prose text-[15px] leading-relaxed text-neutral-700">
        {INTRO}
      </p>
      <LifeOsDiagram />
    </SubPage>
  );
}

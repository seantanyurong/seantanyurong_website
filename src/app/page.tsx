import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { TeamList } from "@/components/TeamList";
import { BucketList } from "@/components/BucketList";
import { Footer } from "@/components/Footer";
import { getProjects, getTeam, getBucketList } from "@/lib/content";

export default async function HomePage() {
  const [projects, team, bucket] = await Promise.all([
    getProjects(),
    getTeam(),
    getBucketList(),
  ]);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-6 sm:px-8 lg:max-w-5xl">
        <Hero />

        <section id="projects" className="scroll-mt-24 pb-20">
          <SectionHeading
            eyebrow="Built"
            title="Projects"
            accent="orange"
            count={projects.length}
          />
          <ProjectsGrid projects={projects} />
        </section>

        <section id="team" className="scroll-mt-24 pb-20">
          <SectionHeading eyebrow="Building with" title="Team" accent="teal" />
          <TeamList items={team} />
        </section>

        <section id="bucket-list" className="scroll-mt-24 pb-20">
          <SectionHeading
            eyebrow="Side quests"
            title="Bucket List"
            accent="purple"
            count={bucket.length}
          />
          <BucketList items={bucket} />
        </section>

        <Footer />
      </main>
    </>
  );
}

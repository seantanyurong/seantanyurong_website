import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { BucketList } from "@/components/BucketList";
import { Footer } from "@/components/Footer";
import { getProjects, getBucketList } from "@/lib/content";

export default async function HomePage() {
  const [projects, bucket] = await Promise.all([
    getProjects(),
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

import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Sidequests } from "@/components/Sidequests";
import { Footer } from "@/components/Footer";
import { getProjects, getSidequests } from "@/lib/content";

export default async function HomePage() {
  const [projects, sidequests] = await Promise.all([
    getProjects(),
    getSidequests(),
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

        <section id="sidequests" className="scroll-mt-24 pb-20">
          <SectionHeading
            eyebrow="On the list"
            title="Sidequests"
            accent="purple"
            count={sidequests.length}
          />
          <Sidequests items={sidequests} />
        </section>

        <Footer />
      </main>
    </>
  );
}

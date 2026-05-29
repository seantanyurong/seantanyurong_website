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
          <details
            open
            className="group/section [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="mb-8 cursor-pointer list-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <SectionHeading
                eyebrow="Built"
                title="Projects"
                accent="orange"
                count={projects.length}
                collapsible
              />
            </summary>
            <ProjectsGrid projects={projects} />
            <p className="mt-6 text-sm text-neutral-500">
              These are just a few — the rest live on{" "}
              <a
                href="https://github.com/seantanyurong"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-900"
              >
                GitHub
              </a>
              .
            </p>
          </details>
        </section>

        <section id="sidequests" className="scroll-mt-24 pb-20">
          <details
            open
            className="group/section [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="mb-8 cursor-pointer list-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <SectionHeading
                eyebrow="On the list"
                title="Sidequests"
                accent="purple"
                count={sidequests.length}
                collapsible
              />
            </summary>
            <Sidequests items={sidequests} />
          </details>
        </section>

        <Footer />
      </main>
    </>
  );
}

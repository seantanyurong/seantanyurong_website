import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SectionHeading } from "@/components/SectionHeading";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Sidequests } from "@/components/Sidequests";
import { Footer } from "@/components/Footer";
import { PlacesMap } from "@/components/PlacesMap";
import { LifeOsDiagram } from "@/components/LifeOsDiagram";
import { INTRO } from "@/lib/life-os";
import { getProjects } from "@/lib/content";
import { getPlacePins } from "@/lib/places";
import { getSidequests } from "@/lib/sidequests";

// Re-fetch trips and sidequests from Notion at most once a day.
export const revalidate = 86400;

export default async function HomePage() {
  const [projects, sidequests, pins] = await Promise.all([
    getProjects(),
    getSidequests(),
    getPlacePins(),
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

        {sidequests.length > 0 && (
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
        )}

        <section id="life-os" className="scroll-mt-24 pb-20">
          <details
            open
            className="group/section [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="mb-8 cursor-pointer list-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <SectionHeading
                eyebrow="How I run things"
                title="Life OS"
                accent="lime"
                collapsible
              />
            </summary>
            <p className="mb-8 max-w-prose text-[15px] leading-relaxed text-neutral-700">
              {INTRO}
            </p>
            <LifeOsDiagram />
          </details>
        </section>

        {pins.length > 0 && (
          <section id="places" className="scroll-mt-24 pb-20">
            <details
              open
              className="group/section [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="mb-8 cursor-pointer list-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                <SectionHeading
                  eyebrow="Been there"
                  title="Places"
                  accent="teal"
                  count={pins.length}
                  collapsible
                />
              </summary>
              <PlacesMap pins={pins} />
            </details>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}

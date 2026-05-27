/*
  Hero — large serif name, short tagline, intro paragraph.
  Mirrors the restraint of jordienric.com with chester.how's serif/sans contrast.
*/
export function Hero() {
  return (
    <section id="top" className="fade-up pt-8 pb-20 sm:pt-12">
      <h1 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl">
        Sean Tan
      </h1>
      <p className="mt-3 text-base text-neutral-500 sm:text-lg">
        Software Engineer + Side Quester from Singapore.
      </p>
      <div className="mt-8 max-w-prose space-y-4 text-[15px] leading-relaxed text-neutral-700">
        <p>
          I&apos;m a senior software engineer at{' '}
          <a
            href="https://constructor.io"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
          >
            Constructor
          </a>
          , where I help build AI-powered product search and discovery for
          ecommerce. Outside of work, I&apos;m CTO of{' '}
          <a
            href="https://jobless.club"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
          >
            The Jobless Club
          </a>
          , a Singaporean indie-hacking team behind a few bootstrapped
          businesses — including the country&apos;s #1 knife-sharpening service.
        </p>
        <p>
          Studied in NUS Computing (Honors), and spent a year on exchange in
          Silicon Valley. Top 3% freelancer on Upwork with $50k+ earned.
          Featured on{' '}
          <a
            href="https://www.channelnewsasia.com/watch/money-mind-2026/jobless-club-5789621"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
          >
            Channel News Asia
          </a>
          . Neovim lover.
        </p>
        <p>
          I&apos;m at my best when dropped into unfamiliar problems and asked to
          figure them out.
        </p>
      </div>
    </section>
  );
}

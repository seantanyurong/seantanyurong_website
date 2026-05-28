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
      <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
        <a
          href="https://github.com/seantanyurong"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 transition-colors hover:text-neutral-900"
        >
          <GitHubMark className="h-4 w-4" />
          <span className="underline decoration-neutral-300 underline-offset-4 transition-colors group-hover:decoration-neutral-900">
            GitHub
          </span>
        </a>
        <a
          href="https://www.linkedin.com/in/seantanyurong/"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 transition-colors hover:text-neutral-900"
        >
          <LinkedInMark className="h-4 w-4" />
          <span className="underline decoration-neutral-300 underline-offset-4 transition-colors group-hover:decoration-neutral-900">
            LinkedIn
          </span>
        </a>
      </div>
    </section>
  );
}

/* Brand marks — Heroicons doesn't ship these, so we inline minimal SVGs.
   Both use currentColor so they pick up the link's text color on hover. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.03c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.39.97.01 1.95.14 2.86.39 2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.86 3.37-1.86 3.6 0 4.27 2.37 4.27 5.45v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .78 0 1.74v20.52C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
    </svg>
  );
}

/*
  Footer — single LinkedIn link, carried over from the Astro site.
*/
export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-100 py-10 text-center text-xs text-neutral-400">
      <a
        href="https://www.linkedin.com/in/seantanyurong/"
        target="_blank"
        rel="noreferrer"
        className="font-medium tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f57111] to-[#f79605] hover:underline"
      >
        Message me on LinkedIn
      </a>
      <p className="mt-3 font-mono text-[11px] text-neutral-300">
        © {new Date().getFullYear()} Sean Tan
      </p>
    </footer>
  );
}

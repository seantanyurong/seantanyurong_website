import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

/*
  Shell for the deep-dive pages (Life OS, Gear): same nav and footer as the
  home page, plus a quiet way back.
*/
export function SubPage({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-6 sm:px-8 lg:max-w-5xl">
        <div className="fade-up pt-8 pb-20 sm:pt-12">
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            ← Home
          </Link>
          {children}
        </div>
        <Footer />
      </main>
    </>
  );
}

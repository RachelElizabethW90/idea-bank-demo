"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const inSettings = pathname?.startsWith("/settings");

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="border-b border-[color:var(--border)] bg-[color:var(--muted-bg,transparent)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-2 text-xs text-[color:var(--muted)] flex items-center justify-between gap-3">
          <span>Demo version — your data stays in your browser.</span>
          <a
            href="https://github.com/RachelElizabethW90/idea-bank-demo#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[color:var(--foreground)] whitespace-nowrap"
          >
            What is this?
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-10 bg-[color:var(--background)]/90 backdrop-blur border-b border-[color:var(--border)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight no-underline"
          >
            Idea Bank
          </Link>
          <nav className="text-sm">
            <Link
              href={inSettings ? "/" : "/settings"}
              className="text-[color:var(--muted)] hover:text-[color:var(--foreground)] no-underline"
            >
              {inSettings ? "Back to ideas" : "Settings"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}

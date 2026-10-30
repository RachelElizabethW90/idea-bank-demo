import { Suspense } from "react";
import IdeaDetailClient from "./IdeaDetailClient";

export default function IdeaDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-6">
          <p className="text-sm text-[color:var(--muted)]">Loading idea…</p>
        </main>
      }
    >
      <IdeaDetailClient />
    </Suspense>
  );
}

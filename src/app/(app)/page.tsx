import { Suspense } from "react";

import { PendencyBoard } from "~/app/(app)/_components/pendencies/pendency-board";
import { api, HydrateClient } from "~/trpc/server";

export default async function HomePage() {
  void api.pendency.list.prefetch({});

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="-m-4 flex h-full min-h-0 flex-1 items-center justify-center sm:-m-6 md:-m-8">
            <p className="text-calendar-muted">Carregando pendências…</p>
          </div>
        }
      >
        <PendencyBoard />
      </Suspense>
    </HydrateClient>
  );
}

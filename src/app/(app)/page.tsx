import { PendencyBoard } from "~/app/(app)/_components/pendencies/pendency-board";
import { api, HydrateClient } from "~/trpc/server";

export default async function HomePage() {
  void api.pendency.list.prefetch({});

  return (
    <HydrateClient>
      <PendencyBoard />
    </HydrateClient>
  );
}

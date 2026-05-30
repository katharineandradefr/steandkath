import { CalendarDashboard } from "~/app/(app)/calendario/_components/calendar-dashboard";
import { api, HydrateClient } from "~/trpc/server";

export default async function CalendarioPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  void api.goal.listByMonth.prefetch({ year, month });
  void api.goal.listByWeek.prefetch({
    referenceDate: new Date(Date.UTC(year, month - 1, 15)),
  });

  return (
    <HydrateClient>
      <CalendarDashboard initialYear={year} initialMonth={month} />
    </HydrateClient>
  );
}

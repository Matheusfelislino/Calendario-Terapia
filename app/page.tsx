import { prisma } from "@/lib/prisma";
import MainLayout from "@/components/layout/main-layout";
import WeekCalendar from "@/components/calendar/week-calendar";
import { startOfWeek, endOfWeek } from "date-fns";

export default async function Page() {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(today, { weekStartsOn: 0 });

  // Get sessions for current week
  const sessions = await prisma.session.findMany({
    where: {
      startDate: { gte: start },
      endDate: { lte: end },
    },
    orderBy: { startDate: 'asc' },
  });

  return (
    <MainLayout>
      <WeekCalendar initialDate={today} initialSessions={sessions} />
    </MainLayout>
  );
}
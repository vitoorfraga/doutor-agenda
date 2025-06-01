import dayjs from "dayjs";
import { and, count, eq, gte, lte, sum } from "drizzle-orm";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { StatsCards } from "../appointments/_components/stats-card";
// import { StatsCards } from "../appointments/_components/stats-card";
import { DatePicker } from "./_components/date-picker";

export const metadata: Metadata = {
  title: "Dashboard | Doutor Agenda",
};

interface DashboardPageProps {
  searchParams: Promise<{ from: string; to: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/authentication");
  }

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  console.log(clinics);

  if (clinics.length === 0) {
    return redirect("/clinic-form");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  console.log(`From: ${from}, To: ${to}`);

  const [[totalRevenue], [totalAppointments], [totalPatients], [totalDoctors]] =
    await Promise.all([
      db
        .select({
          total: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinics[0].clinicId),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinics[0].clinicId),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(patientsTable)
        .where(eq(patientsTable.clinicId, clinics[0].clinicId)),
      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.clinicId, clinics[0].clinicId)),
    ]);

  console.log(
    `Total Revenue: ${totalRevenue.total}, Total Appointments: ${totalAppointments.total}, Total Patients: ${totalPatients.total}, Total Doctors: ${totalDoctors.total}`,
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Acesse uma visão geral detalhada das principais métricas e
            resultados dos pacientes
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={Number(totalRevenue.total) || 0}
          totalAppointments={totalAppointments.total || 0}
          totalPatients={totalPatients.total || 0}
          totalDoctors={totalDoctors.total || 0}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

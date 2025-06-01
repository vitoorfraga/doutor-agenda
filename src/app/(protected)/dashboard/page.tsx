import dayjs from "dayjs";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { Calendar } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
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

import { appointmentsTableColumns } from "../appointments/_components/appointments-table-columns";
import { StatsCards } from "../appointments/_components/stats-card";
import { AppointmentsChart } from "./_components/appointments-chart";
// import { StatsCards } from "../appointments/_components/stats-card";
import { DatePicker } from "./_components/date-picker";
import { TopDoctors } from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";

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

  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
  ] = await Promise.all([
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
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .where(
        eq(
          doctorsTable.clinicId,
          session.user.clinic?.id || clinics[0].clinicId,
        ),
      )
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(
            appointmentsTable.clinicId,
            session.user.clinic?.id || clinics[0].clinicId,
          ),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(
          appointmentsTable.clinicId,
          session.user.clinic?.id || clinics[0].clinicId,
        ),
        gte(appointmentsTable.date, new Date()),
        lte(appointmentsTable.date, new Date()),
      ),
      with: {
        patient: true,
        doctor: true,
      },
    }),
  ]);

  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

  console.log("Chart date range:", {
    start: chartStartDate,
    end: chartEndDate,
    startFormatted: dayjs(chartStartDate).format("YYYY-MM-DD HH:mm:ss"),
    endFormatted: dayjs(chartEndDate).format("YYYY-MM-DD HH:mm:ss"),
  });

  if (!session.user.clinic?.id) {
    throw new Error("Usuário não possui clínica associada");
  }

  const dailyAppointmentsData = await db
    .select({
      date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
      appointments: count(appointmentsTable.id),
      revenue:
        sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
          "revenue",
        ),
    })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(appointmentsTable.date, chartStartDate),
        lte(appointmentsTable.date, chartEndDate),
      ),
    )
    .groupBy(sql`DATE(${appointmentsTable.date})`)
    .orderBy(sql`DATE(${appointmentsTable.date})`);

  console.log("Top Doctors:", topDoctors);
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

        <div className="grid grid-cols-[2.24fr_1fr] gap-4">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <TopDoctors doctors={topDoctors} />
        </div>

        <div className="grid grid-cols-[2.24fr_1fr] gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground" />
                <CardTitle className="text-base">
                  Agendamentos de hoje
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={appointmentsTableColumns}
                data={todayAppointments}
              />
            </CardContent>
          </Card>
          <TopSpecialties topSpecialties={topSpecialties} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

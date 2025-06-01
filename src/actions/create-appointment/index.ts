"use server";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createAppointmentSchema } from "./schema";

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado.");
    }

    if (!session?.user?.clinic?.clinicId) {
      throw new Error("Clínica não encontrada.");
    }

    const clinicId = session.user.clinic.clinicId;

    // Criar o timestamp combinando data e hora
    const dateTimeString = `${dayjs(parsedInput.date).format("YYYY-MM-DD")} ${parsedInput.time}`;
    const appointmentDateTime = dayjs(dateTimeString).toDate();

    // Verificar se já existe um agendamento no mesmo horário para o médico
    const existingAppointment = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.doctorId, parsedInput.doctorId),
          eq(appointmentsTable.date, appointmentDateTime),
        ),
      )
      .limit(1);

    if (existingAppointment.length > 0) {
      throw new Error(
        "Já existe um agendamento neste horário para este médico.",
      );
    }

    await db.insert(appointmentsTable).values({
      clinicId,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      date: appointmentDateTime,
    });

    revalidatePath("/appointments");
  });

"use client";

import "dayjs/locale/pt-br";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { appointmentsTable } from "@/db/schema";

import { AppointmentsTableActions } from "./appointments-table-actions";

dayjs.locale("pt-br");

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    name: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Médico",
  },
  {
    id: "specialty",
    accessorKey: "doctor.specialty",
    header: "Especialidade",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data",
    cell: (params) => {
      const appointment = params.row.original;
      return dayjs(appointment.date).format("DD [de] MMMM [de] YYYY");
    },
  },
  {
    id: "time",
    accessorKey: "date",
    header: "Horário",
    cell: (params) => {
      const appointment = params.row.original;
      return dayjs(appointment.date).format("HH:mm");
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];

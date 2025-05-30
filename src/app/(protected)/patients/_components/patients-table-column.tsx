"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { PatternFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { patientsTable } from "@/db/schema";

type Patient = typeof patientsTable.$inferSelect;

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "select",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Número do Telefone",
    cell: (params) => {
      const patient = params.row.original;
      return (
        <PatternFormat
          value={patient.phoneNumber}
          format="(##) #####-####"
          mask="_"
          displayType="text"
        />
      );
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

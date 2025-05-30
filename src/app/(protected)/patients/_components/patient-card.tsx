"use client";

import { Eye, MailIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { patientsTable } from "@/db/schema";

import UpsertPatientForm from "./upsert-patient-form";

interface PatientCardProps {
  patient: typeof patientsTable.$inferSelect;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSexLabel = (sex: "male" | "female") => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  const getSexColor = (sex: "male" | "female") => {
    return sex === "male"
      ? "bg-blue-100 text-blue-800"
      : "bg-pink-100 text-pink-800";
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{patient.name}</h3>
            <Badge
              variant="secondary"
              className={`mt-1 ${getSexColor(patient.sex)}`}
            >
              {getSexLabel(patient.sex)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <MailIcon className="h-4 w-4" />
          <span className="truncate">{patient.email}</span>
        </div>

        <Separator />

        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <PhoneIcon className="h-4 w-4" />
          <span>{patient.phoneNumber}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Dialog
          open={isUpsertPatientDialogOpen}
          onOpenChange={setIsUpsertPatientDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            onSuccess={() => setIsUpsertPatientDialogOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

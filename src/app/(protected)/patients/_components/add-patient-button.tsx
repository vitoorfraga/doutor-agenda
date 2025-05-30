"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertPatientForm from "./upsert-patient-form";

export const AddPatientButton = () => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  return (
    <Dialog
      open={isUpsertPatientDialogOpen}
      onOpenChange={setIsUpsertPatientDialogOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Paciente
        </Button>
      </DialogTrigger>
      <UpsertPatientForm
        isOpen={isUpsertPatientDialogOpen}
        onSuccess={() => setIsUpsertPatientDialogOpen(false)}
      />
    </Dialog>
  );
};

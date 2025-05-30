import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertPatientForm from "./upsert-patient-form";

export const AddPatientButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Paciente
        </Button>
      </DialogTrigger>
      <UpsertPatientForm />
    </Dialog>
  );
};

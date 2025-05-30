"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPatient } from "@/actions/upsert-patient";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patientsTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phoneNumber: z.string().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  sex: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Sexo é obrigatório." }),
  }),
});

interface UpsertPatientFormProps {
  patient?: typeof patientsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertPatientForm = ({ patient, onSuccess }: UpsertPatientFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient?.name ?? "",
      email: patient?.email ?? "",
      phoneNumber: patient?.phoneNumber ?? "",
      sex: patient?.sex ?? undefined,
    },
  });

  const upsertPatientAction = useAction(upsertPatient, {
    onSuccess: () => {
      toast.success(
        patient
          ? "Paciente editado com sucesso."
          : "Paciente adicionado com sucesso.",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error(
        patient ? "Erro ao editar paciente." : "Erro ao adicionar paciente.",
      );
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await upsertPatientAction.executeAsync({
      id: patient?.id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      sex: data.sex,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {patient ? "Editar Paciente" : "Adicionar Paciente"}
        </DialogTitle>
        <DialogDescription>
          {patient
            ? "Edite as informações do paciente."
            : "Adicione um novo paciente à sua clínica."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Paciente</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite o email do paciente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    placeholder="(00) 00000-0000"
                    customInput={Input}
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.formattedValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertPatientAction.isExecuting}
              className="w-full"
            >
              {upsertPatientAction.isExecuting
                ? "Salvando..."
                : patient
                  ? "Salvar Alterações"
                  : "Adicionar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertPatientForm;

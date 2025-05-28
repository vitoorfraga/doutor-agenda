"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createClinic } from "@/actions/create-clinic";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerClinicSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const ClinicForm = () => {
  const form = useForm<z.infer<typeof registerClinicSchema>>({
    resolver: zodResolver(registerClinicSchema),
    defaultValues: {
      name: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof registerClinicSchema>) => {
    try {
      await createClinic(data.name);
      toast.success("Clínica criada com sucesso!");
      form.reset();
    } catch (error) {
      if (isRedirectError(error)) return;
      toast.error("Não foi possível criar sua clínica");
    }
  };
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da clínica" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 animate-spin" />
          )}
          Criar Clínica
        </Button>
      </form>
    </Form>
  );
};

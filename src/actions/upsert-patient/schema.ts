import z from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().optional(),
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

export type UpsertPatientActionSchema = z.infer<typeof upsertPatientSchema>;

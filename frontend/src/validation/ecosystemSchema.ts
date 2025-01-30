import { z } from "zod";

export const ecosystemSchema = z.object({
  id: z.string().min(1, "Ecosystem ID is required"),
  name: z.string().min(1, "Ecosystem name is required"),
});

export type EcosystemFormData = z.infer<typeof ecosystemSchema>;

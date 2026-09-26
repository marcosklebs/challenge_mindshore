import { z } from "zod";

// zod describe la "forma" que tiene que tener el body de cada request,
// y si no coincide, tira un error descriptivo automáticamente
// (en vez de que el código explote más adelante con un mensaje confuso).

export const registerSchema = z.object({
  email: z.string().email("El email no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(1, "El nombre es obligatorio"),
});

export const loginSchema = z.object({
  email: z.string().email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const createCollectionSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const addImageSchema = z.object({
  nasaId: z.string().min(1, "nasaId es obligatorio"),
  title: z.string().min(1, "title es obligatorio"),
  imageUrl: z.string().nullable(),
  dateCreated: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional(),
});

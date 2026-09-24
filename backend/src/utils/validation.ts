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

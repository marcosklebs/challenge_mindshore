import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "../utils/validation";
import { registerUser, loginUser, AuthError } from "../services/authService";

// El controller es la "capa fina" que conecta HTTP con la lógica de negocio:
// lee el request, valida, llama al service, y arma la response.
// No tiene lógica de negocio en sí (eso vive en authService.ts).

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const result = await registerUser(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const result = await loginUser(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

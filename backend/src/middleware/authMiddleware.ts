import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// Extendemos el tipo Request de Express para poder guardar el userId
// autenticado y usarlo después en los controllers (ej: para saber de quién
// es la colección que se está creando).
export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // formato esperado: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No se envió un token de autenticación" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next(); // todo OK, dejamos pasar al siguiente handler (el controller real)
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

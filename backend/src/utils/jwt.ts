import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Lo que guardamos "adentro" del token: solo el id del usuario.
// Nunca guardamos el password ni nada sensible acá, porque un JWT
// NO está encriptado, solo firmado (cualquiera puede leer su contenido
// decodificándolo en base64, pero no puede modificarlo sin invalidar la firma).
export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  // El token expira en 7 días; pasado ese tiempo, el usuario tiene que loguearse de nuevo.
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  // Si el token es inválido o expiró, esto tira una excepción automáticamente
  // (jwt.verify lanza error), que vamos a capturar en el middleware.
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

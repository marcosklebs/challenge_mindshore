import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";
import type { RegisterInput, LoginInput } from "../utils/validation";

// Clase de error simple para poder distinguir "error esperado del negocio"
// (ej: email repetido) de un error real de programación en el controller.
export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("Ya existe una cuenta con ese email", 409);
  }

  // bcrypt.hash "mezcla" el password con un salt random y lo hashea.
  // El "10" es el costo computacional (a más alto, más lento pero más seguro).
  // Nunca se guarda ni se puede recuperar el password original desde el hash.
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
  });

  const token = signToken({ userId: user.id });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Ojo con el mensaje de error: a propósito NO decimos "el email no existe"
  // vs "la contraseña es incorrecta" por separado. Si lo hiciéramos, alguien
  // podría usar eso para averiguar qué emails están registrados (esto se
  // llama "user enumeration" y es una falla de seguridad común).
  if (!user) {
    throw new AuthError("Email o contraseña incorrectos", 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AuthError("Email o contraseña incorrectos", 401);
  }

  const token = signToken({ userId: user.id });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

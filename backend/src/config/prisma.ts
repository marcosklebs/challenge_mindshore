// Creamos UNA sola instancia de PrismaClient para toda la app y la reutilizamos
// en todos lados donde necesitemos hablar con la base de datos. Crear una
// instancia nueva en cada archivo desperdicia conexiones a la DB.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

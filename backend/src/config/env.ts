// Centralizamos la lectura de variables de entorno acá.
// Ventaja: si falta una variable obligatoria, el server no arranca
// y te avisa apenas lo levantás, en vez de fallar más adelante
// en medio de un request con un error confuso.
import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  nasaApiKey: process.env.NASA_API_KEY || "DEMO_KEY",
  openAiApiKey: process.env.OPENAI_API_KEY || null, // null = usamos modo mock
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

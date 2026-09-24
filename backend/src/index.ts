import express from "express";
import cors from "cors";
import { env } from "./config/env";

const app = express();

// Middlewares globales
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

// Ruta de salud: sirve para chequear rápido que el server está vivo
// (y la vamos a usar en docker-compose para el healthcheck)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Acá abajo se van a ir montando las rutas reales:
// app.use("/api/auth", authRouter);
// app.use("/api/collections", collectionsRouter);
// app.use("/api/nasa", nasaRouter);
// app.use("/api/ai", aiRouter);

app.listen(env.port, () => {
  console.log(`Backend corriendo en http://localhost:${env.port}`);
});

export { app };

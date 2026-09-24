import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import nasaRoutes from "./routes/nasaRoutes";
import collectionRoutes from "./routes/collectionRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

// Middlewares globales
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

// Ruta de salud: sirve para chequear rápido que el server está vivo
// (y la vamos a usar en docker-compose para el healthcheck)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/nasa", nasaRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/ai", aiRoutes);

app.listen(env.port, () => {
  console.log(`Backend corriendo en http://localhost:${env.port}`);
});

export { app };

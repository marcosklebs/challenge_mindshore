import { Router } from "express";
import rateLimit from "express-rate-limit";
import { searchImages } from "../controllers/nasaController";

const router = Router();

// Rate limiting específico para proteger la API externa de NASA (lo pide el
// challenge explícitamente: "Rate limiting básico para proteger las llamadas
// a APIs externas"). Es más permisivo que el de auth porque acá esperamos
// que el usuario busque varias veces mientras explora.
const nasaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: { error: "Demasiadas búsquedas, esperá un momento antes de volver a intentar" },
});

// Esta ruta es pública a propósito: dejamos que cualquiera explore imágenes
// sin necesidad de crear cuenta. Solo vamos a pedir login para guardarlas
// en una colección.
router.get("/search", nasaLimiter, searchImages);

export default router;

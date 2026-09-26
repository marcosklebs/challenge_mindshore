import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/authMiddleware";
import * as aiController from "../controllers/aiController";
import * as tagController from "../controllers/tagController";

const router = Router();

router.use(requireAuth);

// La IA es más "cara" (en tiempo y, en un caso real, en dinero), así que le
// ponemos un límite más estricto que al resto de la API.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "Demasiadas solicitudes de IA, esperá un momento" },
});

// Contenido generado por IA (descripción / dato curioso / contexto histórico)
router.post("/images/:imageId/content", aiLimiter, aiController.generateContent);

// Lista global de tags existentes (para el autocompletado del frontend)
router.get("/tags", tagController.listAll);

// Tags manuales
router.get("/images/:imageId/tags", tagController.list);
router.post("/images/:imageId/tags", tagController.addManual);
router.delete("/images/:imageId/tags/:tagId", tagController.remove);

// Tags sugeridos por IA
router.post("/images/:imageId/tags/suggest", aiLimiter, tagController.suggest);

export default router;

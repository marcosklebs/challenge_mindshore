import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/authController";

const router = Router();

// Limitamos intentos de login/registro para dificultar ataques de fuerza bruta:
// máximo 10 intentos cada 15 minutos por IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos, probá de nuevo en unos minutos" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as collectionController from "../controllers/collectionController";

const router = Router();

// requireAuth acá aplica a TODAS las rutas de este archivo, porque lo
// montamos como middleware antes de definir las rutas en sí.
router.use(requireAuth);

router.post("/", collectionController.create);
router.get("/", collectionController.list);
router.get("/:id", collectionController.getOne);
router.patch("/:id", collectionController.update);
router.delete("/:id", collectionController.remove);

router.post("/:id/images", collectionController.addImage);
router.delete("/:id/images/:imageId", collectionController.removeImage);

export default router;

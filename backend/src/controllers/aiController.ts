import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";
import { getOrGenerateContent } from "../services/aiService";
import { AiContentType } from "@prisma/client";

export async function generateContent(req: AuthRequest, res: Response) {
  const { imageId } = req.params;
  const { type } = req.body as { type?: string };

  if (!type || !Object.values(AiContentType).includes(type as AiContentType)) {
    return res.status(400).json({
      error: `type debe ser uno de: ${Object.values(AiContentType).join(", ")}`,
    });
  }

  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) {
    return res.status(404).json({ error: "Imagen no encontrada" });
  }

  try {
    const content = await getOrGenerateContent(imageId, type as AiContentType, image.title);
    return res.status(200).json(content);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "No se pudo generar el contenido con IA" });
  }
}

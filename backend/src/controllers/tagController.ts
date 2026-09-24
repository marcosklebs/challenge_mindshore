import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import * as tagService from "../services/tagService";
import { TagError } from "../services/tagService";

function handleError(err: unknown, res: Response) {
  if (err instanceof TagError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const tags = await tagService.listTagsForImage(req.params.imageId);
    return res.status(200).json(tags);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function addManual(req: AuthRequest, res: Response) {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre del tag es obligatorio" });
  }
  try {
    const imageTag = await tagService.addManualTag(req.params.imageId, name);
    return res.status(201).json(imageTag);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await tagService.removeTag(req.params.imageId, req.params.tagId);
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res);
  }
}

export async function suggest(req: AuthRequest, res: Response) {
  try {
    const suggestions = await tagService.generateAiTagSuggestions(req.params.imageId);
    return res.status(201).json(suggestions);
  } catch (err) {
    return handleError(err, res);
  }
}

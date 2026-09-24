import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import {
  createCollectionSchema,
  updateCollectionSchema,
  addImageSchema,
} from "../utils/validation";
import * as collectionService from "../services/collectionService";
import { CollectionError } from "../services/collectionService";

// Pequeño helper para no repetir el mismo try/catch en cada función:
// captura errores esperados (CollectionError, con su propio status code)
// y errores inesperados (500).
function handleError(err: unknown, res: Response) {
  if (err instanceof CollectionError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export async function create(req: AuthRequest, res: Response) {
  const parsed = createCollectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  try {
    const collection = await collectionService.createCollection(
      req.userId!,
      parsed.data.name,
      parsed.data.description
    );
    return res.status(201).json(collection);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const collections = await collectionService.listCollections(req.userId!);
    return res.status(200).json(collections);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const collection = await collectionService.getCollectionWithImages(
      req.userId!,
      req.params.id
    );
    return res.status(200).json(collection);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function update(req: AuthRequest, res: Response) {
  const parsed = updateCollectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  try {
    const collection = await collectionService.updateCollection(
      req.userId!,
      req.params.id,
      parsed.data
    );
    return res.status(200).json(collection);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await collectionService.deleteCollection(req.userId!, req.params.id);
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res);
  }
}

export async function addImage(req: AuthRequest, res: Response) {
  const parsed = addImageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  try {
    const image = await collectionService.addImageToCollection(
      req.userId!,
      req.params.id,
      parsed.data
    );
    return res.status(201).json(image);
  } catch (err) {
    return handleError(err, res);
  }
}

export async function removeImage(req: AuthRequest, res: Response) {
  try {
    await collectionService.removeImageFromCollection(
      req.userId!,
      req.params.id,
      req.params.imageId
    );
    return res.status(204).send();
  } catch (err) {
    return handleError(err, res);
  }
}

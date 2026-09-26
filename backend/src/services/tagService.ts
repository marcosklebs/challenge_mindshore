import { prisma } from "../config/prisma";
import { suggestTagsForImage } from "./aiService";

export class TagError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

async function getImageOrThrow(imageId: string) {
  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) throw new TagError("Imagen no encontrada", 404);
  return image;
}

// Lista TODOS los tags que existen en el sistema (sin filtrar por imagen).
// Se usa para el autocompletado al agregar un tag manual, así el usuario
// puede reutilizar un tag que ya creó antes en vez de escribirlo de nuevo.
export async function listAllTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export async function listTagsForImage(imageId: string) {
  await getImageOrThrow(imageId);
  return prisma.imageTag.findMany({
    where: { imageId },
    include: { tag: true },
  });
}

export async function addManualTag(imageId: string, tagName: string) {
  await getImageOrThrow(imageId);
  const normalized = tagName.trim().toLowerCase();

  // "upsert" para reutilizar el tag si ya existe (ej: otra imagen ya tiene el tag "Marte")
  const tag = await prisma.tag.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });

  return prisma.imageTag.upsert({
    where: { imageId_tagId: { imageId, tagId: tag.id } },
    update: {},
    create: { imageId, tagId: tag.id, suggestedByAi: false },
    include: { tag: true },
  });
}

export async function removeTag(imageId: string, tagId: string) {
  await getImageOrThrow(imageId);
  await prisma.imageTag.delete({ where: { imageId_tagId: { imageId, tagId } } });
}

// Pide sugerencias a la IA (o al modo mock) y las guarda directamente como
// tags con suggestedByAi=true, para que el usuario las vea y decida si
// las deja o las borra (en vez de mostrarlas "flotando" sin persistir).
export async function generateAiTagSuggestions(imageId: string) {
  const image = await getImageOrThrow(imageId);
  const suggested = await suggestTagsForImage(image.title, image.keywords);

  const results = [];
  for (const name of suggested) {
    const normalized = name.trim().toLowerCase();
    if (!normalized) continue;
    const tag = await prisma.tag.upsert({
      where: { name: normalized },
      update: {},
      create: { name: normalized },
    });
    const imageTag = await prisma.imageTag.upsert({
      where: { imageId_tagId: { imageId, tagId: tag.id } },
      update: {},
      create: { imageId, tagId: tag.id, suggestedByAi: true },
      include: { tag: true },
    });
    results.push(imageTag);
  }
  return results;
}

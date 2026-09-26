import { prisma } from "../config/prisma";

export class CollectionError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export async function createCollection(userId: string, name: string, description?: string) {
  return prisma.collection.create({
    data: { userId, name, description },
  });
}

export async function listCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      // "_count" nos trae solo la cantidad total de imágenes, sin traerlas
      // todas (más liviano para una lista).
      _count: { select: { images: true } },
      // Además traemos hasta 3 imágenes (las primeras agregadas) para
      // mostrar como "preview" miniatura en la tarjeta de la colección.
      images: {
        take: 3,
        orderBy: { addedAt: "asc" },
        select: { image: { select: { imageUrl: true } } },
      },
    },
  });
}

// Función auxiliar reutilizada por get/update/delete/addImage: busca la
// colección y valida que sea del usuario logueado. Si no existe o es de
// otro usuario, tiramos el mismo error (404) a propósito: así no revelamos
// a un atacante si el ID existe pero es de otra persona.
async function getOwnedCollectionOrThrow(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.userId !== userId) {
    throw new CollectionError("Colección no encontrada", 404);
  }
  return collection;
}

export async function getCollectionWithImages(userId: string, collectionId: string) {
  await getOwnedCollectionOrThrow(userId, collectionId);

  return prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      images: {
        include: { image: { include: { tags: { include: { tag: true } } } } },
        orderBy: { addedAt: "desc" },
      },
    },
  });
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name?: string; description?: string }
) {
  await getOwnedCollectionOrThrow(userId, collectionId);
  return prisma.collection.update({ where: { id: collectionId }, data });
}

export async function deleteCollection(userId: string, collectionId: string) {
  await getOwnedCollectionOrThrow(userId, collectionId);
  await prisma.collection.delete({ where: { id: collectionId } });
}

// Datos mínimos de una imagen de NASA necesarios para guardarla por primera vez
export interface NasaImageInput {
  nasaId: string;
  title: string;
  imageUrl: string | null;
  dateCreated?: string | null;
  keywords?: string[];
}

export async function addImageToCollection(
  userId: string,
  collectionId: string,
  imageInput: NasaImageInput
) {
  await getOwnedCollectionOrThrow(userId, collectionId);

  // "upsert" = si ya existe una Image con ese nasaId la reutiliza, si no la crea.
  // Esto evita duplicar la misma foto de NASA en la tabla Image cuando distintos
  // usuarios (o distintas colecciones del mismo usuario) guardan la misma imagen.
  const image = await prisma.image.upsert({
    where: { nasaId: imageInput.nasaId },
    update: {},
    create: {
      nasaId: imageInput.nasaId,
      title: imageInput.title,
      imageUrl: imageInput.imageUrl ?? "",
      dateCreated: imageInput.dateCreated ? new Date(imageInput.dateCreated) : null,
      keywords: imageInput.keywords ?? [],
    },
  });

  // "upsert" de nuevo acá: si esa imagen ya estaba en esa colección, no falla,
  // simplemente no hace nada (evita error de clave duplicada).
  await prisma.collectionImage.upsert({
    where: { collectionId_imageId: { collectionId, imageId: image.id } },
    update: {},
    create: { collectionId, imageId: image.id },
  });

  return image;
}

export async function removeImageFromCollection(
  userId: string,
  collectionId: string,
  imageId: string
) {
  await getOwnedCollectionOrThrow(userId, collectionId);
  await prisma.collectionImage.delete({
    where: { collectionId_imageId: { collectionId, imageId } },
  });
}

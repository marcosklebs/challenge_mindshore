// Tipos que reflejan las formas de datos que devuelve nuestro backend.
// Tenerlos centralizados evita repetir estas formas en cada componente.

export interface NasaImageResult {
  nasaId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  dateCreated: string | null;
  center: string | null;
  keywords: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { images: number };
  // Preview: hasta 3 imágenes de la colección, solo la URL (para miniaturas)
  images?: { image: { imageUrl: string } }[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface ImageTagEntry {
  tagId: string;
  suggestedByAi: boolean;
  tag: Tag;
}

export interface SavedImage {
  id: string;
  nasaId: string;
  title: string;
  imageUrl: string;
  dateCreated: string | null;
  tags: ImageTagEntry[];
}

export interface CollectionImageEntry {
  imageId: string;
  addedAt: string;
  image: SavedImage;
}

export interface CollectionDetail extends Collection {
  images: CollectionImageEntry[];
}

export interface AiContent {
  id: string;
  type: "DESCRIPTION" | "FUN_FACT" | "HISTORICAL_CONTEXT";
  content: string;
  isMocked: boolean;
}

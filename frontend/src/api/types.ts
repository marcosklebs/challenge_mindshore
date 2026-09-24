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
}

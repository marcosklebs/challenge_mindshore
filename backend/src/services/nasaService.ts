// Servicio para la NASA Image and Video Library (images-api.nasa.gov).
// Esta API es pública y NO requiere API key, a diferencia de otras APIs de NASA.
// Usamos el "fetch" global de Node (disponible desde Node 18+), así que no
// necesitamos instalar ninguna librería HTTP adicional.

const NASA_IMAGES_BASE_URL = "https://images-api.nasa.gov";

export interface NasaSearchParams {
  q?: string; // texto libre de búsqueda
  center?: string; // ej: "JPL", "KSC"
  yearStart?: string;
  yearEnd?: string;
  page?: number;
}

export interface NormalizedNasaImage {
  nasaId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  dateCreated: string | null;
  center: string | null;
  keywords: string[];
}

// Tipos mínimos de la respuesta cruda de NASA (solo lo que usamos)
interface NasaRawItem {
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    date_created?: string;
    center?: string;
    keywords?: string[];
    media_type: string;
  }>;
  links?: Array<{ href: string; rel: string }>;
}

interface NasaRawResponse {
  collection: {
    items: NasaRawItem[];
    metadata: { total_hits: number };
  };
}

export async function searchNasaImages(params: NasaSearchParams) {
  const url = new URL(`${NASA_IMAGES_BASE_URL}/search`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.center) url.searchParams.set("center", params.center);
  if (params.yearStart) url.searchParams.set("year_start", params.yearStart);
  if (params.yearEnd) url.searchParams.set("year_end", params.yearEnd);
  url.searchParams.set("media_type", "image"); // solo nos interesan imágenes, no videos
  url.searchParams.set("page", String(params.page ?? 1));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Error consultando la API de NASA: ${response.status}`);
  }

  const raw = (await response.json()) as NasaRawResponse;

  // La respuesta cruda de NASA es un poco incómoda de usar directamente en el
  // frontend (data es un array, los links son otro array separado), así que
  // la "normalizamos" acá a una forma simple y consistente.
  const results: NormalizedNasaImage[] = raw.collection.items
    .filter((item) => item.data.length > 0)
    .map((item) => {
      const data = item.data[0];
      const preview = item.links?.find((link) => link.rel === "preview");
      return {
        nasaId: data.nasa_id,
        title: data.title,
        description: data.description ?? null,
        imageUrl: preview?.href ?? null,
        dateCreated: data.date_created ?? null,
        center: data.center ?? null,
        keywords: data.keywords ?? [],
      };
    });

  return {
    results,
    totalHits: raw.collection.metadata.total_hits,
  };
}

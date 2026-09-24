import type { Request, Response } from "express";
import { searchNasaImages } from "../services/nasaService";

export async function searchImages(req: Request, res: Response) {
  // Todos estos parámetros llegan como query string: /api/nasa/search?q=marte
  const { q, center, yearStart, yearEnd, page } = req.query;

  // "Búsqueda avanzada" es una funcionalidad core obligatoria, pero no tiene
  // sentido permitir una búsqueda totalmente vacía (traería resultados
  // gigantes y aleatorios), así que pedimos al menos un término de texto.
  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "El parámetro 'q' (texto de búsqueda) es obligatorio" });
  }

  try {
    const data = await searchNasaImages({
      q,
      center: typeof center === "string" ? center : undefined,
      yearStart: typeof yearStart === "string" ? yearStart : undefined,
      yearEnd: typeof yearEnd === "string" ? yearEnd : undefined,
      page: page ? Number(page) : undefined,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "No se pudo consultar la API de NASA" });
  }
}

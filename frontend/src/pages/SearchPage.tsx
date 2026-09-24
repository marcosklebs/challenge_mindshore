import { useState } from "react";
import { apiRequest } from "../api/client";
import type { NasaImageResult } from "../api/types";
import { Navbar } from "../components/Navbar";
import { AddToCollectionModal } from "../components/AddToCollectionModal";

interface SearchResponse {
  results: NasaImageResult[];
  totalHits: number;
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [results, setResults] = useState<NasaImageResult[]>([]);
  const [totalHits, setTotalHits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<NasaImageResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query });
      if (yearStart) params.set("yearStart", yearStart);
      if (yearEnd) params.set("yearEnd", yearEnd);
      const data = await apiRequest<SearchResponse>(`/nasa/search?${params.toString()}`, {
        auth: false,
      });
      setResults(data.results);
      setTotalHits(data.totalHits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Buscar imágenes de la NASA</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            placeholder="Ej: mars, apollo 11, nebula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            placeholder="Año desde"
            value={yearStart}
            onChange={(e) => setYearStart(e.target.value)}
            style={{ width: 100 }}
          />
          <input
            placeholder="Año hasta"
            value={yearEnd}
            onChange={(e) => setYearEnd(e.target.value)}
            style={{ width: 100 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {totalHits !== null && (
          <p>{totalHits} resultados encontrados (mostrando la primera página)</p>
        )}

        <div className="image-grid">
          {results.map((image) => (
            <div key={image.nasaId} className="image-card">
              {image.imageUrl && <img src={image.imageUrl} alt={image.title} />}
              <h3>{image.title}</h3>
              <button onClick={() => setSelectedImage(image)}>Guardar en colección</button>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <AddToCollectionModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

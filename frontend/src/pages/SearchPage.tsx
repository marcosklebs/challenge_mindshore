import { useState } from "react";
import { apiRequest } from "../api/client";
import type { NasaImageResult } from "../api/types";
import { Navbar } from "../components/Navbar";
import { AddToCollectionModal } from "../components/AddToCollectionModal";
import { formatDate } from "../utils/format";

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
        <h1 style={{ textAlign: "center" }}>Buscar imágenes de la NASA</h1>

        <div className="search-box">
          <form onSubmit={handleSearch} className="search-form">
            <input
              placeholder="Ej: mars, apollo 11, nebula..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, minWidth: 260 }}
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
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
          {totalHits !== null && (
            <p style={{ textAlign: "center", marginTop: 12, marginBottom: 0, color: "#a9adcf", fontSize: 14 }}>
              {totalHits} resultados encontrados (mostrando la primera página)
            </p>
          )}
        </div>

        <div className="image-grid">
          {results.map((image) => (
            <div key={image.nasaId} className="timeline-card">
              <div className="timeline-card-image-wrap">
                {image.imageUrl && <img src={image.imageUrl} alt={image.title} />}
                <button
                  className="timeline-add-button"
                  title="Agregar a colección"
                  onClick={() => setSelectedImage(image)}
                >
                  +
                </button>
              </div>
              <p className="timeline-card-title">{image.title}</p>
              <p className="timeline-card-date">{formatDate(image.dateCreated)}</p>
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

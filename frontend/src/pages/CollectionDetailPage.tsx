import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import type { CollectionDetail } from "../api/types";
import { Navbar } from "../components/Navbar";
import { SavedImageCard } from "../components/SavedImageCard";

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<CollectionDetail>(`/collections/${id}`)
      .then(setCollection)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleImageRemoved(imageId: string) {
    setCollection((prev) =>
      prev ? { ...prev, images: prev.images.filter((i) => i.imageId !== imageId) } : prev
    );
  }

  if (loading) return <p className="page">Cargando...</p>;
  if (error) return <p className="page error-message">{error}</p>;
  if (!collection) return null;

  return (
    <div>
      <Navbar />
      <div className="page">
        <Link to="/collections">← Volver a mis colecciones</Link>
        <h1>{collection.name}</h1>
        {collection.description && <p>{collection.description}</p>}

        <div className="image-grid">
          {collection.images.map((entry) => (
            <SavedImageCard
              key={entry.imageId}
              collectionId={collection.id}
              entry={entry}
              onRemoved={handleImageRemoved}
            />
          ))}
        </div>

        {collection.images.length === 0 && (
          <p>Esta colección todavía no tiene imágenes. Buscá alguna y guardala acá.</p>
        )}
      </div>
    </div>
  );
}

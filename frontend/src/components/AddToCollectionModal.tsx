import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Collection, NasaImageResult } from "../api/types";

interface Props {
  image: NasaImageResult;
  onClose: () => void;
}

// Modal simple: muestra las colecciones del usuario para elegir una, o un
// formulario para crear una colección nueva sin salir de la búsqueda.
export function AddToCollectionModal({ image, onClose }: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Collection[]>("/collections")
      .then(setCollections)
      .finally(() => setLoading(false));
  }, []);

  async function saveToCollection(collectionId: string) {
    setStatusMessage(null);
    try {
      await apiRequest(`/collections/${collectionId}/images`, {
        method: "POST",
        body: {
          nasaId: image.nasaId,
          title: image.title,
          imageUrl: image.imageUrl,
          dateCreated: image.dateCreated,
        },
      });
      setStatusMessage("¡Imagen guardada!");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  async function createAndSave(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      const collection = await apiRequest<Collection>("/collections", {
        method: "POST",
        body: { name: newCollectionName },
      });
      await saveToCollection(collection.id);
      setCollections((prev) => [collection, ...prev]);
      setNewCollectionName("");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Error al crear la colección");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation evita que un click DENTRO del modal lo cierre */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Guardar en una colección</h2>
        <p className="modal-image-title">{image.title}</p>

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        {loading ? (
          <p>Cargando tus colecciones...</p>
        ) : collections.length === 0 ? (
          <p>Todavía no tenés colecciones. Creá la primera abajo.</p>
        ) : (
          <ul className="collection-pick-list">
            {collections.map((c) => (
              <li key={c.id}>
                <button onClick={() => saveToCollection(c.id)}>{c.name}</button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={createAndSave} className="new-collection-form">
          <input
            placeholder="Nombre de colección nueva"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <button type="submit">Crear y guardar</button>
        </form>

        <button className="modal-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

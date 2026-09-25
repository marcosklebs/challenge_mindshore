import { apiRequest } from "../api/client";
import type { SavedImage } from "../api/types";

interface Props {
  collectionId: string;
  entry: { imageId: string; image: SavedImage };
  onRemoved: (imageId: string) => void;
}

// Versión básica: solo muestra la imagen y permite quitarla de la colección.
// En el próximo paso (3.2) le vamos a sumar tags y contenido generado por IA.
export function SavedImageCard({ collectionId, entry, onRemoved }: Props) {
  const { image } = entry;

  async function removeFromCollection() {
    await apiRequest(`/collections/${collectionId}/images/${image.id}`, { method: "DELETE" });
    onRemoved(image.id);
  }

  return (
    <div className="saved-image-card">
      {image.imageUrl && <img src={image.imageUrl} alt={image.title} />}
      <h3>{image.title}</h3>
      <button className="danger-button" onClick={removeFromCollection}>
        Quitar de la colección
      </button>
    </div>
  );
}

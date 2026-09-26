import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import type { Collection } from "../api/types";
import { Navbar } from "../components/Navbar";

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loadCollections() {
    setLoading(true);
    apiRequest<Collection[]>("/collections")
      .then(setCollections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadCollections, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await apiRequest("/collections", { method: "POST", body: { name: newName } });
      setNewName("");
      setCreating(false);
      loadCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la colección");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés borrar esta colección? Esta acción no se puede deshacer.")) return;
    try {
      await apiRequest(`/collections/${id}`, { method: "DELETE" });
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Mis colecciones</h1>

        {!creating ? (
          <button className="btn" onClick={() => setCreating(true)}>
            + Crear nueva colección
          </button>
        ) : (
          <form onSubmit={handleCreate} className="new-collection-form" style={{ maxWidth: 420 }}>
            <input
              autoFocus
              placeholder="Nombre de la colección"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="btn">
              Crear
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
            >
              Cancelar
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}
        {loading && <p>Cargando...</p>}

        <div className="collection-grid">
          {collections.map((c) => (
            <div key={c.id} className="collection-card">
              <Link to={`/collections/${c.id}`}>
                <div className="collection-preview">
                  {c.images && c.images.length > 0 ? (
                    c.images.map((entry, i) => (
                      <img key={i} src={entry.image.imageUrl} alt="" />
                    ))
                  ) : (
                    <div className="collection-preview-empty">Sin imágenes todavía</div>
                  )}
                </div>
                <h3>{c.name}</h3>
                <p>{c._count?.images ?? 0} imágenes</p>
              </Link>
              <button className="danger-button" onClick={() => handleDelete(c.id)}>
                Borrar
              </button>
            </div>
          ))}
        </div>

        {!loading && collections.length === 0 && <p>Todavía no creaste ninguna colección.</p>}
      </div>
    </div>
  );
}

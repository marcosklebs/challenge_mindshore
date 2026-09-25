import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import type { Collection } from "../api/types";
import { Navbar } from "../components/Navbar";

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
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

        <form onSubmit={handleCreate} className="new-collection-form" style={{ maxWidth: 400 }}>
          <input
            placeholder="Nombre de la nueva colección"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit">Crear</button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {loading && <p>Cargando...</p>}

        <div className="collection-grid">
          {collections.map((c) => (
            <div key={c.id} className="collection-card">
              <Link to={`/collections/${c.id}`}>
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

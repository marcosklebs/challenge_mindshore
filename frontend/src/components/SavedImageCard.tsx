import { useState } from "react";
import { apiRequest } from "../api/client";
import type { AiContent, SavedImage } from "../api/types";

interface Props {
  collectionId: string;
  entry: { imageId: string; image: SavedImage };
  onRemoved: (imageId: string) => void;
}

const AI_TYPES: { type: AiContent["type"]; label: string }[] = [
  { type: "DESCRIPTION", label: "Descripción" },
  { type: "FUN_FACT", label: "Dato curioso" },
  { type: "HISTORICAL_CONTEXT", label: "Contexto histórico" },
];

export function SavedImageCard({ collectionId, entry, onRemoved }: Props) {
  const { image } = entry;
  const [tags, setTags] = useState(image.tags);
  const [newTag, setNewTag] = useState("");
  const [aiContent, setAiContent] = useState<AiContent | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function removeFromCollection() {
    await apiRequest(`/collections/${collectionId}/images/${image.id}`, { method: "DELETE" });
    onRemoved(image.id);
  }

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTag.trim()) return;
    const result = await apiRequest<{ tagId: string; suggestedByAi: boolean; tag: { id: string; name: string } }>(
      `/ai/images/${image.id}/tags`,
      { method: "POST", body: { name: newTag } }
    );
    setTags((prev) => [...prev, result]);
    setNewTag("");
  }

  async function removeTag(tagId: string) {
    await apiRequest(`/ai/images/${image.id}/tags/${tagId}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.tagId !== tagId));
  }

  async function suggestTags() {
    const suggestions = await apiRequest<
      { tagId: string; suggestedByAi: boolean; tag: { id: string; name: string } }[]
    >(`/ai/images/${image.id}/tags/suggest`, { method: "POST" });
    // Combinamos evitando duplicados (por si la IA sugiere un tag que ya existía)
    setTags((prev) => {
      const existingIds = new Set(prev.map((t) => t.tagId));
      return [...prev, ...suggestions.filter((s) => !existingIds.has(s.tagId))];
    });
  }

  async function generateAiContent(type: AiContent["type"]) {
    setAiLoading(true);
    try {
      const content = await apiRequest<AiContent>(`/ai/images/${image.id}/content`, {
        method: "POST",
        body: { type },
      });
      setAiContent(content);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="saved-image-card">
      {image.imageUrl && <img src={image.imageUrl} alt={image.title} />}
      <h3>{image.title}</h3>

      <div className="tag-list">
        {tags.map((t) => (
          <span key={t.tagId} className={`tag ${t.suggestedByAi ? "tag-ai" : ""}`}>
            {t.tag.name}
            <button onClick={() => removeTag(t.tagId)}>×</button>
          </span>
        ))}
      </div>

      <form onSubmit={addTag} className="tag-form">
        <input
          placeholder="Agregar tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
      <button className="link-button" onClick={suggestTags}>
        ✨ Sugerir tags con IA
      </button>

      <div className="ai-content-buttons">
        {AI_TYPES.map(({ type, label }) => (
          <button key={type} onClick={() => generateAiContent(type)} disabled={aiLoading}>
            {label}
          </button>
        ))}
      </div>

      {aiContent && (
        <p className="ai-content-box">
          {aiContent.content}
          {aiContent.isMocked && <span className="mocked-badge"> (simulado)</span>}
        </p>
      )}

      <button className="danger-button" onClick={removeFromCollection}>
        Quitar de la colección
      </button>
    </div>
  );
}

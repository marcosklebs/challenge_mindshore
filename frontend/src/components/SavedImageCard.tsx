import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client";
import type { AiContent, SavedImage, Tag } from "../api/types";
import { formatDate } from "../utils/format";

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

  // Autocompletado: lista global de tags existentes + si mostrar el dropdown
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function removeFromCollection() {
    await apiRequest(`/collections/${collectionId}/images/${image.id}`, { method: "DELETE" });
    onRemoved(image.id);
  }

  async function addTagByName(name: string) {
    if (!name.trim()) return;
    const result = await apiRequest<{ tagId: string; suggestedByAi: boolean; tag: Tag }>(
      `/ai/images/${image.id}/tags`,
      { method: "POST", body: { name } }
    );
    setTags((prev) => (prev.some((t) => t.tagId === result.tagId) ? prev : [...prev, result]));
    setNewTag("");
    setShowDropdown(false);
  }

  async function handleAddTagSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addTagByName(newTag);
  }

  async function removeTag(tagId: string) {
    await apiRequest(`/ai/images/${image.id}/tags/${tagId}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.tagId !== tagId));
  }

  async function suggestTags() {
    const suggestions = await apiRequest<
      { tagId: string; suggestedByAi: boolean; tag: Tag }[]
    >(`/ai/images/${image.id}/tags/suggest`, { method: "POST" });
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

  function handleTagInputFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setShowDropdown(true);
    if (allTags.length === 0) {
      apiRequest<Tag[]>("/ai/tags").then(setAllTags).catch(() => setAllTags([]));
    }
  }

  function handleTagInputBlur() {
    // Delay para que el click en una opción del dropdown alcance a dispararse
    // antes de que el dropdown se cierre por perder el foco.
    blurTimeout.current = setTimeout(() => setShowDropdown(false), 150);
  }

  const alreadyAppliedIds = new Set(tags.map((t) => t.tagId));
  const dropdownOptions = allTags.filter((t) => {
    if (alreadyAppliedIds.has(t.id)) return false;
    if (!newTag.trim()) return true;
    return t.name.toLowerCase().includes(newTag.trim().toLowerCase());
  });

  return (
    <div className="saved-image-card">
      {image.imageUrl && <img src={image.imageUrl} alt={image.title} />}
      <h3>{image.title}</h3>
      <p className="saved-image-date">{formatDate(image.dateCreated)}</p>

      <div className="tag-list">
        {tags.map((t) => (
          <span key={t.tagId} className={`tag ${t.suggestedByAi ? "tag-ai" : ""}`}>
            {t.tag.name}
            <button onClick={() => removeTag(t.tagId)}>×</button>
          </span>
        ))}
      </div>

      <div className="tag-form-wrap">
        <form onSubmit={handleAddTagSubmit} className="tag-form">
          <input
            placeholder="Agregar tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onFocus={handleTagInputFocus}
            onBlur={handleTagInputBlur}
          />
          <button type="submit" className="btn">
            +
          </button>
        </form>

        {showDropdown && dropdownOptions.length > 0 && (
          <ul className="tag-dropdown">
            {dropdownOptions.map((t) => (
              <li key={t.id}>
                {/* onMouseDown (no onClick) para que dispare ANTES del blur del input */}
                <button type="button" onMouseDown={() => addTagByName(t.name)}>
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="btn-outline suggest-tags-button" onClick={suggestTags}>
        ✨ Sugerir tags con IA
      </button>

      <div className="ai-content-buttons">
        {AI_TYPES.map(({ type, label }) => (
          <button
            key={type}
            className="btn"
            onClick={() => generateAiContent(type)}
            disabled={aiLoading}
          >
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

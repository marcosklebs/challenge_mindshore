import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AiContentType } from "@prisma/client";

// --- Generación de contenido con OpenAI (o mock si no hay key) ---

const PROMPTS: Record<AiContentType, (title: string) => string> = {
  DESCRIPTION: (title) =>
    `Escribí una descripción breve (2-3 oraciones) y divulgativa en español sobre esta imagen espacial de la NASA titulada "${title}". Es para el público general, sin tecnicismos innecesarios.`,
  FUN_FACT: (title) =>
    `Dame un dato curioso breve (1-2 oraciones) en español relacionado con esta imagen espacial de la NASA titulada "${title}".`,
  HISTORICAL_CONTEXT: (title) =>
    `Explicá brevemente en español (2-3 oraciones) el contexto histórico o científico de esta imagen espacial de la NASA titulada "${title}".`,
};

// Respuestas simuladas: no son "de mentira" en el sentido de ser incoherentes,
// son plantillas realistas para que la app se pueda demostrar sin billing
// activo en OpenAI. Se marcan con isMocked=true en la base de datos.
const MOCK_GENERATORS: Record<AiContentType, (title: string) => string> = {
  DESCRIPTION: (title) =>
    `Esta imagen, titulada "${title}", forma parte del archivo de la NASA. Muestra distintos detalles capturados por instrumentos espaciales, y es un ejemplo del extenso trabajo de documentación visual que la agencia realiza sobre el espacio y nuestro sistema solar.`,
  FUN_FACT: (title) =>
    `¿Sabías que la NASA publica miles de imágenes como "${title}" en su biblioteca pública, disponibles para que cualquier persona las explore y las use libremente?`,
  HISTORICAL_CONTEXT: (title) =>
    `Imágenes como "${title}" suelen formar parte de misiones de observación de largo plazo, cuyo objetivo es ampliar el conocimiento científico disponible públicamente para investigadores y la sociedad en general.`,
};

async function callOpenAi(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error de la API de OpenAI: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function getOrGenerateContent(imageId: string, type: AiContentType, title: string) {
  // Primero miramos si ya generamos este contenido antes, para no gastar
  // llamadas a OpenAI de nuevo (y responder instantáneo).
  const cached = await prisma.aiContent.findFirst({ where: { imageId, type } });
  if (cached) return cached;

  let content: string;
  let isMocked: boolean;

  if (env.openAiApiKey) {
    content = await callOpenAi(PROMPTS[type](title));
    isMocked = false;
  } else {
    content = MOCK_GENERATORS[type](title);
    isMocked = true;
  }

  return prisma.aiContent.create({
    data: { imageId, type, content, isMocked },
  });
}

// --- Sugerencia de tags (diferenciador) ---

const COMMON_SPACE_KEYWORDS = ["nasa", "espacio", "marte", "luna", "tierra", "galaxia", "estrella", "cohete", "astronauta", "satelite", "sol", "planeta"];

export async function suggestTagsForImage(title: string, keywords: string[] = []) {
  if (env.openAiApiKey) {
    const prompt = `Dame entre 3 y 5 tags cortos en español (una o dos palabras cada uno) para categorizar esta imagen de la NASA titulada "${title}". Respondé SOLO con los tags separados por coma, sin numerarlos ni agregar texto extra.`;
    const raw = await callOpenAi(prompt);
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }

  // Mock, en 3 capas (de más a menos específico):
  // 1. Las keywords reales que ya vienen de la propia API de NASA (lo más
  //    específico y confiable que tenemos, sin necesidad de IA real).
  // 2. Palabras conocidas del ámbito espacial que aparezcan en el título.
  // 3. Si con eso no alcanza, las palabras más largas del título (suelen
  //    ser sustantivos relevantes: nombres propios, lugares, objetos).
  const titleWords: string[] = title.toLowerCase().match(/[a-záéíóúñ]+/g) ?? [];

  const fromNasaKeywords = keywords.slice(0, 4).map((k) => k.toLowerCase());
  const knownMatches = COMMON_SPACE_KEYWORDS.filter((kw) => titleWords.includes(kw));
  const titleFallback = titleWords
    .filter((w) => w.length > 4 && !COMMON_SPACE_KEYWORDS.includes(w))
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

  const combined = Array.from(new Set([...fromNasaKeywords, ...knownMatches, ...titleFallback]));
  return combined.length > 0 ? combined.slice(0, 5) : ["espacio", "nasa"];
}

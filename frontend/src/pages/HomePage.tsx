import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { NasaImageResult } from "../api/types";
import { Navbar } from "../components/Navbar";
import { AddToCollectionModal } from "../components/AddToCollectionModal";

interface SearchResponse {
  results: NasaImageResult[];
}

const FUN_FACTS = [
  "La Estación Espacial Internacional viaja a unos 28.000 km/h, dando la vuelta a la Tierra cada 90 minutos aproximadamente.",
  "Un día en Venus (una vuelta completa sobre su propio eje) dura más que un año venusiano completo alrededor del Sol.",
  "La sonda Voyager 1, lanzada en 1977, es el objeto hecho por el ser humano que más lejos llegó del sistema solar.",
  "En el espacio, sin gravedad, la columna vertebral se estira y los astronautas pueden crecer hasta 5 cm durante su misión.",
  "El telescopio espacial Hubble ha tomado más de 1.5 millones de observaciones desde su lanzamiento en 1990.",
  "Marte tiene el volcán más grande conocido del sistema solar, el Monte Olimpo, casi 3 veces más alto que el Everest.",
  "Un año en Neptuno dura 165 años terrestres: desde su descubrimiento en 1846 todavía no completó ni una vuelta al Sol.",
  "Los anillos de Saturno están hechos casi en su totalidad de hielo, con solo una pequeña fracción de roca y polvo.",
];

// Pool grande de búsquedas: en cada carga de la página elegimos un subconjunto
// al azar, así la timeline muestra cosas distintas cada vez que se entra.
const QUERY_POOL = [
  "galaxy", "nebula", "saturn", "earth", "astronaut", "mars",
  "jupiter", "moon landing", "black hole", "space shuttle",
  "aurora", "comet", "solar flare", "spacewalk",
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomFact(exclude?: string): string {
  const options = exclude ? FUN_FACTS.filter((f) => f !== exclude) : FUN_FACTS;
  return options[Math.floor(Math.random() * options.length)];
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Fecha desconocida";
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function HomePage() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [funFact, setFunFact] = useState(() => pickRandomFact());
  const [timelineImages, setTimelineImages] = useState<NasaImageResult[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [selectedImage, setSelectedImage] = useState<NasaImageResult | null>(null);

  // Banner: usamos específicamente la 6ta imagen de la búsqueda (índice 5),
  // que es la que mejor quedó visualmente. Si por algún motivo no tiene
  // imagen válida, caemos a la primera que sí la tenga.
  useEffect(() => {
    apiRequest<SearchResponse>("/nasa/search?q=earth+from+space", { auth: false })
      .then((data) => {
        const sixth = data.results[5];
        const chosen = sixth?.imageUrl ? sixth : data.results.find((r) => r.imageUrl);
        if (chosen?.imageUrl) setHeroImage(chosen.imageUrl);
      })
      .catch(() => setHeroImage(null));
  }, []);

  // Timeline: elegimos 7 búsquedas al azar del pool, y de cada una tomamos
  // hasta 3 imágenes random (no siempre las mismas), para juntar 20+ fotos
  // distintas en cada carga de la página.
  useEffect(() => {
    const chosenQueries = shuffle(QUERY_POOL).slice(0, 7);

    Promise.all(
      chosenQueries.map((q) =>
        apiRequest<SearchResponse>(`/nasa/search?q=${encodeURIComponent(q)}`, { auth: false }).catch(
          () => ({ results: [] as NasaImageResult[] })
        )
      )
    )
      .then((responses) => {
        const allPicks: NasaImageResult[] = [];
        for (const response of responses) {
          const valid = response.results.filter((img) => img.imageUrl && img.dateCreated);
          allPicks.push(...shuffle(valid).slice(0, 3));
        }
        allPicks.sort(
          (a, b) => new Date(a.dateCreated!).getTime() - new Date(b.dateCreated!).getTime()
        );
        setTimelineImages(allPicks);
      })
      .finally(() => setLoadingTimeline(false));
  }, []);

  return (
    <div>
      <Navbar />

      <section
        className="hero"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="hero-overlay">
          <img
            className="hero-logo"
            src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg"
            alt="Logo de la NASA"
          />
          <h1>NASA Explorer</h1>
          <p>Explorá, guardá y descubrí el archivo visual del cosmos</p>
        </div>
      </section>

      <div className="page">
        <div className="fun-fact-card">
          <span className="fun-fact-icon">✨</span>
          <p>
            <strong>¿Sabías que...?</strong> {funFact}
          </p>
          <button
            className="fun-fact-button"
            onClick={() => setFunFact((current) => pickRandomFact(current))}
          >
            Otro dato
          </button>
        </div>

        <h2>Un vistazo a través del tiempo</h2>
        <p className="section-subtitle">
          Una muestra aleatoria de imágenes del archivo de la NASA, ordenadas de la más antigua a la
          más reciente. Se renuevan cada vez que entrás a esta página.
        </p>

        {loadingTimeline ? (
          <p>Cargando imágenes...</p>
        ) : (
          <div className="timeline-scroll">
            {timelineImages.map((img, index) => (
              <div key={`${img.nasaId}-${index}`} className="timeline-card">
                <div className="timeline-card-image-wrap">
                  <img src={img.imageUrl!} alt={img.title} />
                  <button
                    className="timeline-add-button"
                    title="Agregar a una colección"
                    onClick={() => setSelectedImage(img)}
                  >
                    +
                  </button>
                </div>
                <p className="timeline-card-title">{img.title}</p>
                <p className="timeline-card-date">{formatDate(img.dateCreated)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <AddToCollectionModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

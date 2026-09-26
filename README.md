# NASA Explorer — Challenge MindShore

## ¿Qué construí y por qué tomé las decisiones que tomé?

Construí una aplicación full-stack para buscar imágenes del archivo público de la NASA, guardarlas en colecciones personales, taggearlas (manual o con sugerencias de IA) y generar contenido descriptivo sobre ellas con IA.

**Stack:**

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | React + Vite + TypeScript | Ecosistema más usado del mercado, Vite da un dev server rápido con recarga instantánea |
| Backend | Node.js + Express + TypeScript | Mismo lenguaje que el frontend, reduce la curva de aprendizaje |
| Base de datos | PostgreSQL + Prisma ORM | El modelo de datos (usuarios → colecciones → imágenes → tags) es relacional por naturaleza, con relaciones muchos-a-muchos que Prisma modela de forma simple |
| Autenticación | JWT + bcrypt | Estándar simple y stateless para una API REST, sin dependencias externas |
| Contenedores | Docker + docker-compose | Levantar los 3 servicios (frontend, backend, DB) con un solo comando |

**Decisiones técnicas destacadas:**

- **API de NASA elegida — NASA Image and Video Library** (`images-api.nasa.gov`): es pública y no requiere API key, a diferencia de otras APIs de NASA. Trade-off: no expone campos estructurados de "rover"/"cámara"/"misión" (esos son de la API de fotos de rovers de Marte, distinta), así que mi búsqueda avanzada filtra por texto libre y rango de años en vez de esos campos específicos.
- **IA con fallback mock**: implementé la integración real con la API de OpenAI, pero al no tener billing activo, el servicio detecta la ausencia de `OPENAI_API_KEY` y genera contenido simulado con el mismo formato de respuesta (marcado con `isMocked: true`). El código de la integración real está completo y se activa con solo cargar la variable de entorno.
- **Upsert en vez de validaciones manuales de duplicados**: tanto al guardar una imagen en una colección como al asignar un tag, uso `upsert` de Prisma para evitar duplicados de forma atómica, en lugar de hacer un `find` seguido de un `create` condicional.

## ¿Qué diferenciadores elegí y por qué?

Elegí **sistema de tags** y **timeline interactivo**, priorizando profundidad en menos features antes que cubrir muchos diferenciadores de forma superficial:

1. **Sistema de tags (manual + sugerido por IA)**: el usuario puede agregar tags a mano a cualquier imagen guardada (con autocompletado de los tags ya existentes en el sistema), o pedirle a la IA que sugiera 3-5 tags. Sin API key de OpenAI, el fallback heurístico combina las keywords reales que ya trae cada imagen desde la propia API de NASA con palabras relevantes extraídas del título, en vez de depender de una lista fija de palabras clave. Los tags sugeridos por IA se marcan visualmente distinto de los manuales.
2. **Timeline interactivo**: implementado en dos lugares. Dentro de una colección, un toggle reordena las imágenes guardadas de la fecha más antigua a la más reciente (según la fecha real de captura/publicación que devuelve la API de NASA). En la página de Inicio, un carrusel horizontal muestra una selección aleatoria de imágenes del archivo de NASA también ordenadas cronológicamente, que se renueva en cada visita, como forma de invitar a explorar antes de buscar algo puntual.

## ¿Qué mejoraría con más tiempo?

1. **Más cobertura de tests** — hoy hay 6 tests unitarios en el backend (JWT y validaciones), pero ninguno de integración con la base de datos ni tests de componentes en el frontend.
2. **Paginación** — la búsqueda de NASA y el listado de imágenes de una colección traen todo de una, sin paginar. Con colecciones grandes esto se volvería lento.
3. **Búsqueda semántica** — permitir escribir la búsqueda en lenguaje natural y que la IA la traduzca a los parámetros que entiende la API de NASA, en vez de depender de que el usuario escriba las palabras clave exactas.
4. **Editar nombre/descripción de una colección desde la interfaz** — el endpoint `PATCH /api/collections/:id` ya existe en el backend, pero todavía no lo conecté a ningún botón del frontend.
5. **Deploy funcional** — decidí priorizar dejar todo funcionando 100% en local con un solo comando de Docker antes que invertir tiempo en deployarlo a un hosting real.

## Cosas a saber antes de revisar

- **Cómo levantarlo**: `docker compose up -d --build` desde la raíz, y listo — no hace falta configurar ninguna variable de entorno, los valores por defecto ya están en `docker-compose.yml`. Instrucciones completas más abajo.
- **Sin API key de OpenAI**: las funciones de IA (descripciones, tags sugeridos) funcionan igual, mostrando contenido simulado marcado explícitamente como "(simulado)" en la interfaz. No hace falta cargar ninguna key para evaluar el flujo completo.
- **Sin API key de NASA**: la API que uso (Image and Video Library) no la requiere.
- Ver `backend/.env.example` y `frontend/.env.example` para la lista completa de variables de entorno documentadas.

## Cómo levantar el proyecto

### Opción A: con Docker (recomendada, un solo comando)

Requiere tener Docker instalado y corriendo.

```bash
docker compose up -d --build
```

Levanta 3 contenedores: PostgreSQL, backend (puerto 4000) y frontend (puerto 5173). La primera vez tarda un par de minutos en construir las imágenes.

Abrí http://localhost:5173 en el navegador.

Para bajar todo: `docker compose down` (los datos de Postgres persisten en un volumen; para borrarlos también: `docker compose down -v`).

### Opción B: en local, sin Docker (para desarrollo)

Requiere Node.js 20+ y Docker solo para la base de datos.

```bash
# 1. Base de datos
docker compose up -d postgres

# 2. Backend
cd backend
npm install
copy .env.example .env      (cp en Mac/Linux)
npx prisma migrate dev
npm run dev                  (http://localhost:4000)

# 3. Frontend (en otra terminal)
cd frontend
npm install
copy .env.example .env      (cp en Mac/Linux)
npm run dev                  (http://localhost:5173)
```

## Correr los tests

```bash
cd backend
npm test
```

## Estructura del proyecto

```
backend/
  prisma/schema.prisma   -> modelo de datos
  src/
    routes/               -> definicion de endpoints
    controllers/          -> manejo de request/response
    services/             -> logica de negocio y llamadas a APIs externas
    middleware/            -> autenticacion JWT
    __tests__/             -> tests unitarios
frontend/
  src/
    pages/                -> paginas (login, busqueda, colecciones, etc.)
    components/            -> componentes reutilizables
    store/                 -> estado global (Zustand)
    api/                   -> cliente HTTP y tipos compartidos
    utils/                 -> funciones compartidas (formateo de fechas, etc.)
```

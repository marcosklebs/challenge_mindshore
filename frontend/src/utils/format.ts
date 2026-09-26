// Función compartida entre Home y Búsqueda (y cualquier otra pantalla que
// necesite mostrar la fecha de una imagen de forma legible).
export function formatDate(dateString: string | null): string {
  if (!dateString) return "Fecha desconocida";
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

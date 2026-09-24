import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Centralizamos acá todas las llamadas al backend: arma la URL completa,
// agrega el header Authorization automáticamente si hay un usuario logueado,
// y convierte errores HTTP en excepciones de JS con un mensaje legible
// (así en los componentes solo hacemos try/catch, sin repetir esta lógica).

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // true = mandar el token (default), false = ruta pública
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Los endpoints DELETE devuelven 204 sin body, no hay nada que parsear
  if (response.status === 204) return undefined as T;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ocurrió un error inesperado");
  }

  return data as T;
}

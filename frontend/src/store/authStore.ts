import { create } from "zustand";
import { persist } from "zustand/middleware";

// Zustand es una librería de "estado global": datos que varios componentes
// necesitan leer/modificar (acá, quién está logueado) sin tener que pasarlos
// manualmente de componente en componente ("prop drilling").
//
// El middleware "persist" guarda automáticamente este estado en localStorage,
// así si el usuario cierra la pestaña y vuelve, sigue logueado.

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "nasa-explorer-auth" } // nombre de la key en localStorage
  )
);

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite es el "empaquetador" que compila el proyecto y levanta el servidor
// de desarrollo con recarga instantánea al guardar cambios.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

import { useAuthStore } from "../store/authStore";

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="page">
      <h1>Hola, {user?.name} 👋</h1>
      <p>Bienvenido a NASA Explorer. Acá van a ir la búsqueda de imágenes y tus colecciones.</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

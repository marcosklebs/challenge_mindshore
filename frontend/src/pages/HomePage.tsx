import { useAuthStore } from "../store/authStore";
import { Navbar } from "../components/Navbar";

export function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Hola, {user?.name} 👋</h1>
        <p>Bienvenido a NASA Explorer. Usá el menú de arriba para buscar imágenes o ver tus colecciones.</p>
      </div>
    </div>
  );
}

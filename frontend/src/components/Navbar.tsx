import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function Navbar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/search">Buscar</NavLink>
        <NavLink to="/collections">Mis colecciones</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button className="btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

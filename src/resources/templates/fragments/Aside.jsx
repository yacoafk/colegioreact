import { useEffect, useState } from "react";

import '../../static/global.css';
import '../../static/Aside.css';
import '../../static/global.css';

import { GrupoRegistrar } from "../dashboard/funciones/GrupoRegistrar";
import { GrupoProfesor } from "../dashboard/funciones/GrupoProfesor";
import { GrupoConsultas } from "../dashboard/funciones/GrupoConsultas";

export function Aside({ onViewChange, currentView }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  if (!user) return null;

  // ✅ Roles
  const isPersonal = user.tipoUsuario === "PERSONAL";
  const esAdmin = isPersonal && user.rolDetallado === "ADMINISTRADOR";
  const esProfesor = isPersonal && user.rolDetallado === "PROFESOR";

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2>Colegio University School</h2>
      </div>


      {/* Navegación */}
      <nav className="sidebar-nav">
        {/* Inicio */}
        <button
          className={`nav-item ${currentView === "funciones" ? "active" : ""}`}
          onClick={() => onViewChange("funciones")}
        >
          🏠 Inicio
        </button>

        {esAdmin && (
          <>
            <GrupoRegistrar 
              onViewChange={onViewChange} 
              currentView={currentView} 
            />
            <GrupoConsultas 
              onViewChange={onViewChange} 
              currentView={currentView} 
            />
          </>
        )}

        {/* PROFESOR */}
        {esProfesor && (
          <GrupoProfesor 
            onViewChange={onViewChange} 
            currentView={currentView} 
          />
        )}

        {/* OTROS ROLES */}
        {!esAdmin && !esProfesor && (
          <div className="sidebar-warning">
            <p>⚠️ Acceso limitado</p>
            <small>Rol: {user.rolDetallado}</small>
          </div>
        )}
      </nav>
    </aside>
  );
}


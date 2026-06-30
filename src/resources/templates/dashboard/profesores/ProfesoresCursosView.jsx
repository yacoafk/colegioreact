import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 

export function ProfesoresCursosView({ onSelectCurso }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);

  const userSession = JSON.parse(localStorage.getItem("user_session"));

  useEffect(() => {
    const cargarCursosProfesor = async () => {
      if (!userSession?.id) {
        console.error("Sesión no válida");
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/cursos/profesor/${userSession.id}/dto`
        );
        setCursos(response.data);
      } catch (error) {
        console.error("Error al cargar cursos del profesor:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarCursosProfesor();
  }, [userSession?.id]);

  return (
    <div className="page-container">
      <div className="card">
        <h4 className="section-title">
          👨‍🏫 Mis Cursos Asignados
          <span className="badge">{cursos.length}</span>
        </h4>
        <br />

        {loading ? (
          <div className="loading-state">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes cursos asignados.</p>
          </div>
        ) : (
          <div className="cursos-grid">
            {cursos.map((curso) => (
              <div
                key={curso.idCurso}
                className="curso-card-button"
                onClick={() => onSelectCurso(curso.idCurso)}
              >
                <div className="curso-card-header">
                  <span className="curso-badge">CURSO</span>
                </div>

                <div className="curso-card-body">
                  <h4>{curso.nombreCurso}</h4>
                  <p>{curso.nombreGradoVisual}</p>
                </div>

                <div className="curso-card-footer">
                  <span>Gestionar →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
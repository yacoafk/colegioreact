import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 

export function EstudiantesCursosView({ onSelectCurso }) {
  const [todoLosCursos, setTodoLosCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Usamos 'user_session' consistente con tu login anterior
  const userSession = JSON.parse(localStorage.getItem("user_session"));

  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      if (!userSession?.id) {
        console.error("Sesión no válida");
        return;
      }

      setLoading(true);
      try {
        // Obtenemos solo los cursos del estudiante logueado
        const response = await api.get(`/estudiantes/${userSession.id}/cursos`);
        setTodoLosCursos(response.data);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosEstudiante();
  }, [userSession?.id]);

  return (
    <div className="page-container">
      <div className="card">
        <h4 className="section-title">
          📚 Mis Cursos Asignados
          <span className="badge">{todoLosCursos.length}</span>
        </h4> <br />

        {loading ? (
          <div className="loading-state">Cargando cursos...</div>
        ) : todoLosCursos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes cursos asignados actualmente.</p>
          </div>
        ) : (
          <div className="cursos-grid">
            {todoLosCursos.map((curso) => (
              <div 
                key={curso.idCurso} 
                className="curso-card-button"
                onClick={() => onSelectCurso(curso.idCurso)}
                >
                <div className="curso-card-header">
                  <span className="curso-badge">MATERIA</span>
                </div>
                <div className="curso-card-body">
                  <h4>{curso.nombreCurso}</h4>
                </div>
                <div className="curso-card-footer">
                  <span>Ver detalles →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
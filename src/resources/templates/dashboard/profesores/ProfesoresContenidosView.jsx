import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 

export function ProfesoresContenidosView({idCurso, onRegistrarMaterial, onRegistrarTarea, onSelectDetalle }) {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claseActiva, setClaseActiva] = useState(null);

  useEffect(() => {
    const cargarContenido = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cursos/${idCurso}/contenido`);
        setCurso(res.data);
      } catch (err) {
        console.error("Error al cargar contenido:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarContenido();
  }, [idCurso]);

  if (loading) return <div className="loading-msg">Cargando contenido...</div>;
  if (!curso) return <div className="empty-msg">No se encontró el curso.</div>;

  return (
    <div className="page-container">
      <h2 className="main-title">👨‍🏫 {curso.nombreCurso}</h2>

      {curso.clases?.map((clase) => (
        <div key={clase.idClase} className="card-clase">

          {/* HEADER (igual que estudiante) */}
          <div
            className="clase-header clickable"
            onClick={() =>
              setClaseActiva(
                claseActiva === clase.idClase ? null : clase.idClase
              )
            }
          >
            <div className="clase-header-left">
              <h3>{clase.titulo}</h3>
              <p className="clase-desc">{clase.descripcion}</p>

              <span>
                📅 <strong>Clase:</strong>{" "}
                {new Date(clase.fechaClase).toLocaleString([], {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                <strong>Fin:</strong>{" "}
                {new Date(clase.fechaTermino).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* 🔥 DERECHA */}
            <div className="clase-header-actions">
              {clase.urlVideoconferencia && (
                <a
                  href={clase.urlVideoconferencia}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-videoconferencia"
                  onClick={(e) => e.stopPropagation()}
                >
                  🎥 Clase
                </a>
              )}

              <button
                className="btn-asistencia"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Registrar asistencia:", clase.idClase);
                }}
              >
                📝 Asistencia
              </button>
            </div>
          </div>

          {/* BODY */}
          {claseActiva === clase.idClase && (
          <div className="clase-body">

            <div className="acciones-profesor">
              <button
                onClick={() => onRegistrarMaterial(clase.idClase)}
                className="btn-material"
              >
                ➕ Material
              </button>

              <button
                onClick={() => onRegistrarTarea(clase.idClase)}
                className="btn-tarea"
              >
                ➕ Tarea
              </button>
            </div>

              <div className="clase-grid">

                {/* MATERIALES */}
                <div className="section">
                  <h5>📁 Materiales</h5>
                  {clase.materiales?.length > 0 ? (
                    <ul>
                      {clase.materiales.map((m) => (
                      <li
                        key={m.idMaterial}
                        onClick={() => onSelectDetalle("material", m)}
                        style={{ cursor: "pointer", color: "#007bff" }}
                      >
                        📄 {m.titulo}
                      </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin materiales</p>
                  )}
                </div>

                {/* TAREAS */}
                <div className="section">
                  <h5>📝 Tareas</h5>
                  {clase.tareas?.length > 0 ? (
                    <ul>
                      {clase.tareas.map((t) => (
                      <li
                        key={t.idTarea}
                        onClick={() => onSelectDetalle("tarea", t)}
                        style={{ cursor: "pointer", color: "#28a745" }}
                      >
                        📝 {t.titulo}
                      </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin tareas</p>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
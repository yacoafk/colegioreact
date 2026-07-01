import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 
import '../../../static/Modal.css'; 

export function ProfesoresContenidosView({idCurso, onRegistrarMaterial, onRegistrarTarea, onRegistrarAsistencia, onSelectDetalle }) {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claseActiva, setClaseActiva] = useState(null);
  const [mostrarFormClase, setMostrarFormClase] = useState(false);

  const [formClase, setFormClase] = useState({
    titulo: "",
    descripcion: "",
    fechaClase: "",
    fechaTermino: "",
    urlVideoconferencia: ""
  });


  const handleChangeClase = (e) => {
    const { name, value } = e.target;
    setFormClase(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleGuardarClase = async () => {
    try {
      if (!formClase.titulo || !formClase.fechaClase || !formClase.fechaTermino) {
        alert("Completa los campos obligatorios");
        return;
      }

      if (new Date(formClase.fechaClase) >= new Date(formClase.fechaTermino)) {
        alert("La fecha fin debe ser mayor");
        return;
      }

      const payload = {
        idCurso: idCurso,
        ...formClase // Aquí usas directamente el estado
      };

      await api.post("/clases/registrar", payload);

      alert("Clase creada correctamente");

      // 1. LIMPIAR EL ESTADO DEL FORMULARIO
      setFormClase({
        titulo: "",
        descripcion: "",
        fechaClase: "",
        fechaTermino: "",
        urlVideoconferencia: ""
      });

      // 2. CERRAR EL MODAL
      setMostrarFormClase(false);

      // 3. RECARGAR CONTENIDO
      const res = await api.get(`/cursos/${idCurso}/contenido`);
      setCurso(res.data);

    } catch (err) {
      console.error(err);
      alert("Error al crear clase");
    }
  };

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

    {/* BOTÓN */}
    <button
      onClick={() => setMostrarFormClase(true)}
      style={{
        marginBottom: "15px",
        padding: "10px 15px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      ➕ Agregar clase
    </button>

    {/* 🔥 FORM FUERA DEL MAP */}
    {mostrarFormClase && (
      <div className="modal-overlay" onClick={() => setMostrarFormClase(false)}>
        {/* El e.stopPropagation evita que el modal se cierre al hacer clic adentro */}
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>➕ Registrar Nueva Clase</h3>
          
          <input name="titulo" placeholder="Ej. Introducción a la Programación" value={formClase.titulo} onChange={handleChangeClase} />
          <textarea name="descripcion" rows="3" placeholder="Breve descripción del objetivo de la clase..." value={formClase.descripcion} onChange={handleChangeClase} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input type="datetime-local" name="fechaClase" value={formClase.fechaClase} onChange={handleChangeClase} />
            <input type="datetime-local" name="fechaTermino" value={formClase.fechaTermino} onChange={handleChangeClase} />
          </div>
          
          <input name="urlVideoconferencia" placeholder="URL de la reunión (Zoom/Meet)" value={formClase.urlVideoconferencia} onChange={handleChangeClase} />

          <div className="modal-actions">
            <button 
              className="btn-cancelar" 
              onClick={() => {
                // 1. Limpiar el estado
                setFormClase({
                  titulo: "",
                  descripcion: "",
                  fechaClase: "",
                  fechaTermino: "",
                  urlVideoconferencia: ""
                });
                // 2. Cerrar el modal
                setMostrarFormClase(false);
              }}
            >
              Cancelar
            </button>
            <button className="btn-guardar" onClick={handleGuardarClase}>Guardar Clase</button>
          </div>
        </div>
      </div>
    )}

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
                onRegistrarAsistencia(clase.idClase); 
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
                        onClick={() => onSelectDetalle({
                          ...m,
                          tipo: "material",
                          idClase: clase.idClase
                        })}
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
                        onClick={() => onSelectDetalle({
                          ...t,
                          tipo: "tarea",
                          idClase: clase.idClase
                        })}
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
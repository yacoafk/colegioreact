import { useState, useEffect } from 'react';

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 
import '../../../static/Detalles.css'; 
import '../../../static/Asistencia.css'; 

export function ProfesoresAsistenciasRegistroView({ idClase, onBack }) {

  const [clase, setClase] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistenciaEstados, setAsistenciaEstados] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    if (idClase) {
      cargarDatosDirecto();
    }
  }, [idClase]);
  

  // CARGA DIRECTA
  const cargarDatosDirecto = async () => {
    try {
      setLoading(true);

      const resClase = await api.get(`/clases/${idClase}`);
      const claseData = resClase.data;

      // VALIDACIÓN HORARIO
      const validacion = validarHorarioClase(claseData);
      if (!validacion.ok) {
        setMensaje({ texto: validacion.msg, tipo: "error" });
        setLoading(false);
        return;
      }

      setClase(claseData);

      const resEst = await api.get(`/clases/${idClase}/estudiantes`);
      setEstudiantes(resEst.data);

      // 🔥 1. CONSULTAR HISTORIAL
      let estados = {};

      try {
        const fecha = getHoy();

        const resHist = await api.get(
          `/asistencias/historial?idClase=${idClase}&fecha=${fecha}`
        );

        // 🔥 SI HAY HISTORIAL → LO USAMOS
        if (resHist.status === 200 && resHist.data?.length > 0) {
          resHist.data.forEach(item => {
            estados[item.estudiante.idEstudiante] = item.estado;
          });
        } else {
          // 🔥 SI NO HAY → INICIALIZA PRESENTE
          resEst.data.forEach(est => {
            estados[est.idEstudiante] = "PRESENTE";
          });
        }

      } catch (err) {
        // si falla historial, fallback seguro
        console.log("Sin historial, usando default");

        resEst.data.forEach(est => {
          estados[est.idEstudiante] = "PRESENTE";
        });
      }

      setAsistenciaEstados(estados);

    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al cargar datos", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0]; // YYYY-MM-DD
  };
  // ✅ CAMBIAR ESTADO
  const toggleEstadoAsistencia = (idEstudiante, estado) => {
    setAsistenciaEstados(prev => ({
      ...prev,
      [idEstudiante]: estado
    }));
  };

  const validarHorarioClase = (clase) => {
    if (!clase) return { ok: false, msg: "Clase no encontrada" };

    const ahora = new Date();
    const inicio = new Date(clase.fechaClase);
    const fin = new Date(clase.fechaTermino);

    const MARGEN = 10 * 60 * 1000;

    const inicioOk = new Date(inicio.getTime() - MARGEN);
    const finOk = new Date(fin.getTime() + MARGEN);

    if (ahora < inicioOk || ahora > finOk) {
      return {
        ok: false,
        msg: `Acceso denegado: fuera del horario de clase (${inicio.toLocaleTimeString()} - ${fin.toLocaleTimeString()})`
      };
    }

    return { ok: true };
};

  // ✅ GUARDAR
  const handleGuardarAsistencia = async () => {
    try {
      setLoading(true);

      // 🔥 volver a consultar clase para evitar manipulación
      const resClase = await api.get(`/clases/${idClase}`);
      const claseActual = resClase.data;

      const validacion = validarHorarioClase(claseActual);
      if (!validacion.ok) {
        setMensaje({ texto: validacion.msg, tipo: "error" });
        setLoading(false);
        return;
      }

      const payload = {
        idClase: idClase,
        estudiantes: Object.keys(asistenciaEstados).map(id => ({
          idEstudiante: Number(id),
          estado: asistenciaEstados[id]
        }))
      };

      await api.post("/asistencias/registrar", payload);

      setMensaje({
        texto: "✅ Asistencia guardada correctamente",
        tipo: "success"
      });

    } catch (err) {
      console.error(err);
      setMensaje({
        texto: "❌ Error al guardar asistencia",
        tipo: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container2">
      <button className="btn-back" onClick={onBack}>
        ⬅ Volver a Clases
      </button>

      <h2>Registro de Asistencia</h2>

      {clase && (
        <div className="clase-info">
          <p><strong>Curso:</strong> {clase.nombreCursoVisual}</p>
          <p><strong>Tema:</strong> {clase.titulo}</p>
        </div>
      )}

      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo === "success" ? "alert-success" : "alert-error"}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="lista-estudiantes">
        {loading ? <p className="loading-msg">Cargando estudiantes...</p> : (
          estudiantes.map(alumno => {
            const esPresente = asistenciaEstados[alumno.idEstudiante] === "PRESENTE";
            return (
              <div key={alumno.idEstudiante} className="alumno-item">
                <span className="alumno-nombre">{alumno.apellidos}, {alumno.nombres}</span>
                <div className="acciones-asistencia">
                  <button
                    className={`btn-asistencia-op ${esPresente ? "activo-si" : ""}`}
                    onClick={() => toggleEstadoAsistencia(alumno.idEstudiante, "PRESENTE")}
                  >Presente</button>
                  <button
                    className={`btn-asistencia-op ${!esPresente ? "activo-no" : ""}`}
                    onClick={() => toggleEstadoAsistencia(alumno.idEstudiante, "AUSENTE")}
                  >Ausente</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="btn-videoconferencia" onClick={handleGuardarAsistencia} disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
        💾 Guardar Asistencia
      </button>
    </div>
  );
}
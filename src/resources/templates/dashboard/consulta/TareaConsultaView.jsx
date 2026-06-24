import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function TareaConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [clases, setClases] = useState([]);
  const [tareasList, setTareasList] = useState([]); // Almacena el resultado final de la consulta

  // Estados de segmentación para la cascada estructural
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);

  // Captura de selectores
  const [seleccion, setSeleccion] = useState({
    idSede: '',
    idGrado: '',
    idCurso: '',
    idClase: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. CARGA SÍNCRONA DE LA MALLA CURRICULAR (Mismo motor organizacional)
  useEffect(() => {
    const cargarEstructuraMalla = async () => {
      setLoading(true);
      try {
        const [resSedes, resGrados, resCursos, resClases] = await Promise.all([
          api.get('/sedes'),
          api.get('/grados'),
          api.get('/cursos'),
          api.get('/clases')
        ]);

        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setCursos(resCursos.data);
        setClases(resClases.data);

        // Preselección e inicialización en cascada por defecto
        if (resSedes.data.length > 0) {
          const primeraSedeId = resSedes.data[0].idSede;
          const deSede = resGrados.data.filter(g => (g.idSede?.idSede || g.idSede) === primeraSedeId);
          setGradosFiltrados(deSede);

          const primerGradoId = deSede[0]?.idGrado || '';
          const deGrado = resCursos.data.filter(c => (c.idGrado?.idGrado || c.idGrado) === primerGradoId);
          setCursosFiltrados(deGrado);

          const primerCursoId = deGrado[0]?.idCurso || '';
          const deCurso = resClases.data.filter(cl => (cl.idCurso?.idCurso || cl.idCurso) === primerCursoId);
          setClasesFiltradas(deCurso);

          setSeleccion({
            idSede: primeraSedeId,
            idGrado: primerGradoId,
            idCurso: primerCursoId,
            idClase: deCurso[0]?.idClase || ''
          });
        }
      } catch (err) {
        console.error("Error cargando estructura de consulta para tareas:", err);
        setMensaje({ texto: "Error al recopilar datos organizacionales de la institución.", tipo: "error" });
      } finally {
        setLoading(false);
      }
    };

    cargarEstructuraMalla();
  }, []);

  // 2. MANEJO DE SELECCIÓN EN CASCADA (SEDE -> GRADO -> CURSO -> CLASE)
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    const idNum = value ? Number(value) : '';
    setTareasList([]); // Limpiar la lista de tareas al mutar filtros
    setMensaje({ texto: '', tipo: '' });

    if (name === 'idSede') {
      const deSede = grados.filter(g => (g.idSede?.idSede || g.idSede) === idNum);
      setGradosFiltrados(deSede);

      const primerGradoId = deSede[0]?.idGrado || '';
      const deGrado = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === primerGradoId);
      setCursosFiltrados(deGrado);

      const primerCursoId = deGrado[0]?.idCurso || '';
      const deCurso = clases.filter(cl => (cl.idCurso?.idCurso || cl.idCurso) === primerCursoId);
      setClasesFiltradas(deCurso);

      setSeleccion({
        idSede: idNum,
        idGrado: primerGradoId,
        idCurso: primerCursoId,
        idClase: deCurso[0]?.idClase || ''
      });

    } else if (name === 'idGrado') {
      const deGrado = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === idNum);
      setCursosFiltrados(deGrado);

      const primerCursoId = deGrado[0]?.idCurso || '';
      const deCurso = clases.filter(cl => (cl.idCurso?.idCurso || cl.idCurso) === primerCursoId);
      setClasesFiltradas(deCurso);

      setSeleccion(prev => ({
        ...prev,
        idGrado: idNum,
        idCurso: primerCursoId,
        idClase: deCurso[0]?.idClase || ''
      }));

    } else if (name === 'idCurso') {
      const deCurso = clases.filter(cl => (cl.idCurso?.idCurso || cl.idCurso) === idNum);
      setClasesFiltradas(deCurso);

      setSeleccion(prev => ({
        ...prev,
        idCurso: idNum,
        idClase: deCurso[0]?.idClase || ''
      }));

    } else {
      setSeleccion(prev => ({ ...prev, [name]: idNum }));
    }
  };

  // 3. CONSULTAR LAS TAREAS DE LA CLASE SELECCIONADA
  const handleBuscarTareas = async (e) => {
    e.preventDefault();
    if (!seleccion.idClase) {
      setMensaje({ texto: 'Por favor, elija una clase válida.', tipo: 'error' });
      return;
    }

    setLoadingTareas(true);
    setMensaje({ texto: '', tipo: '' });
    setTareasList([]);

    try {
      // 🚀 Llamada a tu nuevo endpoint del Backend: /api/tareas/clase/{idClase}
      const response = await api.get(`/tareas/clase/${seleccion.idClase}`);

      if (response.data.length === 0) {
        setMensaje({ texto: 'Esta clase no registra ninguna tarea asignada actualmente.', tipo: 'error' });
        return;
      }

      setTareasList(response.data);
    } catch (err) {
      console.error("Error al recuperar tareas de la clase:", err);
      setMensaje({ texto: 'Error al consultar las tareas en el servidor.', tipo: 'error' });
    } finally {
      setLoadingTareas(false);
    }
  };

return (
  <div className="page-container">

    {/* ===== CARD FILTROS ===== */}
    <div className="card">
      <h3 className="card-title">
        🔍 Consulta de Tareas por Aula y Sesión
      </h3>

      <form onSubmit={handleBuscarTareas} className="form-grid">

        <div className="input-group">
          <label className="input-label">1. Sede / Campus</label>
          <select
            name="idSede"
            value={seleccion.idSede}
            onChange={handleFiltroChange}
            className="select"
          >
            {sedes.map(s => (
              <option key={s.idSede} value={s.idSede}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">2. Grado Escolar</label>
          <select
            name="idGrado"
            value={seleccion.idGrado}
            onChange={handleFiltroChange}
            disabled={gradosFiltrados.length === 0}
            className="select"
          >
            {gradosFiltrados.map(g => (
              <option key={g.idGrado} value={g.idGrado}>
                {g.nombreGrado} - "{g.seccion}"
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">3. Curso</label>
          <select
            name="idCurso"
            value={seleccion.idCurso}
            onChange={handleFiltroChange}
            disabled={cursosFiltrados.length === 0}
            className="select"
          >
            {cursosFiltrados.map(c => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.nombreCurso}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">4. Clase</label>
          <select
            name="idClase"
            value={seleccion.idClase}
            onChange={handleFiltroChange}
            disabled={clasesFiltradas.length === 0}
            className="select"
          >
            {clasesFiltradas.map(cl => (
              <option key={cl.idClase} value={cl.idClase}>
                {new Date(cl.fechaClase).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || clasesFiltradas.length === 0}
            className="btn-primary"
          >
            {loadingTareas ? "Cargando..." : "📂 Ver Tareas"}
          </button>
        </div>
      </form>
    </div>

    {/* ===== MENSAJE ===== */}
    {mensaje.texto && (
      <div className={`alert ${mensaje.tipo}`}>
        ⚠️ {mensaje.texto}
      </div>
    )}

    {/* ===== RESULTADOS ===== */}
    {tareasList.length > 0 && (
      <div className="page-container">
        <h4 className="section-title">
          📋 Tareas Asignadas
        </h4>

        <div className="task-list">
          {tareasList.map(tarea => (
            <div key={tarea.idTarea} className="task-card">

              <div className="task-header">
                <h5>📌 {tarea.titulo}</h5>
                <span className="task-id">
                  ID #{tarea.idTarea}
                </span>
              </div>

              <p className="task-desc">
                {tarea.descripcion || "Sin descripción"}
              </p>

              <div className="task-dates">
                <div>
                  <span>📅 Inicio: </span>
                  <strong>
                    {new Date(tarea.fechaInicio).toLocaleDateString()}
                  </strong>
                </div>

                <div>
                  <span>🚨 Fin: </span>
                  <strong className="text-danger">
                    {new Date(tarea.fechaTermino).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {tarea.urlArchivoAdjunto && (
                <a
                  href={tarea.urlArchivoAdjunto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="task-link"
                >
                  📎 Ver archivo
                </a>
              )}

            </div>
          ))}
        </div>
      </div>
    )}

  </div>
);
}
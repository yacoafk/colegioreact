import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function AsistenciaConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [clases, setClases] = useState([]);
  const [historialAlumnos, setHistorialAlumnos] = useState([]);

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
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. CARGA SÍNCRONA DE LA MALLA CURRICULAR
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
        console.error("Error cargando estructura de consulta:", err);
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
    setHistorialAlumnos([]); // Limpiar la tabla histórica al cambiar filtros
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

  // 3. CONSULTAR AUDITORÍA E HISTORIAL DE ASISTENCIA
  const handleBuscarHistorial = async (e) => {
    e.preventDefault();
    if (!seleccion.idClase) {
      setMensaje({ texto: 'Por favor, elija una clase válida.', tipo: 'error' });
      return;
    }

    const claseActual = clases.find(c => c.idClase === seleccion.idClase);
    if (!claseActual) return;

    setLoadingHistorial(true);
    setMensaje({ texto: '', tipo: '' });
    setHistorialAlumnos([]);

    try {
      // Extraemos la fecha limpia de la clase (YYYY-MM-DD)
      const fechaLimpia = claseActual.fechaClase.split('T')[0];
      
      // Llamada a nuestro nuevo endpoint histórico
      const response = await api.get(`/asistencias/historial?idClase=${seleccion.idClase}&fecha=${fechaLimpia}`);

      if (response.status === 204 || response.data.length === 0) {
        setMensaje({ texto: 'Clase sin registro de asistencia.', tipo: 'error' });
        return;
      }

      setHistorialAlumnos(response.data);
    } catch (err) {
      console.error("Error al recuperar asistencia retroactiva:", err);
      setMensaje({ texto: 'Error al consultar los registros históricos en el servidor.', tipo: 'error' });
    } finally {
      setLoadingHistorial(false);
    }
  };

  return (
    <div className="page-container">

      {/* ===== CARD BUSCADOR ===== */}
      <div className="card">
        <h3 className="card-title">
          🔍 Historial y Auditoría de Asistencias Pasadas
        </h3>

        <form onSubmit={handleBuscarHistorial} className="form-grid">

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
            <label className="input-label">3. Asignatura / Curso</label>
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
              {cursosFiltrados.length === 0 && (
                <option value="">No hay cursos registrados</option>
              )}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">4. Fecha y Sesión Evaluada</label>
            <select
              name="idClase"
              value={seleccion.idClase}
              onChange={handleFiltroChange}
              disabled={clasesFiltradas.length === 0}
              className="select"
            >
              {clasesFiltradas.map(cl => (
                <option key={cl.idClase} value={cl.idClase}>
                  {new Date(cl.fechaClase).toLocaleDateString('es-ES')} - {cl.titulo}
                </option>
              ))}
              {clasesFiltradas.length === 0 && (
                <option value="">Sin clases agendadas</option>
              )}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || clasesFiltradas.length === 0}
              className="btn-primary"
            >
              {loadingHistorial
                ? 'Buscando en Archivos...'
                : '📂 Recuperar Reporte'}
            </button>
          </div>

        </form>
      </div>

      {/* ===== ALERTA ===== */}
      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo}`}>
          {mensaje.tipo === 'error'
            ? `⚠️ ${mensaje.texto}`
            : `✔ ${mensaje.texto}`}
        </div>
      )}

      {/* ===== TABLA HISTORIAL ===== */}
      {historialAlumnos.length > 0 && (
        <div className="card">

          <div className="flex-between">
            <h4 className="section-title">
              📋 Alumnado Registrado
            </h4>

            <span className="text-muted">
              Modo: Histórico / Solo Lectura
            </span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Código Alumno</th>
                <th>Apellidos y Nombres</th>
                <th className="text-center" style={{ width: '180px' }}>
                  Estado Registrado
                </th>
              </tr>
            </thead>

            <tbody>
              {historialAlumnos.map(item => (
                <tr key={item.estudiante.idEstudiante}>

                  <td className="text-primary">
                    {item.estudiante.codigoEstudiante ||
                      `ALU-${item.estudiante.idEstudiante}`}
                  </td>

                  <td>
                    {`${item.estudiante.apellidos}, ${item.estudiante.nombres}`}
                  </td>

                  <td className="text-center">
                    <span
                      className={`status ${
                        item.estado === 'PRESENTE'
                          ? 'active'
                          : 'inactive'
                      }`}
                    >
                      {item.estado === 'PRESENTE'
                        ? '✔ PRESENTE'
                        : '❌ AUSENTE'}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}
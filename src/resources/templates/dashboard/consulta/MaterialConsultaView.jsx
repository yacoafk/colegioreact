import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function MaterialConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [clases, setClases] = useState([]);
  const [materialesList, setMaterialesList] = useState([]); // Almacena el resultado de la consulta

  // Estados de segmentación para la cascada estructural
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);

  // Captura de selectores estructurales
  const [seleccion, setSeleccion] = useState({
    idSede: '',
    idGrado: '',
    idCurso: '',
    idClase: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingMateriales, setLoadingMateriales] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. CARGA DE LA MALLA CURRICULAR
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
        console.error("Error cargando estructura de consulta para materiales:", err);
        setMensaje({ texto: "Error al recopilar datos organizacionales de la institución.", tipo: "error" });
      } finally {
        setLoading(false);
      }
    };

    cargarEstructuraMalla();
  }, []);

  // 2. MANEJO DE SELECCIÓN EN CASCADA DINÁMICA
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    const idNum = value ? Number(value) : '';
    setMaterialesList([]); // Limpiar resultados al cambiar filtros institucionales
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

  // 3. CONSULTAR LOS MATERIALES SEMANALES DE LA SESIÓN SELECCIONADA
  const handleBuscarMateriales = async (e) => {
    e.preventDefault();
    if (!seleccion.idClase) {
      setMensaje({ texto: 'Por favor, elija una sesión o clase válida.', tipo: 'error' });
      return;
    }

    setLoadingMateriales(true);
    setMensaje({ texto: '', tipo: '' });
    setMaterialesList([]);

    try {
      // 🚀 Endpoint del backend: /api/materiales/clase/{idClase}
      const response = await api.get(`/materiales/clase/${seleccion.idClase}`);

      if (response.data.length === 0) {
        setMensaje({ texto: 'Esta sesión no cuenta con material académico de estudio publicado.', tipo: 'error' });
        return;
      }

      setMaterialesList(response.data);
    } catch (err) {
      console.error("Error al recuperar materiales didácticos:", err);
      setMensaje({ texto: 'Error al consultar el repositorio de materiales en el servidor.', tipo: 'error' });
    } finally {
      setLoadingMateriales(false);
    }
  };

  return (
    <div className="page-container">

      {/* CARD FILTRO */}
      <div className="card">
        <h3 className="card-title">
          🔍 Consulta de Material de Estudio por Sesión
        </h3>

        <form onSubmit={handleBuscarMateriales} className="form-grid">

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
              {cursosFiltrados.length === 0 && (
                <option value="">No hay cursos</option>
              )}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">4. Sesión</label>
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
                <option value="">Sin clases</option>
              )}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || clasesFiltradas.length === 0}
              className="btn-primary"
            >
              {loadingMateriales ? 'Buscando...' : '📂 Ver Materiales'}
            </button>
          </div>

        </form>
      </div>

      {/* ALERTA */}
      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'error' : 'success'}`}>
          ⚠️ {mensaje.texto}
        </div>
      )}

      {/* LISTA DE MATERIALES */}
      {materialesList.length > 0 && (
        <div className="page-container">

          <h4 className="section-title">
            📚 Guías y Recursos Didácticos
          </h4>

          <div className="task-list">
            {materialesList.map(material => (
              <div key={material.idMaterial} className="task-card">

                <div className="task-header">
                  <h5>📖 {material.titulo}</h5>
                  <span className="task-id">
                    Material #{material.idMaterial}
                  </span>
                </div>

                <p className="task-desc">
                  {material.descripcion || "Sin descripción disponible."}
                </p>

                <div className="task-dates">
                  <div>
                    <span className="text-muted">🕒 Fecha:</span><br />
                    <strong>
                      {new Date(material.fechaPublicacion + 'T00:00:00')
                        .toLocaleDateString('es-ES')}
                    </strong>
                  </div>
                </div>

                {material.urlArchivo && (
                  <a
                    href={material.urlArchivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-link"
                  >
                    📥 Descargar / Abrir
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
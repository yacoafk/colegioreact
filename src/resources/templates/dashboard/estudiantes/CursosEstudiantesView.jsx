import { useState, useEffect } from 'react';

import api from '../../../../api'; 

import '../../../static/global.css'; 

export function CursosConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [todoLosCursos, setTodoLosCursos] = useState([]);
  
  // Listas e identificadores dinámicos para la segmentación en cascada
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);

  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Estados Nuevos para el Ojo (Ver Clases del Curso Seleccionado) ---
  const [cursoSeleccionadoVer, setCursoSeleccionadoVer] = useState(null);
  const [clasesDelCurso, setClasesDelCurso] = useState([]);
  const [loadingClases, setLoadingClases] = useState(false);

  // 1. DESCARGA SÍNCRONA DE LOS DATOS MAESTROS
  useEffect(() => {
    const cargarDatosMalla = async () => {
      setLoading(true);
      try {
        const [resSedes, resGrados, resCursos] = await Promise.all([
          api.get('/sedes'),
          api.get('/grados'),
          api.get('/cursos')
        ]);

        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setTodoLosCursos(resCursos.data);

        // Configurar la cascada inicial con el primer elemento disponible
        if (resSedes.data.length > 0) {
          const primeraSedeId = resSedes.data[0].idSede;
          setSelectedSede(primeraSedeId);

          const deSede = resGrados.data.filter(g => (g.idSede?.idSede || g.idSede) === primeraSedeId);
          setGradosFiltrados(deSede);

          if (deSede.length > 0) {
            setSelectedGrado(deSede[0].idGrado);
          }
        }
      } catch (err) {
        console.error("Error al recopilar la estructura curricular:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosMalla();
  }, []);

  // 2. MANEJADOR DEL CAMBIO DE SEDE (Actualiza Grados en Cascada)
  const handleSedeChange = (e) => {
    const sedeId = Number(e.target.value);
    setSelectedSede(sedeId);
    setCursoSeleccionadoVer(null); // Limpiar visor de clases al cambiar filtros

    const nuevosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === sedeId);
    setGradosFiltrados(nuevosGrados);

    if (nuevosGrados.length > 0) {
      setSelectedGrado(nuevosGrados[0].idGrado);
    } else {
      setSelectedGrado('');
      setCursosFiltrados([]);
    }
  };

  // 3. LÓGICA DE FILTRADO PARA MOSTRAR LOS CURSOS DEL GRADO SELECCIONADO
  useEffect(() => {
    if (selectedGrado) {
      const asignaturas = todoLosCursos.filter(c => {
        const gradoId = c.idGrado?.idGrado !== undefined ? c.idGrado.idGrado : c.idGrado;
        return Number(gradoId) === Number(selectedGrado);
      });
      setCursosFiltrados(asignaturas);
    } else {
      setCursosFiltrados([]);
    }
    setCursoSeleccionadoVer(null); // Limpiar visor al cambiar de grado
  }, [selectedGrado, todoLosCursos]);

  // 4. ACCIÓN DEL OJO: Cargar clases agendadas del curso
  const handleVerClasesClick = async (curso) => {
    setCursoSeleccionadoVer(curso);
    setLoadingClases(true);
    try {
      const response = await api.get(`/clases/curso/${curso.idCurso}`);
      setClasesDelCurso(response.data);
    } catch (err) {
      console.error("Error al traer las clases de este curso", err);
      setClasesDelCurso([]);
    } finally {
      setLoadingClases(false);
    }
  };

  const formatearFecha = (stringFecha) => {
    if (!stringFecha) return '-';
    return new Date(stringFecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="page-container">

      {/* CARD DE CONTROL */}
      <div className="card">
        <h3 className="card-title">
          🔍 Visor y Consulta de Malla Curricular
        </h3>

        <div className="form-grid">

          {/* Sede */}
          <div className="input-group">
            <label className="input-label">1. Seleccionar Campus / Sede</label>
            <select 
              value={selectedSede} 
              onChange={handleSedeChange}
              className="select"
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Grado */}
          <div className="input-group">
            <label className="input-label">2. Grado, Sección y Nivel</label>
            <select 
              value={selectedGrado} 
              onChange={(e) => setSelectedGrado(Number(e.target.value))}
              disabled={gradosFiltrados.length === 0}
              className="select"
            >
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>
                  {g.nombreGrado} - Sección "{g.seccion}" ({g.nivel})
                </option>
              ))}
              {gradosFiltrados.length === 0 && (
                <option value="">No existen grados en esta sede</option>
              )}
            </select>
          </div>

        </div>
      </div>

      {/* RESULTADOS */}
      <div className="page-container">

        {/* TABLA DE CURSOS */}
        <div className="card">
          <div className="flex-between">
            <h4 className="section-title">
              Asignaturas Planificadas
              <span className="badge">
                {cursosFiltrados.length} Materias asignadas
              </span>
            </h4>
          </div>

          {loading ? (
            <p className="text-center text-muted">
              Sincronizando asignaturas vigentes...
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Código Curso</th>
                  <th>Nombre</th>
                  <th>Docente</th>
                  <th>Ubicación</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => (
                  <tr
                    key={curso.idCurso}
                    style={{
                      backgroundColor:
                        cursoSeleccionadoVer?.idCurso === curso.idCurso
                          ? '#f8fafc'
                          : 'transparent'
                    }}
                  >
                    <td className="text-primary">
                      📚 CRS-{curso.idCurso}
                    </td>

                    <td className="section-title">
                      {curso.nombreCurso}
                    </td>

                    <td>
                      {curso.nombreProfesorCompleto ||
                        (curso.idPersonal?.apellidos
                          ? `${curso.idPersonal.apellidos}, ${curso.idPersonal.nombres}`
                          : 'Por Asignar')}
                    </td>

                    <td>
                      <span className="status active">
                        {curso.nombreGradoVisual || 'Aula Activa'}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleVerClasesClick(curso)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}

                {cursosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No se han encontrado materias registradas en este grado académico.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* SUB-CARD CLASES */}
        {cursoSeleccionadoVer && (
          <div className="card" style={{ background: '#f8fafc' }}>
            
            <div className="flex-between">
              <h4 className="section-title">
                📅 Horarios: 
                <span className="text-primary">
                  {" "}{cursoSeleccionadoVer.nombreCurso}
                </span>
              </h4>

              <button
                onClick={() => setCursoSeleccionadoVer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ❌ Cerrar
              </button>
            </div>

            {loadingClases ? (
              <p className="text-muted">Cargando agenda académica...</p>
            ) : clasesDelCurso.length === 0 ? (
              <p className="text-danger">
                ⚠️ No hay sesiones programadas
              </p>
            ) : (
              <table className="table" style={{ background: '#fff' }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tema</th>
                    <th>Modalidad</th>
                  </tr>
                </thead>
                <tbody>
                  {clasesDelCurso.map((clase) => (
                    <tr key={clase.idClase}>
                      <td className="text-primary">
                        {formatearFecha(clase.fechaClase)}
                      </td>

                      <td>{clase.titulo}</td>

                      <td>
                        {clase.urlVideoconferencia ? (
                          <a
                            href={clase.urlVideoconferencia}
                            target="_blank"
                            rel="noreferrer"
                            className="task-link"
                          >
                            🔗 Enlace Virtual
                          </a>
                        ) : (
                          <span className="text-muted">
                            Presencial
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* CARD DE CONTROL: SELECTORES EN CASCADA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.3rem' }}>
          🔍 Visor y Consulta de Malla Curricular
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Selector 1: Sedes */}
          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>1. Seleccionar Campus / Sede</label>
            <select 
              value={selectedSede} 
              onChange={handleSedeChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector 2: Grados */}
          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>2. Grado, Sección y Nivel</label>
            <select 
              value={selectedGrado} 
              onChange={(e) => setSelectedGrado(Number(e.target.value))}
              disabled={gradosFiltrados.length === 0}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>
                  {g.nombreGrado} - Sección "{g.seccion}" ({g.nivel})
                </option>
              ))}
              {gradosFiltrados.length === 0 && <option value="">No existen grados en esta sede</option>}
            </select>
          </div>

        </div>
      </div>

      {/* SECCIÓN DE RESULTADOS DINÁMICOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* CARD PRINCIPAL: TABLA DE CURSOS */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--text-main)', fontWeight: '600', margin: 0 }}>
              Asignaturas Planificadas
              <span style={{ marginLeft: '10px', fontSize: '0.85rem', background: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                {cursosFiltrados.length} Materias asignadas
              </span>
            </h4>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Sincronizando asignaturas vigentes...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', height: '40px' }}>
                  <th style={{ padding: '10px', width: '120px' }}>Código Curso</th>
                  <th>Nombre de la Asignatura / Curso</th>
                  <th>Docente Titular Asignado</th>
                  <th>Ubicación</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => (
                  <tr key={curso.idCurso} style={{ borderBottom: '1px solid var(--border-light)', height: '48px', backgroundColor: cursoSeleccionadoVer?.idCurso === curso.idCurso ? '#f8fafc' : 'transparent' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--primary-color)' }}>
                      📚 CRS-{curso.idCurso}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {curso.nombreCurso}
                    </td>
                    <td style={{ color: 'var(--text-main)' }}>
                      {curso.nombreProfesorCompleto || (curso.idPersonal?.apellidos ? `${curso.idPersonal.apellidos}, ${curso.idPersonal.nombres}` : 'Por Asignar')}
                    </td>
                    <td>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {curso.nombreGradoVisual || 'Aula Activa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {/* El Ojo interactivo */}
                      <button 
                        onClick={() => handleVerClasesClick(curso)}
                        title="Ver cronograma de clases"
                        style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}

                {cursosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No se han encontrado materias registradas en este grado académico.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* SUB-CARD REACTIVO: SE DESPLIEGA ABAJO AL PRESIONAR EL OJO */}
        {cursoSeleccionadoVer && (
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem' }}>
                📅 Horarios de Clase Evaluados: <span style={{ color: '#0284c7' }}>{cursoSeleccionadoVer.nombreCurso}</span>
              </h4>
              <button 
                onClick={() => setCursoSeleccionadoVer(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}
              >
                ❌ Cerrar Visor
              </button>
            </div>

            {loadingClases ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando agenda académica...</p>
            ) : clasesDelCurso.length === 0 ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#b45309', margin: 0 }}>
                ⚠️ No se registran sesiones, fechas ni videoconferencias programadas para esta asignatura todavía.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f1f5f9', color: 'var(--text-muted)', height: '35px' }}>
                    <th style={{ padding: '10px' }}>Fecha y Hora Programada</th>
                    <th>Tema / Bloque de la Sesión</th>
                    <th>Aula / Enlace Remoto</th>
                  </tr>
                </thead>
                <tbody>
                  {clasesDelCurso.map(clase => (
                    <tr key={clase.idClase} style={{ borderBottom: '1px solid #f1f5f9', height: '40px' }}>
                      <td style={{ padding: '10px', fontWeight: '600', color: '#b45309' }}>
                        {formatearFecha(clase.fechaClase)}
                      </td>
                      <td style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                        {clase.titulo}
                      </td>
                      <td>
                        {clase.urlVideoconferencia ? (
                          <a href={clase.urlVideoconferencia} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                            🔗 Enlace Virtual
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Presencial</span>
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
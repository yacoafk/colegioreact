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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* CARD DEL BUSCADOR */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>
          🔍 Historial y Auditoría de Asistencias Pasadas
        </h3>
        
        <form onSubmit={handleBuscarHistorial} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>1. Sede / Campus</label>
            <select name="idSede" value={seleccion.idSede} onChange={handleFiltroChange} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>2. Grado Escolar</label>
            <select name="idGrado" value={seleccion.idGrado} onChange={handleFiltroChange} disabled={gradosFiltrados.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              {gradosFiltrados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado} - "{g.seccion}"</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>3. Asignatura / Curso</label>
            <select name="idCurso" value={seleccion.idCurso} onChange={handleFiltroChange} disabled={cursosFiltrados.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              {cursosFiltrados.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso}</option>)}
              {cursosFiltrados.length === 0 && <option value="">No hay cursos registrados</option>}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>4. Fecha y Sesión Evaluada</label>
            <select name="idClase" value={seleccion.idClase} onChange={handleFiltroChange} disabled={clasesFiltradas.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              {clasesFiltradas.map(cl => (
                <option key={cl.idClase} value={cl.idClase}>
                  {new Date(cl.fechaClase).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric'})} - {cl.titulo}
                </option>
              ))}
              {clasesFiltradas.length === 0 && <option value="">Sin clases agendadas</option>}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" disabled={loading || clasesFiltradas.length === 0} style={{ padding: '11px 28px', background: '#0369a1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              {loadingHistorial ? 'Buscando en Archivos...' : '📂 Recuperar Reporte'}
            </button>
          </div>
        </form>
      </div>

      {/* RECUADRO DE MENSAJE O ADVERTENCIA ("CLASE SIN REGISTRO DE ASISTENCIA") */}
      {mensaje.texto && (
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          background: mensaje.tipo === 'error' ? '#fff7ed' : '#f0fdf4', 
          color: mensaje.tipo === 'error' ? '#c2410c' : '#166534', 
          border: `1px solid ${mensaje.tipo === 'error' ? '#fed7aa' : '#bbf7d0'}`, 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {mensaje.tipo === 'error' ? `⚠️ ${mensaje.texto}` : `✔ ${mensaje.texto}`}
        </div>
      )}

      {/* REPORTE TABULAR DE ASISTENCIAS GUARDADAS EN EL PASADO */}
      {historialAlumnos.length > 0 && (
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>📋 Alumnado Registrado</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Modo: Histórico / Solo Lectura</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', height: '36px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '10px' }}>Código Alumno</th>
                <th>Apellidos y Nombres</th>
                <th style={{ textAlign: 'center', width: '180px' }}>Estado Registrado</th>
              </tr>
            </thead>
            <tbody>
              {historialAlumnos.map(item => (
                <tr key={item.estudiante.idEstudiante} style={{ borderBottom: '1px solid var(--border-light)', height: '46px' }}>
                  <td style={{ padding: '10px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {item.estudiante.codigoEstudiante || `ALU-${item.estudiante.idEstudiante}`}
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>
                    {`${item.estudiante.apellidos}, ${item.estudiante.nombres}`}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      padding: '5px 14px', 
                      borderRadius: '6px', 
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      background: item.estado === 'PRESENTE' ? '#dcfce7' : '#fee2e2',
                      color: item.estado === 'PRESENTE' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${item.estado === 'PRESENTE' ? '#bbf7d0' : '#fca5a5'}`
                    }}>
                      {item.estado === 'PRESENTE' ? '✔ PRESENTE' : '❌ AUSENTE'}
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
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* CARD DEL BUSCADOR */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>
          🔍 Consulta de Tareas por Aula y Sesión
        </h3>
        
        <form onSubmit={handleBuscarTareas} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>4. Sesión o Clase</label>
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
              {loadingTareas ? 'Cargando Tareas...' : '📂 Ver Tareas'}
            </button>
          </div>
        </form>
      </div>

      {/* RECUADRO DE ADVERTENCIA */}
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
          ⚠️ {mensaje.texto}
        </div>
      )}

      {/* VISTA DE TARJETAS/REPORTES DE LAS TAREAS ENCONTRADAS */}
      {tareasList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>📋 Tareas Asignadas a esta Sesión</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {tareasList.map((tarea) => (
              <div key={tarea.idTarea} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    📌 {tarea.titulo}
                  </h5>
                  <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                    ID Tarea: #{tarea.idTarea}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {tarea.descripcion || "Sin descripción detallada."}
                </p>

                <hr style={{ border: '0', borderTop: '1px solid var(--border-light)', marginBottom: '12px' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>📅 Fecha de Inicio: </span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {new Date(tarea.fechaInicio).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>🚨 Plazo Máximo: </span>
                    <strong style={{ color: '#b91c1c' }}>
                      {new Date(tarea.fechaTermino).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </strong>
                  </div>
                </div>

                {tarea.urlArchivoAdjunto && (
                  <div style={{ marginTop: '14px' }}>
                    <a 
                      href={tarea.urlArchivoAdjunto} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      📎 Ver material adjunto / documento de la tarea
                    </a>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
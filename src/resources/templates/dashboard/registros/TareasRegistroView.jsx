import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function TareasRegistroView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [clases, setClases] = useState([]);

  // Estados para controlar el filtrado secuencial (Cascada de 4 niveles)
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);

  // Estado del formulario de selección
  const [seleccion, setSeleccion] = useState({
    idSede: '',
    idGrado: '',
    idCurso: '',
    idClase: ''
  });

  // Estado del formulario de la Tarea
  const [formTarea, setFormTarea] = useState({
    titulo: '',
    descripcion: '',
    urlArchivoAdjunto: '',
    fechaInicio: '',
    fechaTermino: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. CARGA INICIAL DE LA MALLA ACADÉMICA
  useEffect(() => {
    const cargarMallaAcademica = async () => {
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

        // Inicializar cascada con los primeros registros disponibles
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
        console.error("Error cargando parámetros estructurales para tareas:", err);
        setMensaje({ texto: "Error al sincronizar la estructura académica con el servidor.", tipo: "error" });
      } finally {
        setLoading(false);
      }
    };

    cargarMallaAcademica();
  }, []);

  // 2. MANEJO DE FILTROS EN CASCADA DINÁMICA
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    const idNum = value ? Number(value) : '';
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

  // Manejo de inputs del formulario de tareas
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormTarea(prev => ({ ...prev, [name]: value }));
  };

  // 3. ENVÍO DE DATOS POST HACIA TAREACONTROLLER
  const handleRegistrarTarea = async (e) => {
    e.preventDefault();
    if (!seleccion.idClase) {
      setMensaje({ texto: 'Debe seleccionar una Clase/Sesión válida para asignar la tarea.', tipo: 'error' });
      return;
    }

    setSubmitting(true);
    setMensaje({ texto: '', tipo: '' });

    // Construcción del Payload exacto respetando el TareaRequest de tu backend
    const payload = {
      idClase: seleccion.idClase,
      titulo: formTarea.titulo,
      descripcion: formTarea.descripcion,
      urlArchivoAdjunto: formTarea.urlArchivoAdjunto || null,
      fechaInicio: formTarea.fechaInicio,
      fechaTermino: formTarea.fechaTermino
    };

    try {
      await api.post('/tareas/registrar', payload);
      setMensaje({ texto: '¡La tarea ha sido asignada y registrada con éxito en la sesión actual!', tipo: 'success' });
      
      // Limpiar el formulario para nuevos ingresos
      setFormTarea({
        titulo: '',
        descripcion: '',
        urlArchivoAdjunto: '',
        fechaInicio: '',
        fechaTermino: ''
      });
    } catch (err) {
      console.error("Error registrando tarea:", err);
      const errorMsg = err.response?.data?.error || 'Error de conexión con el servidor al guardar la tarea.';
      setMensaje({ texto: errorMsg, tipo: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECCIÓN 1: SELECTORES EN CASCADA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '14px' }}>
          🎯 Programación de Actividades y Tareas
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Sede</label>
            <select name="idSede" value={seleccion.idSede} onChange={handleFiltroChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }}>
              {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Grado / Sección</label>
            <select name="idGrado" value={seleccion.idGrado} onChange={handleFiltroChange} disabled={gradosFiltrados.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }}>
              {gradosFiltrados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado} - "{g.seccion}"</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Curso</label>
            <select name="idCurso" value={seleccion.idCurso} onChange={handleFiltroChange} disabled={cursosFiltrados.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }}>
              {cursosFiltrados.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso}</option>)}
              {cursosFiltrados.length === 0 && <option value="">Sin cursos</option>}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', display: 'block', marginBottom: '4px', color: 'var(--primary-color)' }}>Clase Vincular</label>
            <select name="idClase" value={seleccion.idClase} onChange={handleFiltroChange} disabled={clasesFiltradas.length === 0} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--primary-color)' }}>
              {clasesFiltradas.map(cl => (
                <option key={cl.idClase} value={cl.idClase}>
                  {cl.titulo} ({new Date(cl.fechaClase).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit'})})
                </option>
              ))}
              {clasesFiltradas.length === 0 && <option value="">Sin sesiones creadas</option>}
            </select>
          </div>
        </div>
      </div>

      {/* MENSAJES OPERATIVOS REACULARES */}
      {mensaje.texto && (
        <div style={{ 
          padding: '16px', borderRadius: '8px', fontWeight: '500',
          background: mensaje.tipo === 'error' ? '#fff5f5' : '#f0fdf4', 
          color: mensaje.tipo === 'error' ? '#c53030' : '#15803d', 
          border: `1px solid ${mensaje.tipo === 'error' ? '#feb2b2' : '#bbf7d0'}`
        }}>
          {mensaje.tipo === 'error' ? `⚠️ ${mensaje.texto}` : `✅ ${mensaje.texto}`}
        </div>
      )}

      {/* SECCIÓN 2: FORMULARIO ALTA DE TAREA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h4 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '16px' }}>📝 Detalles de la Nueva Tarea</h4>
        
        <form onSubmit={handleRegistrarTarea} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Título de la Actividad</label>
            <input type="text" name="titulo" value={formTarea.titulo} onChange={handleFormChange} required placeholder="Ej: Resolver cuestionario de integrales" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }} />
          </div>

          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Indicaciones / Descripción</label>
            <textarea name="descripcion" value={formTarea.descripcion} onChange={handleFormChange} rows="4" required placeholder="Escriba aquí los pasos detallados, rúbrica o criterios de evaluación..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)', fontFamily: 'inherit' }}></textarea>
          </div>

          <div>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Enlace de Recurso Adjunto (Opcional)</label>
            <input type="url" name="urlArchivoAdjunto" value={formTarea.urlArchivoAdjunto} onChange={handleFormChange} placeholder="https://drive.google.com/... (Lecturas o Guías)" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Fecha y Hora de Apertura</label>
              <input type="datetime-local" name="fechaInicio" value={formTarea.fechaInicio} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }} />
            </div>
            <div>
              <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Fecha y Hora de Entrega Límite</label>
              <input type="datetime-local" name="fechaTermino" value={formTarea.fechaTermino} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1.5px solid var(--border-input)' }} />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" disabled={submitting || clasesFiltradas.length === 0 || loading} style={{ padding: '12px 32px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
              {submitting ? 'Publicando...' : '🚀 Publicar Tarea en Aula'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
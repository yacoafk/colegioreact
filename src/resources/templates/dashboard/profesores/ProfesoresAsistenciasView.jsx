import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function AsistenciaRegistroView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [clases, setClases] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  // Estados para los filtros en cascada
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);

  // Valores seleccionados en el formulario
  const [seleccion, setSeleccion] = useState({
    idSede: '',
    idGrado: '',
    idClase: ''
  });

  // Estado de la lista de asistencia: { idEstudiante: 'PRESENTE' | 'AUSENTE' }
  const [asistenciaEstados, setAsistenciaEstados] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. CARGAR DATOS MAESTROS AL INICIALIZAR
  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [resSedes, resGrados, resClases] = await Promise.all([
        api.get('/sedes'),
        api.get('/grados'),
        api.get('/clases') 
      ]);

      setSedes(resSedes.data);
      setGrados(resGrados.data);
      setClases(resClases.data);

      const primeraSedeId = resSedes.data[0]?.idSede || '';
      const filtradosGrados = resGrados.data.filter(g => (g.idSede?.idSede || g.idSede) === primeraSedeId);
      setGradosFiltrados(filtradosGrados);

      const primerGradoId = filtradosGrados[0]?.idGrado || '';
      const filtradasClases = resClases.data.filter(clase => clase.idGrado === primerGradoId || clase.nombreGradoVisual?.includes(filtradosGrados[0]?.nombreGrado)); 
      setClasesFiltradas(filtradasClases);

      setSeleccion({
        idSede: primeraSedeId,
        idGrado: primerGradoId,
        idClase: filtradasClases[0]?.idClase || ''
      });

    } catch (err) {
      console.error("Error al precargar los selectores de asistencia:", err);
      setMensaje({ texto: 'Error al conectar con los servicios del colegio.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // 2. CONTROLAR FILTROS EN CASCADA
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    const idNum = value ? Number(value) : '';

    if (name === 'idSede') {
      const nuevosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === idNum);
      setGradosFiltrados(nuevosGrados);

      const primerGradoId = nuevosGrados[0]?.idGrado || '';
      const nuevasClases = clases.filter(clase => clase.idGrado === primerGradoId || clase.nombreGradoVisual?.includes(nuevosGrados[0]?.nombreGrado));
      setClasesFiltradas(nuevasClases);

      setSeleccion({
        idSede: idNum,
        idGrado: primerGradoId,
        idClase: nuevasClases[0]?.idClase || ''
      });
      setEstudiantes([]); 

    } else if (name === 'idGrado') {
      const gradoSeleccionado = grados.find(g => g.idGrado === idNum);
      const nuevasClases = clases.filter(clase => clase.idGrado === idNum || clase.nombreGradoVisual?.includes(gradoSeleccionado?.nombreGrado));
      setClasesFiltradas(nuevasClases);

      setSeleccion(prev => ({
        ...prev,
        idGrado: idNum,
        idClase: nuevasClases[0]?.idClase || ''
      }));
      setEstudiantes([]);

    } else {
      setSeleccion(prev => ({ ...prev, [name]: idNum }));
      setEstudiantes([]);
    }
  };

  // 3. BUSCAR ESTUDIANTES POR ENDPOINT Y VALIDAR RESTRICCIÓN HORARIA
  const handleCargarAlumnado = async (e) => {
    e.preventDefault();
    if (!seleccion.idClase || !seleccion.idGrado) {
      setMensaje({ texto: 'Por favor, elija una clase válida para iniciar el pase de lista.', tipo: 'error' });
      return;
    }

    const claseActual = clases.find(c => c.idClase === seleccion.idClase);
    if (claseActual) {
      const ahora = new Date();
      const inicioClase = new Date(claseActual.fechaClase);
      const finClase = new Date(claseActual.fechaTermino);

      // Margen de tolerancia de 10 minutos
      const MARGEN_TOLERANCIA_MS = 10 * 60 * 1000; 
      const inicioConMargen = new Date(inicioClase.getTime() - MARGEN_TOLERANCIA_MS);
      const finConMargen = new Date(finClase.getTime() + MARGEN_TOLERANCIA_MS);

      // 🔴 RESTRICCIÓN: Validar estricta de fecha y hora
      if (ahora < inicioConMargen || ahora > finConMargen) {
        const nombreCurso = claseActual.nombreCursoVisual || "Asignatura";
        const temaTitulo = claseActual.titulo || "Sin título";
        
        setMensaje({ 
          texto: `Acceso denegado: Fuera del horario de clase para "${nombreCurso}" (${temaTitulo}). Programada: ${inicioClase.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', hour12: true})} a ${finClase.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', hour12: true})}.`, 
          tipo: 'error' 
        });
        return;
      }
    }

    setLoadingAlumnos(true);
    setMensaje({ texto: '', tipo: '' });
    setEstudiantes([]);

    try {
      // 🆕 LLAMADA AL NUEVO ENDPOINT DEL CONTROLADOR (Cero errores 404)
      const res = await api.get(`/estudiantes/grado/${seleccion.idGrado}`);
      
      if (res.status === 204 || !res.data) {
        setMensaje({ texto: 'No se encontraron alumnos registrados en este grado.', tipo: 'error' });
        return;
      }

      setEstudiantes(res.data);

      // Mapear estados iniciales. Si el backend ya mandara asistencia guardada lo leerías aquí,
      // por defecto los inicializamos como 'PRESENTE' si entran por primera vez.
      const estadoBase = {};
      res.data.forEach(est => {
        // conservamos el estado si ya existía en la vista en memoria, sino 'PRESENTE'
        estadoBase[est.idEstudiante] = asistenciaEstados[est.idEstudiante] || 'PRESENTE';
      });
      setAsistenciaEstados(estadoBase);

    } catch (err) {
      console.error("Error al traer estudiantes del aula:", err);
      setMensaje({ texto: 'No se pudo obtener el listado de alumnos para este grado.', tipo: 'error' });
    } finally {
      setLoadingAlumnos(false);
    }
  };

  // Cambiar dinámicamente entre PRESENTE o AUSENTE
  const toggleEstadoAsistencia = (idEstudiante, nuevoEstado) => {
    setAsistenciaEstados(prev => ({
      ...prev,
      [idEstudiante]: nuevoEstado
    }));
  };

  // 4. GUARDAR O ACTUALIZAR ASISTENCIA (POST AL ENDPOINT DE SPRING CON LOGICA UPSERT)
  const handleGuardarAsistencia = async () => {
    // 🔴 RE-VALIDAR ANTES DE ENVIAR AL BACKEND (Por si se venció la hora mientras pasaba lista)
    const claseActual = clases.find(c => c.idClase === seleccion.idClase);
    if (claseActual) {
      const ahora = new Date();
      const finClase = new Date(claseActual.fechaTermino);
      const MARGEN_TOLERANCIA_MS = 10 * 60 * 1000;

      if (ahora > new Date(finClase.getTime() + MARGEN_TOLERANCIA_MS)) {
        setMensaje({ texto: 'El tiempo límite de la clase ha expirado. No se puede guardar ni modificar el registro.', tipo: 'error' });
        return;
      }
    }

    setLoadingAlumnos(true);
    setMensaje({ texto: '', tipo: '' });

    const payload = {
      idClase: seleccion.idClase,
      estudiantes: Object.keys(asistenciaEstados).map(idStr => ({
        idEstudiante: Number(idStr),
        estado: asistenciaEstados[idStr]
      }))
    };

    try {
      // Envía al endpoint que procesa tanto Insert como Update de manera unificada
      await api.post('/asistencias/registrar', payload);
      setMensaje({ texto: '¡La lista de asistencia ha sido procesada e ingresada correctamente al sistema!', tipo: 'success' });
    } catch (err) {
      console.error("Error al registrar el lote de asistencia:", err);
      setMensaje({ texto: 'Error al intentar guardar o actualizar la asistencia en el servidor.', tipo: 'error' });
    } finally {
      setLoadingAlumnos(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* TARJETA SUPERIOR: SELECTORES DE BÚSQUEDA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px' }}>Pase de Asistencia</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Seleccione la sede y grado académico para localizar la clase del día.
        </p>

        <form onSubmit={handleCargarAlumnado} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '16px', alignItems: 'end' }}>
          <div className="input-group">
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Sede</label>
            <select name="idSede" value={seleccion.idSede} onChange={handleFiltroChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Grado / Sección</label>
            <select name="idGrado" value={seleccion.idGrado} onChange={handleFiltroChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {gradosFiltrados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado} - Secc. {g.seccion}</option>)}
              {gradosFiltrados.length === 0 && <option value="">Sin grados agendados</option>}
            </select>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--primary-color)' }}>Clase / Bloque Horario Activo</label>
            <select name="idClase" value={seleccion.idClase} onChange={handleFiltroChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--primary-color)' }}>
              {clasesFiltradas.map(c => {
                const horaIn = new Date(c.fechaClase).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', hour12: true});
                const horaFi = c.fechaTermino ? new Date(c.fechaTermino).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', hour12: true}) : 'Fin indefinido';
                return (
                  <option key={c.idClase} value={c.idClase}>
                    {c.nombreCursoVisual || "Curso"} - {c.titulo} ({horaIn} - {horaFi})
                  </option>
                );
              })}
              {clasesFiltradas.length === 0 && <option value="">No hay clases agendadas</option>}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={clasesFiltradas.length === 0 || loadingAlumnos}
            style={{ padding: '11px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
          >
            {loadingAlumnos ? 'Buscando...' : '🔍 Cargar Alumnos'}
          </button>
        </form>
      </div>

      {/* MENSAJES DEL SISTEMA */}
      {mensaje.texto && (
        <div style={{
          backgroundColor: mensaje.tipo === 'success' ? '#d1fae5' : 'var(--danger-bg)',
          color: mensaje.tipo === 'success' ? '#065f46' : 'var(--danger-text)',
          padding: '16px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', border: '1px solid'
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* LISTADO DE ALUMNOS */}
      {estudiantes.length > 0 && (
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Listado Oficial de Alumnos</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {estudiantes.map((alumno) => {
              const esPresente = asistenciaEstados[alumno.idEstudiante] === 'PRESENTE';
              return (
                <div key={alumno.idEstudiante} style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>
                      {alumno.apellidos}, {alumno.nombres}
                    </span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ID: EST-{alumno.idEstudiante}</small>
                  </div>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                    <button type="button" onClick={() => toggleEstadoAsistencia(alumno.idEstudiante, 'PRESENTE')} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', background: esPresente ? '#22c55e' : 'transparent', color: esPresente ? '#fff' : '#64748b' }}>Presente</button>
                    <button type="button" onClick={() => toggleEstadoAsistencia(alumno.idEstudiante, 'AUSENTE')} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', background: !esPresente ? '#ef4444' : 'transparent', color: !esPresente ? '#fff' : '#64748b' }}>Ausente</button>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={handleGuardarAsistencia} disabled={loadingAlumnos} style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
            {loadingAlumnos ? 'Guardando cambios...' : '💾 Confirmar y Guardar Asistencia'}
          </button>
        </div>
      )}
    </div>
  );
}
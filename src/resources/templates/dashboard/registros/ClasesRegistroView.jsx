import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function ClasesRegistroView() {
  const [clasesList, setClasesList] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);

  // Listas interactivas filtradas en cascada
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);

  const [editingId, setEditingId] = useState(null);

  // Campos del formulario (🆕 Agregado fechaTermino)
  const [formData, setFormData] = useState({
    idSede: '',
    idGrado: '',
    idCurso: '',
    titulo: '',
    descripcion: '',
    urlVideoconferencia: '',
    fechaClase: '',
    fechaTermino: '' 
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. OBTENER INFORMACIÓN DEL BACKEND
  const listarClases = async () => {
    try {
      const response = await api.get('/clases');
      setClasesList(response.data);
    } catch (err) {
      console.error("Error al obtener la lista de clases", err);
    }
  };

  const cargarDatosMaestros = async () => {
    try {
      const [resSedes, resGrados, resCursos] = await Promise.all([
        api.get('/sedes'),
        api.get('/grados'),
        api.get('/cursos')
      ]);

      setSedes(resSedes.data);
      setGrados(resGrados.data);
      setCursos(resCursos.data);

      // Valores iniciales por defecto para estructurar la cascada
      const sedeInicialId = resSedes.data[0]?.idSede || '';
      
      const gradosDeSede = resGrados.data.filter(g => (g.idSede?.idSede || g.idSede) === sedeInicialId);
      setGradosFiltrados(gradosDeSede);
      
      const gradoInicialId = gradosDeSede[0]?.idGrado || '';
      const cursosDeGrado = resCursos.data.filter(c => (c.idGrado?.idGrado || c.idGrado) === gradoInicialId);
      setCursosFiltrados(cursosDeGrado);

      setFormData({
        idSede: sedeInicialId,
        idGrado: gradoInicialId,
        idCurso: cursosDeGrado[0]?.idCurso || '',
        titulo: '',
        descripcion: '',
        urlVideoconferencia: '',
        fechaClase: '',
        fechaTermino: '' // 🆕 Inicialización limpia
      });

    } catch (err) {
      console.error("Error al cargar datos maestros para la agenda", err);
    }
  };

  useEffect(() => {
    listarClases();
    cargarDatosMaestros();
  }, []);

  // 2. MANEJADOR DE CAMBIOS EN CASCADA (SEDE -> GRADO -> CURSO)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'idSede') {
      const sedeId = Number(value);
      const nuevosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === sedeId);
      setGradosFiltrados(nuevosGrados);
      
      const primerGradoId = nuevosGrados[0]?.idGrado || '';
      const nuevosCursos = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === primerGradoId);
      setCursosFiltrados(nuevosCursos);

      setFormData(prev => ({
        ...prev,
        idSede: sedeId,
        idGrado: primerGradoId,
        idCurso: nuevosCursos[0]?.idCurso || ''
      }));

    } else if (name === 'idGrado') {
      const gradoId = Number(value);
      const nuevosCursos = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === gradoId);
      setCursosFiltrados(nuevosCursos);

      setFormData(prev => ({
        ...prev,
        idGrado: gradoId,
        idCurso: nuevosCursos[0]?.idCurso || ''
      }));

    } else {
      const finalValue = ['idCurso'].includes(name) ? Number(value) : value;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  // 3. RECUPERAR DATOS AL EDITAR CLASE
  const handleEditClick = (clase) => {
    const cursoAsociado = cursos.find(c => c.idCurso === clase.idCurso);
    const gradoAsociadoId = cursoAsociado?.idGrado?.idGrado || cursoAsociado?.idGrado || '';
    
    const gradoAsociado = grados.find(g => g.idGrado === gradoAsociadoId);
    const sedeAsociadaId = gradoAsociado?.idSede?.idSede || gradoAsociado?.idSede || '';

    const filtradosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === sedeAsociadaId);
    const filtradosCursos = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === gradoAsociadoId);

    setGradosFiltrados(filtradosGrados);
    setCursosFiltrados(filtradosCursos);
    setEditingId(clase.idClase);

    setFormData({
      idSede: sedeAsociadaId,
      idGrado: gradoAsociadoId,
      idCurso: clase.idCurso,
      titulo: clase.titulo,
      descripcion: clase.descripcion || '',
      urlVideoconferencia: clase.urlVideoconferencia || '',
      fechaClase: clase.fechaClase ? clase.fechaClase.substring(0, 16) : '',
      fechaTermino: clase.fechaTermino ? clase.fechaTermino.substring(0, 16) : '' // 🆕 Parseo seguro
    });

    setMensaje({ texto: `Modificando agenda de la clase: ${clase.titulo}`, tipo: 'success' });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setMensaje({ texto: '', tipo: '' });
    const sedeInicialId = sedes[0]?.idSede || '';
    const filtradosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === sedeInicialId);
    const primerGradoId = filtradosGrados[0]?.idGrado || '';
    const filtradosCursos = cursos.filter(c => (c.idGrado?.idGrado || c.idGrado) === primerGradoId);

    setGradosFiltrados(filtradosGrados);
    setCursosFiltrados(filtradosCursos);

    setFormData({
      idSede: sedeInicialId,
      idGrado: primerGradoId,
      idCurso: filtradosCursos[0]?.idCurso || '',
      titulo: '',
      descripcion: '',
      urlVideoconferencia: '',
      fechaClase: '',
      fechaTermino: '' // 🆕 Reseteo del campo
    });
  };

  // 4. ENVÍO SEGURO DE LA PETICIÓN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (!formData.idCurso || !formData.titulo || !formData.fechaClase || !formData.fechaTermino) {
      setMensaje({ texto: 'Por favor, complete los campos obligatorios (Curso, Título, Inicio y Término).', tipo: 'error' });
      setLoading(false);
      return;
    }

    // Validación lógica de horarios
    if (new Date(formData.fechaClase) >= new Date(formData.fechaTermino)) {
      setMensaje({ texto: 'La hora de término debe ser posterior a la hora de inicio.', tipo: 'error' });
      setLoading(false);
      return;
    }

    const finalPayload = {
      idCurso: formData.idCurso,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      urlVideoconferencia: formData.urlVideoconferencia,
      fechaClase: formData.fechaClase,
      fechaTermino: formData.fechaTermino // 🆕 Inyección al payload JSON para Spring
    };

    try {
      if (editingId) {
        await api.put(`/clases/modificar/${editingId}`, finalPayload);
        setMensaje({ texto: '¡Planificación horaria actualizada con éxito!', tipo: 'success' });
      } else {
        await api.post('/clases/registrar', finalPayload);
        setMensaje({ texto: '¡Nueva clase agendada con éxito!', tipo: 'success' });
      }

      cancelarEdicion();
      listarClases();
    } catch (err) {
      let errorTexto = 'Error al registrar el bloque de clase.';
      if (err.response?.data) {
        errorTexto = typeof err.response.data === 'object' ? err.response.data.message || errorTexto : err.response.data;
      }
      setMensaje({ texto: errorTexto, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Muestra el rango "HH:MM - HH:MM" de forma intuitiva
  const formatearRangoHorario = (inicioStr, finStr) => {
    if (!inicioStr) return '-';
    const inicio = new Date(inicioStr);
    const fechaFormateada = inicio.toLocaleDateString('es-ES', { dateStyle: 'short' });
    const horaInicio = inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    if (!finStr) return `📅 ${fechaFormateada} (${horaInicio})`;
    
    const fin = new Date(finStr);
    const horaFin = fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div>
        <span style={{ display: 'block', color: '#b45309', fontWeight: '600' }}>📅 {fechaFormateada}</span>
        <small style={{ color: '#451a03', fontWeight: '500' }}>⏱️ {horaInicio} - {horaFin}</small>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: CRONOGRAMA DE CLASES */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Cronograma de Clases</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>Horario Programado</th>
              <th>Materia / Curso</th>
              <th>Título del Tema</th>
              <th>Aula / Enlace</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clasesList.map((clase) => (
              <tr key={clase.idClase} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 5px' }}>
                  {formatearRangoHorario(clase.fechaClase, clase.fechaTermino)}
                </td>
                <td>
                  <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{clase.nombreCursoVisual}</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{clase.nombreGradoVisual}</small>
                </td>
                <td style={{ color: 'var(--text-main)' }}>{clase.titulo}</td>
                <td>
                  {clase.urlVideoconferencia ? (
                    <a href={clase.urlVideoconferencia} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                      🔗 Enlace
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Presencial</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleEditClick(clase)} style={{ padding: '6px 10px', background: '#f1f5f9', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: '600' }}>
            {editingId ? 'Reajustar Agenda de Clase' : 'Agendar Nueva Sesión Escolar'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Filtre por sede/grado para localizar la asignatura exacta y estipular sus tiempos de ejecución.
          </p>
        </div>

        {mensaje.texto && (
          <div style={{
            backgroundColor: mensaje.tipo === 'success' ? '#d1fae5' : 'var(--danger-bg)',
            color: mensaje.tipo === 'success' ? '#065f46' : 'var(--danger-text)',
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem'
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label style={{ fontWeight: '600' }}>1. Sede Institucional</label>
            <select name="idSede" value={formData.idSede} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label style={{ fontWeight: '600' }}>2. Grado, Sección y Nivel</label>
            <select name="idGrado" value={formData.idGrado} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {gradosFiltrados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado} - Secc. {g.seccion} ({g.nivel})</option>)}
              {gradosFiltrados.length === 0 && <option value="">No hay grados en esta sede</option>}
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>3. Asignatura / Curso Destino</label>
            <select name="idCurso" value={formData.idCurso} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--primary-color)' }}>
              {cursosFiltrados.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso}</option>)}
              {cursosFiltrados.length === 0 && <option value="">No hay materias creadas para este grado</option>}
            </select>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px dashed var(--border-light)' }} />

          {/* 🆕 BLOQUE HORARIO MEJORADO: INICIO Y TÉRMINO EN PARALELO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label style={{ fontWeight: '600' }}>Hora de Inicio</label>
              <input 
                type="datetime-local" 
                name="fechaClase" 
                value={formData.fechaClase} 
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}
              />
            </div>

            <div className="input-group">
              <label style={{ fontWeight: '600', color: '#9a3412' }}>Hora de Término</label>
              <input 
                type="datetime-local" 
                name="fechaTermino" 
                value={formData.fechaTermino} 
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #9a3412' }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label style={{ fontWeight: '500' }}>Tema / Título del Bloque Diario</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Introducción a Ecuaciones" />
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label style={{ fontWeight: '500' }}>Enlace de Videoconferencia (Opcional)</label>
            <input type="url" name="urlVideoconferencia" value={formData.urlVideoconferencia} onChange={handleChange} placeholder="https://meet.google.com/abc" />
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label style={{ fontWeight: '500' }}>Descripción / Indicaciones</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}></textarea>
          </div>

          <button type="submit" className="btn-submit" disabled={loading || cursosFiltrados.length === 0} style={{ marginTop: '20px', width: '100%' }}>
            {loading ? 'Sincronizando...' : editingId ? 'Actualizar Horario' : 'Confirmar y Agendar'}
          </button>

          {editingId && (
            <button type="button" onClick={cancelarEdicion} style={{ width: '100%', padding: '10px', marginTop: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Cancelar Ajuste
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
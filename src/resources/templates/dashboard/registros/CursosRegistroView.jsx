import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function CursosRegistroView() {
  const [cursosList, setCursosList] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [grados, setGrados] = useState([]); 
  const [gradosFiltrados, setGradosFiltrados] = useState([]); 
  const [personalDocente, setPersonalDocente] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- Estados Nuevos para el Ojo (Ver Clases de un Curso) ---
  const [cursoSeleccionadoVer, setCursoSeleccionadoVer] = useState(null);
  const [clasesDelCurso, setClasesDelCurso] = useState([]);
  const [loadingClases, setLoadingClases] = useState(false);

  const [formData, setFormData] = useState({
    nombreCurso: '',
    idSede: '', 
    idGrado: '',
    idPersonal: '' 
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGA INICIAL DE DATOS
  const listarCursos = async () => {
    try {
      const response = await api.get('/cursos'); 
      setCursosList(response.data);
    } catch (err) {
      console.error("Error al obtener la lista de cursos", err);
    }
  };

  const cargarDatosMaestros = async () => {
    try {
      const [resSedes, resGrados, resPersonal] = await Promise.all([
        api.get('/sedes'),
        api.get('/grados'),
        api.get('/personal')
      ]);
      
      setSedes(resSedes.data);
      setGrados(resGrados.data);
      
      const docentes = resPersonal.data.filter(p => p.estado !== 'RETIRADO');
      setPersonalDocente(docentes);

      const sedeInicialId = resSedes.data[0]?.idSede || '';
      const gradosDeSede = resGrados.data.filter(g => (g.idSede?.idSede || g.idSede) === sedeInicialId);
      
      setGradosFiltrados(gradosDeSede);

      setFormData({
        nombreCurso: '',
        idSede: sedeInicialId,
        idGrado: gradosDeSede[0]?.idGrado || '',
        idPersonal: docentes[0]?.idPersonal || ''
      });

    } catch (err) {
      console.error("Error al cargar datos maestros para el formulario", err);
    }
  };

  useEffect(() => {
    listarCursos();
    cargarDatosMaestros();
  }, []);

  // 2. DETECTAR CAMBIOS EN EL FORMULARIO
  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = ['idGrado', 'idPersonal', 'idSede'].includes(name) ? Number(value) : value;
    
    if (name === 'idSede') {
      const nuevosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === finalValue);
      setGradosFiltrados(nuevosGrados);
      
      setFormData(prev => ({
        ...prev,
        idSede: finalValue,
        idGrado: nuevosGrados[0]?.idGrado || '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  // 3. ACCIÓN DEL OJO: VER CLASES ASOCIADAS (Llama a tu endpoint de Spring)
  const handleVerClasesClick = async (curso) => {
    setCursoSeleccionadoVer(curso);
    setLoadingClases(true);
    try {
      // Consume tu @GetMapping("/curso/{idCurso}")
      const response = await api.get(`/clases/curso/${curso.idCurso}`);
      setClasesDelCurso(response.data);
    } catch (err) {
      console.error("Error al traer las clases de este curso", err);
      setClasesDelCurso([]);
    } finally {
      setLoadingClases(false);
    }
  };

  // 4. CONTROL DE EDICIÓN
  const handleEditClick = (curso) => {
    const gradoAsociado = grados.find(g => g.idGrado === curso.idGrado);
    const idSedeCurso = gradoAsociado?.idSede?.idSede || gradoAsociado?.idSede || '';

    const nuevosGrados = grados.filter(g => (g.idSede?.idSede || g.idSede) === idSedeCurso);
    
    setGradosFiltrados(nuevosGrados);
    setEditingId(curso.idCurso);
    
    setFormData({
      nombreCurso: curso.nombreCurso,
      idSede: idSedeCurso,
      idGrado: curso.idGrado,
      idPersonal: curso.idPersonal
    });
    setMensaje({ texto: `Editando asignatura: ${curso.nombreCurso}`, tipo: 'success' });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    const sedeInicialId = sedes[0]?.idSede || '';
    const gradosDeSede = grados.filter(g => (g.idSede?.idSede || g.idSede) === sedeInicialId);
    
    setGradosFiltrados(gradosDeSede);
    setFormData({
      nombreCurso: '',
      idSede: sedeInicialId,
      idGrado: gradosDeSede[0]?.idGrado || '',
      idPersonal: personalDocente[0]?.idPersonal || ''
    });
    setMensaje({ texto: '', tipo: '' });
  };

  // 5. ENVIAR FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (!formData.nombreCurso || !formData.idGrado || !formData.idPersonal) {
      setMensaje({ texto: 'Por favor, rellena todos los campos requeridos.', tipo: 'error' });
      setLoading(false);
      return;
    }

    const datosEnvio = {
      nombreCurso: formData.nombreCurso,
      idGrado: formData.idGrado,
      idPersonal: formData.idPersonal
    };

    try {
      if (editingId) {
        await api.put(`/cursos/modificar/${editingId}`, datosEnvio);
        setMensaje({ texto: '¡Asignatura actualizada con éxito!', tipo: 'success' });
      } else {
        await api.post('/cursos/registrar', datosEnvio);
        setMensaje({ texto: '¡Curso registrado con éxito!', tipo: 'success' });
      }

      cancelarEdicion();
      listarCursos();
    } catch (err) {
      let errorTexto = 'Error al procesar la solicitud.';
      if (err.response?.data) {
        errorTexto = typeof err.response.data === 'object' ? err.response.data.message || errorTexto : err.response.data;
      }
      setMensaje({ texto: errorTexto, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (stringFecha) => {
    if (!stringFecha) return '-';
    return new Date(stringFecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA Y SUB-TABLA DE CLASES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Malla de Asignaturas y Docencia</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 5px' }}>Curso / Unidad</th>
                <th>Grado Asignado</th>
                <th>Profesor a Cargo</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursosList.map((c) => (
                <tr key={c.idCurso} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: cursoSeleccionadoVer?.idCurso === c.idCurso ? '#f8fafc' : 'transparent' }}>
                  <td style={{ padding: '12px 5px', fontWeight: '600', color: 'var(--primary-color)' }}>{c.nombreCurso}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                      {c.nombreGradoVisual || `Grado: ${c.idGrado}`}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-main)' }}>{c.nombreProfesorCompleto || `ID: ${c.idPersonal}`}</td>
                  <td style={{ textAlign: 'center', padding: '12px 5px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {/* El botón del Ojo */}
                      <button 
                        onClick={() => handleVerClasesClick(c)}
                        title="Ver clases agendadas"
                        style={{ padding: '6px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => handleEditClick(c)}
                        title="Editar curso"
                        style={{ padding: '6px 8px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTENEDOR REACTIVO: APARECE ABAJO SOLO CUANDO SE PRESIONA EL OJO */}
        {cursoSeleccionadoVer && (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600' }}>
                📅 Horarios de Clase: <span style={{ color: 'var(--primary-color)' }}>{cursoSeleccionadoVer.nombreCurso}</span>
              </h4>
              <button 
                onClick={() => setCursoSeleccionadoVer(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
              >
                ❌ Cerrar
              </button>
            </div>

            {loadingClases ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando calendario del curso...</p>
            ) : clasesDelCurso.length === 0 ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#b45309', margin: 0 }}>
                ⚠️ No hay ninguna sesión o fecha agendada para este curso todavía.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f1f5f9', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Fecha y Hora</th>
                    <th>Tema de la Clase</th>
                    <th>Videoconferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {clasesDelCurso.map(clase => (
                    <tr key={clase.idClase} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: '600', color: '#b45309' }}>{formatearFecha(clase.fechaClase)}</td>
                      <td style={{ color: 'var(--text-main)' }}>{clase.titulo}</td>
                      <td>
                        {clase.urlVideoconferencia ? (
                          <a href={clase.urlVideoconferencia} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                            🔗 Entrar a clase
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Presencial</span>
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

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '20px' }}>
          {editingId ? 'Actualizar Asignatura' : 'Aperturar Nuevo Curso'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Sede Escolar</label>
            <select name="idSede" value={formData.idSede} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {sedes.map((s) => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '14px' }}>
            <label>Nombre de la Materia / Curso</label>
            <input type="text" name="nombreCurso" value={formData.nombreCurso} onChange={handleChange} placeholder="Ej. Matemática" />
          </div>

          <div className="input-group" style={{ marginTop: '14px' }}>
            <label>Grado Académico (Filtrado por Sede)</label>
            <select name="idGrado" value={formData.idGrado} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado} - {g.seccion}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '14px' }}>
            <label>Docente Responsable</label>
            <select name="idPersonal" value={formData.idPersonal} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
              {personalDocente.map((p) => (
                <option key={p.idPersonal} value={p.idPersonal}>{p.apellidos}, {p.nombres}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px', width: '100%' }}>
            {loading ? 'Sincronizando...' : editingId ? 'Guardar Cambios' : 'Aperturar Asignatura'}
          </button>
          
          {editingId && (
            <button type="button" onClick={cancelarEdicion} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }}>
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
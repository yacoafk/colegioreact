import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function PersonalConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [todoElPersonal, setTodoElPersonal] = useState([]);
  const [personalFiltrado, setPersonalFiltrado] = useState([]);

  // Estados de control de los filtros cruzados
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  const [loading, setLoading] = useState(false);

  // 🆕 Estados Nuevos para ver los Cursos del Profesor Seleccionado
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [cursosDelProfesor, setCursosDelProfesor] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);

  // 1. CARGA EN PARALELO DE LOS DATOS MAESTROS
  useEffect(() => {
    const cargarDatosConsulta = async () => {
      setLoading(true);
      try {
        const [resSedes, resRoles, resPersonal] = await Promise.all([
          api.get('/sedes'),
          api.get('/roles'),
          api.get('/personal') 
        ]);

        setSedes(resSedes.data);
        setRoles(resRoles.data);
        setTodoElPersonal(resPersonal.data);

        if (resSedes.data.length > 0) setSelectedSede(resSedes.data[0].idSede);
        if (resRoles.data.length > 0) setSelectedRol(resRoles.data[0].idRol);

      } catch (err) {
        console.error("Error al recopilar datos para el visor de personal:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosConsulta();
  }, []);

  // 2. LÓGICA DE FILTRADO MULTI-CRITERIO (Sede && Rol)
  useEffect(() => {
    if (selectedSede && selectedRol) {
      const filtrados = todoElPersonal.filter((p) => {
        const sedeId = p.idSede?.idSede !== undefined ? p.idSede.idSede : p.idSede;
        const rolId = p.idRol?.idRol !== undefined ? p.idRol.idRol : p.idRol;
        return Number(sedeId) === Number(selectedSede) && Number(rolId) === Number(selectedRol);
      });
      setPersonalFiltrado(filtrados);
    } else {
      setPersonalFiltrado([]);
    }
    setProfesorSeleccionado(null); // Limpiar visor al cambiar filtros
  }, [selectedSede, selectedRol, todoElPersonal]);

  // 🆕 3. ACCIÓN: Cargar cursos a cargo del profesor
  const handleVerCursosClick = async (personal) => {
    setProfesorSeleccionado(personal);
    setLoadingCursos(true);
    try {
      const response = await api.get(`/cursos/profesor/${personal.idPersonal}`);
      setCursosDelProfesor(response.data);
    } catch (err) {
      console.error("Error al traer los cursos del docente:", err);
      setCursosDelProfesor([]);
    } finally {
      setLoadingCursos(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* CARD DE CONTROL: FILTROS */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.3rem' }}>
          🔍 Consulta Estructurada de Personal
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Filtrar por Campus / Sede</label>
            <select 
              value={selectedSede} 
              onChange={(e) => setSelectedSede(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Especialidad / Rol Institucional</label>
            <select 
              value={selectedRol} 
              onChange={(e) => setSelectedRol(Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {roles.map((r) => (
                <option key={r.idRol} value={r.idRol}>{r.nombreRol || r.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARD DE RESULTADOS: TABLA CORPORATIVA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ color: 'var(--text-main)', fontWeight: '600', margin: 0 }}>
            Colaboradores Asignados
            <span style={{ marginLeft: '10px', fontSize: '0.85rem', background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '20px' }}>
              {personalFiltrado.length} Registros encontrados
            </span>
          </h4>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Sincronizando la nómina del personal...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', height: '40px' }}>
                <th style={{ padding: '10px' }}>ID Sistema</th>
                <th>Documento Identidad</th>
                <th>Apellidos y Nombres</th>
                <th>Sede Actual</th>
                <th>Rol / Puesto</th>
                <th style={{ textAlign: 'center' }}>Estado Laboral</th>
                <th style={{ textAlign: 'center' }}>Cursos Asignados</th>
              </tr>
            </thead>
            <tbody>
              {personalFiltrado.map((p) => {
                const nombreDelRol = p.idRol?.nombreRol || p.idRol?.nombre || roles.find(r => r.idRol === p.idRol)?.nombre || '';
                // Condición: Es profesor si el texto contiene 'PROFESOR' o 'DOCENTE'
                const esProfesor = nombreDelRol.toUpperCase().includes('PROFESOR') || nombreDelRol.toUpperCase().includes('DOCENTE');

                return (
                  <tr key={p.idPersonal} style={{ borderBottom: '1px solid var(--border-light)', height: '45px', backgroundColor: profesorSeleccionado?.idPersonal === p.idPersonal ? '#f8fafc' : 'transparent', opacity: p.estado === 'RETIRADO' ? 0.5 : 1 }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--primary-color)' }}>#{p.idPersonal}</td>
                    <td>{p.nroDocumento}</td>
                    <td><strong style={{ fontWeight: '500' }}>{p.apellidos}</strong>, {p.nombres}</td>
                    <td>{p.idSede?.nombre || sedes.find(s => s.idSede === p.idSede)?.nombre || 'Asignada'}</td>
                    <td>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                        {nombreDelRol || 'Especialista'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: p.estado === 'ACTIVO' || !p.estado ? '#d1fae5' : 'var(--danger-bg)',
                        color: p.estado === 'ACTIVO' || !p.estado ? '#065f46' : 'var(--danger-text)'
                      }}>
                        {p.estado || 'ACTIVO'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {esProfesor ? (
                        <button 
                          onClick={() => handleVerCursosClick(p)}
                          style={{ padding: '5px 10px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                          👁️ Ver Cursos
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No Aplica</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {personalFiltrado.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '35px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Ningún miembro del personal coincide actualmente con la Sede y el Rol seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 🆕 SUB-CARD REACTIVO: SE DESPLIEGA ABAJO AL DAR CLICK AL OJO */}
      {profesorSeleccionado && (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600', fontSize: '1.1rem' }}>
              📚 Cursos dictados por: <span style={{ color: 'var(--primary-color)' }}>{profesorSeleccionado.apellidos}, {profesorSeleccionado.nombres}</span>
            </h4>
            <button 
              onClick={() => setProfesorSeleccionado(null)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}
            >
              ❌ Cerrar Visor
            </button>
          </div>

          {loadingCursos ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando asignaturas...</p>
          ) : cursosDelProfesor.length === 0 ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#b45309', margin: 0 }}>
              ⚠️ Este docente no tiene asignaturas o salones vinculados en la malla actual.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f1f5f9', color: 'var(--text-muted)', height: '35px' }}>
                  <th style={{ padding: '10px' }}>Código Curso</th>
                  <th>Nombre de la Asignatura</th>
                  <th>Grado / Sección</th>
                </tr>
              </thead>
              <tbody>
                {cursosDelProfesor.map(curso => (
                  <tr key={curso.idCurso} style={{ borderBottom: '1px solid #f1f5f9', height: '40px' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--primary-color)' }}>CRS-{curso.idCurso}</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: '500' }}>{curso.nombreCurso}</td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {curso.idGrado?.nombreGrado || 'Grado Asignado'} - "{curso.idGrado?.seccion || '-'}"
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
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
    <div className="page-container">

      {/* FILTROS */}
      <div className="card">
        <h3 className="card-title">
          🔍 Consulta Estructurada de Personal
        </h3>

        <div className="form-grid">
          
          <div className="input-group">
            <label className="input-label">Filtrar por Campus / Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(Number(e.target.value))}
              className="select"
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Especialidad / Rol Institucional</label>
            <select
              value={selectedRol}
              onChange={(e) => setSelectedRol(Number(e.target.value))}
              className="select"
            >
              {roles.map((r) => (
                <option key={r.idRol} value={r.idRol}>
                  {r.nombreRol || r.nombre}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <div className="flex-between">
          <h4 className="section-title">
            Colaboradores Asignados
            <span className="badge">
              {personalFiltrado.length} Registros
            </span>
          </h4>
        </div>

        {loading ? (
          <p className="text-center text-muted">
            Sincronizando la nómina del personal...
          </p>
        ) : personalFiltrado.length === 0 ? (
          <div className="empty-state">
            Ningún miembro coincide con los filtros seleccionados
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Documento</th>
                <th>Apellidos y Nombres</th>
                <th>Sede</th>
                <th>Rol</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Cursos</th>
              </tr>
            </thead>

            <tbody>
              {personalFiltrado.map((p) => {
                const nombreDelRol =
                  p.idRol?.nombreRol ||
                  p.idRol?.nombre ||
                  roles.find(r => r.idRol === p.idRol)?.nombre ||
                  '';

                const esProfesor =
                  nombreDelRol.toUpperCase().includes('PROFESOR') ||
                  nombreDelRol.toUpperCase().includes('DOCENTE');

                return (
                  <tr
                    key={p.idPersonal}
                    className={p.estado === 'RETIRADO' ? 'inactive' : ''}
                    style={{
                      background:
                        profesorSeleccionado?.idPersonal === p.idPersonal
                          ? '#f8fafc'
                          : 'transparent'
                    }}
                  >
                    <td className="text-primary">#{p.idPersonal}</td>
                    <td>{p.nroDocumento}</td>
                    <td>
                      <strong>{p.apellidos}</strong>, {p.nombres}
                    </td>
                    <td>
                      {p.idSede?.nombre ||
                        sedes.find(s => s.idSede === p.idSede)?.nombre ||
                        'Asignada'}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>
                        {nombreDelRol || 'Especialista'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`status ${p.estado === 'RETIRADO' ? 'inactive' : 'active'}`}>
                        {p.estado || 'ACTIVO'}
                      </span>
                    </td>
                    <td className="text-center">
                      {esProfesor ? (
                        <button
                          onClick={() => handleVerCursosClick(p)}
                          className="btn-secondary"
                        >
                          👁️ Ver Cursos
                        </button>
                      ) : (
                        <span className="text-muted">No aplica</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CURSOS DEL PROFESOR */}
      {profesorSeleccionado && (
        <div className="card">
          <div className="flex-between">
            <h4 className="section-title">
              📚 Cursos dictados por:
              <span className="text-primary">
                {' '}
                {profesorSeleccionado.apellidos}, {profesorSeleccionado.nombres}
              </span>
            </h4>

            <button
              onClick={() => setProfesorSeleccionado(null)}
              className="text-muted"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ❌
            </button>
          </div>

          {loadingCursos ? (
            <p className="text-muted">Cargando asignaturas...</p>
          ) : cursosDelProfesor.length === 0 ? (
            <div className="empty-state">
              Este docente no tiene cursos asignados
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Grado / Sección</th>
                </tr>
              </thead>
              <tbody>
                {cursosDelProfesor.map((curso) => (
                  <tr key={curso.idCurso}>
                    <td className="text-primary">CRS-{curso.idCurso}</td>
                    <td>{curso.nombreCurso}</td>
                    <td>
                      <span className="badge" style={{ background: '#eff6ff', color: '#1e40af' }}>
                        {curso.idGrado?.nombreGrado || 'Grado'} - "
                        {curso.idGrado?.seccion || '-'}"
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
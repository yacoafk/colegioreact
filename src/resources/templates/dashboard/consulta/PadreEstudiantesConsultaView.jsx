import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; // Asegura que los estilos globales estén aquí

export function PadreEstudiantesConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  
  const [padres, setPadres] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [loadingPadres, setLoadingPadres] = useState(false);
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        const [resSedes, resGrados, resEstudiantes] = await Promise.all([
          api.get('sedes'), api.get('grados'), api.get('estudiantes/todos')
        ]);
        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setTodosLosEstudiantes(resEstudiantes.data);
        if (resSedes.data.length > 0) setSelectedSede(resSedes.data[0].idSede);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const filtrados = grados.filter(g => g.idSede === Number(selectedSede));
    setGradosFiltrados(filtrados);
    setSelectedGrado(filtrados.length > 0 ? filtrados[0].idGrado : '');
  }, [selectedSede, grados]);

  useEffect(() => {
    const resultado = todosLosEstudiantes.filter(e => e.idSede === Number(selectedSede) && e.idGrado === Number(selectedGrado));
    setEstudiantesFiltrados(resultado);
  }, [selectedSede, selectedGrado, todosLosEstudiantes]);

  const verPadres = async (estudiante) => {
    setSelectedEstudiante(estudiante);
    setLoadingPadres(true);
    try {
      const res = await api.get(`/padres/estudiante/${estudiante.idEstudiante}`);
      setPadres(res.data);
    } catch (err) { setPadres([]); } finally { setLoadingPadres(false); }
  };

  return (
    <div className="page-container">

      {/* FILTROS */}
      <div className="card">
        <h3 className="card-title">
          🔍 Consulta de Estudiantes por Secciones
        </h3>

        <div className="form-grid">
          
          {/* Sede */}
          <div className="input-group">
            <label className="input-label">Seleccionar Sede</label>
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

          {/* Grado */}
          <div className="input-group">
            <label className="input-label">Seleccionar Grado Académico</label>
            <select
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(Number(e.target.value))}
              disabled={gradosFiltrados.length === 0}
              className="select"
            >
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>
                  {g.nombreGrado}
                </option>
              ))}
              {gradosFiltrados.length === 0 && (
                <option value="">
                  ⚠️ No hay grados configurados en esta sede
                </option>
              )}
            </select>
          </div>

        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        {estudiantesFiltrados.length === 0 ? (
          <div className="empty-state">
            No hay estudiantes para la selección actual
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre del Estudiante</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map((e) => (
                <tr key={e.idEstudiante}>
                  <td>{e.nombres} {e.apellidos}</td>
                  <td className="text-center">
                    <button
                      onClick={() => verPadres(e)}
                      className="btn-primary"
                    >
                      Ver Apoderados
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PANEL DE APODERADOS */}
      {selectedEstudiante && (
        <div className="card">
          <h4 className="section-title" style={{ marginBottom: '16px' }}>
            Apoderados de: {selectedEstudiante.nombres} {selectedEstudiante.apellidos}
          </h4>

          {loadingPadres ? (
            <p className="text-muted">Cargando información...</p>
          ) : padres.length > 0 ? (
            <div className="task-list">
              {padres.map((p, idx) => (
                <div key={idx} className="task-card">
                  
                  <div className="flex-between">
                    <div>
                      <strong>
                        {p.nombres} {p.apellidos}
                      </strong>
                      <div className="text-muted">
                        DNI: {p.nroDocumento || 'No registrado'}
                      </div>
                    </div>

                    <span className="status active">
                      {p.parentesco}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No se encontraron apoderados vinculados
            </div>
          )}
        </div>
      )}

    </div>
  );
}
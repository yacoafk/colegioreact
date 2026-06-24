import { useState, useEffect } from 'react';
import api from '../../../../api';
import '../../../static/global.css';

export function PadreConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar sedes y grados iniciales
  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [resSedes, resGrados] = await Promise.all([api.get('sedes'), api.get('grados')]);
        setSedes(resSedes.data);
        setGrados(resGrados.data);
        if (resSedes.data.length > 0) setSelectedSede(resSedes.data[0].idSede);
      } catch (err) { console.error(err); }
    };
    cargarFiltros();
  }, []);

  // Filtrar grados cuando cambia la sede
  useEffect(() => {
    const filtrados = grados.filter(g => g.idSede === Number(selectedSede));
    setGradosFiltrados(filtrados);
    setSelectedGrado(filtrados.length > 0 ? filtrados[0].idGrado : '');
  }, [selectedSede, grados]);

  // Cargar padres cuando cambian los filtros
  useEffect(() => {
    const buscarPadres = async () => {
      if (!selectedSede || !selectedGrado) return;
      
      setLoading(true);
      try {
        const res = await api.get(`/padres/filtrar`, {
          params: { idSede: selectedSede, idGrado: selectedGrado }
        });
        setPadres(res.data);
      } catch (err) {
        console.error(err);
        setPadres([]);
      } finally {
        setLoading(false);
      }
    };
    buscarPadres();
  }, [selectedSede, selectedGrado]);

  return (
    <div className="card">
      <h3 className="card-title">
        👥 Consulta de Apoderados por Sección
      </h3>

      {/* Filtros */}
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label">Sede</label>
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(Number(e.target.value))}
            className="select"
          >
            {sedes.map(s => (
              <option key={s.idSede} value={s.idSede}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Grado Académico</label>
          <select
            value={selectedGrado}
            onChange={(e) => setSelectedGrado(Number(e.target.value))}
            className="select"
          >
            {gradosFiltrados.map(g => (
              <option key={g.idGrado} value={g.idGrado}>
                {g.nombreGrado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-muted">Cargando información...</p>
      ) : padres.length === 0 ? (
        <div className="empty-state">
          No hay apoderados registrados para esta selección
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre del Apoderado</th>
              <th>DNI</th>
              <th>Estudiante Vinculado</th>
            </tr>
          </thead>
          <tbody>
            {padres.map((p) => (
              <tr key={p.idPadre}>
                <td>
                  {p.nombres} {p.apellidos}
                </td>
                <td>
                  {p.nroDocumento || 'N/A'}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    {p.nombreEstudiante} {p.apellidosEstudiante}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    DNI: {p.dniEstudiante}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
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
  <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
    <h3 style={{ marginBottom: '24px', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.3rem' }}>
      👥 Consulta de Apoderados por Sección
    </h3>
    
    {/* Filtros */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
      <div className="input-group">
        <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Sede</label>
        <select 
          value={selectedSede} 
          onChange={(e) => setSelectedSede(Number(e.target.value))}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
        >
          {sedes.map(s => <option key={s.idSede} value={s.idSede}>{s.nombre}</option>)}
        </select>
      </div>
      
      <div className="input-group">
        <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Grado Académico</label>
        <select 
          value={selectedGrado} 
          onChange={(e) => setSelectedGrado(Number(e.target.value))}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
        >
          {gradosFiltrados.map(g => <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado}</option>)}
        </select>
      </div>
    </div>

    {/* Tabla de Padres */}
    {loading ? (
      <p style={{ color: 'var(--text-muted)' }}>Cargando información...</p>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Nombre del Apoderado</th>
            <th style={{ padding: '12px' }}>DNI</th>
            <th style={{ padding: '12px' }}>Estudiante Vinculado</th>
          </tr>
        </thead>
        <tbody>
          {padres.map((p) => (
            <tr key={p.idPadre} style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '12px' }}>{p.nombres} {p.apellidos}</td>
              <td style={{ padding: '12px' }}>{p.nroDocumento || 'N/A'}</td>
              <td style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {p.nombreEstudiante} {p.apellidosEstudiante}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
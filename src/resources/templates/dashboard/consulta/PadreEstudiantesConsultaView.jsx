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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* TARJETA DE FILTROS */}
      {/* SECCIÓN SUPERIOR: FILTROS DE BÚSQUEDA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600', fontSize: '1.3rem' }}>
          🔍 Consulta de Estudiantes por Secciones
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Selector de Sede */}
          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Seleccionar Sede</label>
            <select 
              value={selectedSede} 
              onChange={(e) => setSelectedSede(e.target.target ? e.target.value : Number(e.target.value))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector de Grado */}
          <div className="input-group">
            <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Seleccionar Grado Académico</label>
            <select 
              value={selectedGrado} 
              onChange={(e) => setSelectedGrado(Number(e.target.value))}
              disabled={gradosFiltrados.length === 0}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', fontSize: '0.95rem' }}
            >
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado}</option>
              ))}
              {gradosFiltrados.length === 0 && (
                <option value="">⚠️ No hay grados configurados en esta sede</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nombre del Estudiante</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesFiltrados.map((e) => (
              <tr key={e.idEstudiante} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px' }}>{e.nombres} {e.apellidos}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => verPadres(e)} style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                    Ver Apoderados
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PANEL DE APODERADOS */}
      {selectedEstudiante && (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
            Apoderados de: {selectedEstudiante.nombres} {selectedEstudiante.apellidos}
          </h4>
          
          {loadingPadres ? (
            <p style={{ color: 'var(--text-muted)' }}>Cargando información...</p>
          ) : (
            padres.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {padres.map((p, idx) => (
                  <div key={idx} style={{ 
                    padding: '12px', 
                    background: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                        {p.nombres} {p.apellidos}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        DNI: {p.nroDocumento || 'No registrado'}
                      </span>
                    </div>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      background: '#dcfce7', 
                      color: '#166534' 
                    }}>
                      {p.parentesco}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No se encontraron apoderados vinculados.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
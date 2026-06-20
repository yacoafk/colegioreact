import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function EstudiantesConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);

  // Criterios de búsqueda seleccionados por el usuario
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        const [resSedes, resGrados, resEstudiantes] = await Promise.all([
          api.get('sedes'),
          api.get('grados'),
          api.get('estudiantes/todos') // Trae la lista base para filtrar en memoria
        ]);

        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setTodosLosEstudiantes(resEstudiantes.data);

        // Preseleccionar la primera sede si existe
        if (resSedes.data.length > 0) {
          setSelectedSede(resSedes.data[0].idSede);
        }
      } catch (err) {
        console.error("Error al cargar los datos de consulta", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // 2. FILTRADO EN CASCADA: Actualizar Grados cuando cambia la Sede
  useEffect(() => {
    if (selectedSede) {
      const filtrados = grados.filter(g => g.idSede === Number(selectedSede));
      setGradosFiltrados(filtrados);

      // Si hay grados para esta sede, selecciona el primero automáticamente; si no, limpia
      if (filtrados.length > 0) {
        setSelectedGrado(filtrados[0].idGrado);
      } else {
        setSelectedGrado('');
        setEstudiantesFiltrados([]); // No hay grados, por ende no hay estudiantes
      }
    }
  }, [selectedSede, grados]);

  // 3. FILTRADO FINAL: Filtrar alumnos cuando cambia el Grado o la lista maestra
  useEffect(() => {
    if (selectedSede && selectedGrado) {
      const resultado = todosLosEstudiantes.filter(
        e => e.idSede === Number(selectedSede) && e.idGrado === Number(selectedGrado)
      );
      setEstudiantesFiltrados(resultado);
    } else {
      setEstudiantesFiltrados([]);
    }
  }, [selectedSede, selectedGrado, todosLosEstudiantes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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

      {/* SECCIÓN INFERIOR: RESULTADOS EN TABLA */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ color: 'var(--text-main)', fontWeight: '600', margin: 0 }}>
            Alumnos Asignados 
            <span style={{ marginLeft: '10px', fontSize: '0.85rem', background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '20px' }}>
              {estudiantesFiltrados.length} Total
            </span>
          </h4>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Cargando información escolar...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', height: '40px' }}>
                <th style={{ padding: '10px' }}>Código</th>
                <th>Nro Documento</th>
                <th>Nombres y Apellidos</th>
                <th>Sexo</th>
                <th>Pensión (S/.)</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map((e) => (
                <tr key={e.idEstudiante} style={{ borderBottom: '1px solid var(--border-light)', height: '45px', opacity: e.estado === 'RETIRADO' ? 0.6 : 1 }}>
                  <td style={{ padding: '10px', fontWeight: '600', color: 'var(--primary-color)' }}>{e.codigoEstudiante}</td>
                  <td>{e.nroDocumento}</td>
                  <td>{e.nombres} {e.apellidos}</td>
                  <td>{e.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
                  <td>S/. {e.montoPension?.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                      backgroundColor: e.estado === 'ACTIVO' ? '#d1fae5' : 'var(--danger-bg)',
                      color: e.estado === 'ACTIVO' ? '#065f46' : 'var(--danger-text)'
                    }}>
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))}

              {estudiantesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No se encontraron estudiantes matriculados en esta combinación de Sede y Grado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
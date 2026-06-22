import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import '../../../static/global.css';

export function PadreRegistroView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [filtros, setFiltros] = useState({
    idSede: '',
    idGrado: '',
    idEstudiante: ''
  });

  const [padreData, setPadreData] = useState({
    idTipoDoc: 1,
    nroDocumento: '',
    nombres: '',
    apellidos: '',
    parentesco: 'PADRE'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSedes, resGrados, resEst] = await Promise.all([
          api.get('sedes'),
          api.get('grados'),
          api.get('estudiantes/todos')
        ]);
        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setEstudiantes(resEst.data);
      } catch (err) {
        console.error("Error cargando datos", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtrados = grados.filter(g => g.idSede === Number(filtros.idSede));
    setGradosFiltrados(filtrados);
    setFiltros(prev => ({ ...prev, idGrado: '', idEstudiante: '' }));
  }, [filtros.idSede, grados]);

  const handleSubmitPadre = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('padres/registrar', {
        ...padreData,
        idEstudiante: Number(filtros.idEstudiante)
      });

      setMensaje({
        texto: "✔ Apoderado registrado correctamente",
        tipo: 'success'
      });

      setPadreData({
        idTipoDoc: 1,
        nroDocumento: '',
        nombres: '',
        apellidos: '',
        parentesco: 'PADRE'
      });

    } catch (err) {
      setMensaje({
        texto: "⚠ Error: " + (err.response?.data?.message || "Ocurrió un error"),
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* CARD PRINCIPAL */}
      <div style={{
        background: 'var(--card-bg)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)'
      }}>
        <h3 style={{
          marginBottom: '16px',
          color: 'var(--text-main)',
          fontWeight: '600'
        }}>
          👨‍👩‍👧 Registro de Apoderados
        </h3>

        {/* FILTROS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px'
        }}>

          <div>
            <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block' }}>
              1. Sede
            </label>
            <select
              value={filtros.idSede}
              onChange={(e) => setFiltros({ ...filtros, idSede: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
            >
              <option value="">Seleccione...</option>
              {sedes.map(s => (
                <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block' }}>
              2. Grado
            </label>
            <select
              value={filtros.idGrado}
              onChange={(e) => setFiltros({ ...filtros, idGrado: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
            >
              <option value="">Seleccione...</option>
              {gradosFiltrados.map(g => (
                <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block' }}>
              3. Estudiante
            </label>
            <select
              value={filtros.idEstudiante}
              onChange={(e) => setFiltros({ ...filtros, idEstudiante: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
            >
              <option value="">Seleccione...</option>
              {estudiantes
                .filter(e =>
                  e.idSede === Number(filtros.idSede) &&
                  e.idGrado === Number(filtros.idGrado)
                )
                .map(e => (
                  <option key={e.idEstudiante} value={e.idEstudiante}>
                    {e.nombres} {e.apellidos}
                  </option>
                ))}
            </select>
          </div>

        </div>
      </div>

      {/* FORMULARIO */}
      {filtros.idEstudiante && (
        <div style={{
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>

          <h4 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
            ✍ Datos del Apoderado
          </h4>

          {mensaje.texto && (
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              background: mensaje.tipo === 'error' ? '#fff7ed' : '#f0fdf4',
              color: mensaje.tipo === 'error' ? '#c2410c' : '#166534',
              border: `1px solid ${mensaje.tipo === 'error' ? '#fed7aa' : '#bbf7d0'}`,
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmitPadre}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  DNI
                </label>
                <input
                  required
                  maxLength={8}
                  value={padreData.nroDocumento}
                  onChange={e =>
                    setPadreData({
                      ...padreData,
                      nroDocumento: e.target.value.replace(/\D/g, '')
                    })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Parentesco
                </label>
                <select
                  value={padreData.parentesco}
                  onChange={e =>
                    setPadreData({ ...padreData, parentesco: e.target.value })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                >
                  <option value="PADRE">Padre</option>
                  <option value="MADRE">Madre</option>
                  <option value="TUTOR">Tutor</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Nombres
                </label>
                <input
                  required
                  value={padreData.nombres}
                  onChange={e =>
                    setPadreData({ ...padreData, nombres: e.target.value })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Apellidos
                </label>
                <input
                  required
                  value={padreData.apellidos}
                  onChange={e =>
                    setPadreData({ ...padreData, apellidos: e.target.value })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                />
              </div>

            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 28px',
                  background: '#0369a1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Registrando...' : '💾 Guardar Apoderado'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
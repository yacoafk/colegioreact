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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idPadreSeleccionado, setIdPadreSeleccionado] = useState(null);
  const [tiposDoc, setTiposDoc] = useState([]);

  const [filtros, setFiltros] = useState({
    idSede: '',
    idGrado: '',
    idEstudiante: ''
  });

  const cargarTiposDocumento = async () => {
    try {
      const res = await api.get('tipos-documento');
      setTiposDoc(res.data);

      if (res.data.length > 0) {
        setPadreData(prev => ({
          ...prev,
          idTipoDoc: res.data[0].idTipoDoc
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [padreData, setPadreData] = useState({
    idTipoDoc: 1,
    nroDocumento: '',
    nombres: '',
    apellidos: '',
    parentesco: 'PADRE',
    celular: '',
    correo: '',
    direccion: '',
    observaciones: ''
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

        await cargarTiposDocumento(); // 👈 aquí

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtrados = grados.filter(g => g.idSede === Number(filtros.idSede));
    setGradosFiltrados(filtrados);
    setFiltros(prev => ({ ...prev, idGrado: '', idEstudiante: '' }));
  }, [filtros.idSede, grados]);

  useEffect(() => {
    const cargarPadre = async () => {
      if (!filtros.idEstudiante) return;

      try {
        const res = await api.get(`/padres/estudiante/${filtros.idEstudiante}`);

        if (res.data.length > 0) {
          const p = res.data[0]; // 👈 tomas el primero

          setModoEdicion(true);
          setIdPadreSeleccionado(p.idPadre);

          setPadreData({
            idTipoDoc: p.idTipoDoc || 1,
            nroDocumento: p.nroDocumento,
            nombres: p.nombres,
            apellidos: p.apellidos,
            parentesco: p.parentesco,
            celular: p.celular || '',
            correo: p.correo || '',
            direccion: p.direccion || '',
            observaciones: p.observaciones || ''
          });

        } else {
          setModoEdicion(false);
          setIdPadreSeleccionado(null);
        }

      } catch (err) {
        console.error(err);
      }
    };

    cargarPadre();
  }, [filtros.idEstudiante]);

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
        parentesco: 'PADRE',
        celular: '',
        correo: '',
        direccion: '',
        observaciones: ''
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
    <div className="page-container">

      {/* CARD PRINCIPAL */}
      <div className="card">
        <h3 className="card-title">
          👨‍👩‍👧 Registro de Apoderados
        </h3>

        {/* FILTROS */}
        <div className="form-grid">

          <div className="input-group">
            <label className="input-label">1. Sede</label>
            <select
              className="select"
              value={filtros.idSede}
              onChange={(e) =>
                setFiltros({ ...filtros, idSede: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              {sedes.map(s => (
                <option key={s.idSede} value={s.idSede}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">2. Grado</label>
            <select
              className="select"
              value={filtros.idGrado}
              onChange={(e) =>
                setFiltros({ ...filtros, idGrado: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              {gradosFiltrados.map(g => (
                <option key={g.idGrado} value={g.idGrado}>
                  {g.nombreGrado}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">3. Estudiante</label>
            <select
              className="select"
              value={filtros.idEstudiante}
              onChange={(e) =>
                setFiltros({ ...filtros, idEstudiante: e.target.value })
              }
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
        <div className="card">

          <h4 className="section-title">
            ✍ Datos del Apoderado
          </h4>

          {mensaje.texto && (
            <div className={`alert ${mensaje.tipo === 'error' ? 'error' : 'success'}`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmitPadre}>
            <div className="form-grid">

              <div className="input-group">
                <label className="input-label">DNI</label>
                <input
                  className="input"
                  required
                  maxLength={8}
                  value={padreData.nroDocumento}
                  onChange={e =>
                    setPadreData({
                      ...padreData,
                      nroDocumento: e.target.value.replace(/\D/g, '')
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">Parentesco</label>
                <select
                  className="select"
                  value={padreData.parentesco}
                  onChange={e =>
                    setPadreData({
                      ...padreData,
                      parentesco: e.target.value
                    })
                  }
                >
                  <option value="PADRE">Padre</option>
                  <option value="MADRE">Madre</option>
                  <option value="TUTOR">Tutor</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Nombres</label>
                <input
                  className="input"
                  required
                  value={padreData.nombres}
                  onChange={e =>
                    setPadreData({
                      ...padreData,
                      nombres: e.target.value
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label">Apellidos</label>
                <input
                  className="input"
                  required
                  value={padreData.apellidos}
                  onChange={e =>
                    setPadreData({
                      ...padreData,
                      apellidos: e.target.value
                    })
                  }
                />
              </div>

            </div>
            <div className="input-group">
              <label className="input-label">Celular</label>
              <input
                className="input"
                maxLength={9}
                value={padreData.celular}
                onChange={e =>
                  setPadreData({
                    ...padreData,
                    celular: e.target.value.replace(/\D/g, '')
                  })
                }
              />
            </div>

            <div className="input-group">
              <label className="input-label">Correo</label>
              <input
                type="email"
                className="input"
                value={padreData.correo}
                onChange={e =>
                  setPadreData({
                    ...padreData,
                    correo: e.target.value
                  })
                }
              />
            </div>

            <div className="input-group">
              <label className="input-label">Dirección</label>
              <input
                className="input"
                value={padreData.direccion}
                onChange={e =>
                  setPadreData({
                    ...padreData,
                    direccion: e.target.value
                  })
                }
              />
            </div>

            <div className="input-group full-width">
              <label className="input-label">Observaciones</label>
              <textarea
                className="input"
                rows={3}
                value={padreData.observaciones}
                onChange={e =>
                  setPadreData({
                    ...padreData,
                    observaciones: e.target.value
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : modoEdicion
                    ? '✏️ Actualizar Apoderado'
                    : '💾 Guardar Apoderado'
                }
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
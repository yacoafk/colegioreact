import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function EstudiantesRegistroView() {
  const [estudiantesList, setEstudiantesList] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [grados, setGrados] = useState([]); // Lista global de grados traída del backend
  const [gradosFiltrados, setGradosFiltrados] = useState([]); // 💡 NUEVO: Lista filtrada por la sede seleccionada
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    codigoEstudiante: '',
    idTipoDoc: 1, 
    nroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: 'M', 
    idGrado: '',  
    idSede: '',  
    montoPension: 0.00
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS DESDE EL BACKEND
  const listarEstudiantes = async () => {
    try {
      const response = await api.get('estudiantes/todos'); 
      setEstudiantesList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de estudiantes", err);
    }
  };

  const cargarSedes = async () => {
    try {
      const response = await api.get('sedes');
      setSedes(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, idSede: response.data[0].idSede }));
      }
    } catch (err) {
      console.error("Error al cargar sedes", err);
    }
  };

  const cargarGrados = async () => {
    try {
      const response = await api.get('grados'); 
      setGrados(response.data);
    } catch (err) {
      console.error("Error al cargar grados", err);
    }
  };

  useEffect(() => {
    listarEstudiantes();
    cargarSedes(); 
    cargarGrados(); 
  }, []);

  // 💡 NUEVO: Efecto que vigila el cambio de 'idSede' o la lista de 'grados' para actualizar las opciones disponibles
  useEffect(() => {
    if (formData.idSede) {
      // Filtramos la lista maestra de grados basándonos en el idSede actual del formulario
      const filtrados = grados.filter(g => g.idSede === Number(formData.idSede));
      setGradosFiltrados(filtrados);

      // Verificamos si el grado actualmente seleccionado pertenece a la nueva lista filtrada
      const gradoEsValido = filtrados.some(g => g.idGrado === formData.idGrado);

      // Si no es válido (o está vacío) y hay grados disponibles para esa sede, auto-seleccionamos el primero
      if (!gradoEsValido && filtrados.length > 0) {
        setFormData(prev => ({ ...prev, idGrado: filtrados[0].idGrado }));
      } else if (filtrados.length === 0) {
        // Si la sede no tiene ningún grado configurado todavía, limpiamos el campo
        setFormData(prev => ({ ...prev, idGrado: '' }));
      }
    } else {
      setGradosFiltrados([]);
    }
  }, [formData.idSede, grados]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nroDocumento' ) {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else if (name === 'montoPension') {
      setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      const finalValue = ['idTipoDoc', 'idGrado', 'idSede'].includes(name) ? Number(value) : value;
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (estudiante) => {
    if (estudiante.estado === 'RETIRADO') return; 

    setEditingId(estudiante.idEstudiante); 
    setFormData({
      codigoEstudiante: estudiante.codigoEstudiante,
      idTipoDoc: estudiante.idTipoDoc || 1,
      nroDocumento: estudiante.nroDocumento,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      fechaNacimiento: estudiante.fechaNacimiento, 
      sexo: estudiante.sexo,
      idSede: estudiante.idSede || (sedes[0]?.idSede || 1),
      idGrado: estudiante.idGrado || '', // El useEffect superior se encargará de validar la consistencia
      montoPension: estudiante.montoPension
    });
    setMensaje({ texto: `Editando al estudiante: ${estudiante.nombres}`, tipo: 'success' });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({ 
      codigoEstudiante: '',
      idTipoDoc: 1, 
      nroDocumento: '', 
      nombres: '', 
      apellidos: '', 
      fechaNacimiento: '',
      sexo: 'M',
      idSede: sedes[0]?.idSede || '',
      idGrado: '', // El useEffect relacional calculará el grado inicial de la sede por defecto
      montoPension: 0.00
    });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (!formData.codigoEstudiante || !formData.nroDocumento || !formData.nombres || !formData.apellidos || !formData.fechaNacimiento || !formData.idGrado || !formData.idSede) {
      setMensaje({ texto: 'Por favor, rellena todos los campos obligatorios y asegúrate de asignar un grado válido.', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        await api.put(`estudiantes/modificar/${editingId}`, formData);
        setMensaje({ texto: `¡Estudiante actualizado con éxito!`, tipo: 'success' });
      } else {
        await api.post('estudiantes/registrar', formData);
        setMensaje({ texto: `¡Estudiante registrado con éxito!`, tipo: 'success' });
      }
      
      cancelarEdicion();
      listarEstudiantes(); 
    } catch (err) {
      let errorTexto = 'Ocurrió un error en la operación.';
      if (err.response?.data) {
        errorTexto = typeof err.response.data === 'object' 
          ? err.response.data.message || 'Error en los datos enviados.' 
          : err.response.data;
      }
      setMensaje({ texto: errorTexto, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarLogico = async (id, nombres) => {
    if (window.confirm(`¿Estás seguro de que deseas retirar al estudiante ${nombres}? Su estado cambiará a RETIRADO.`)) {
      try {
        await api.delete(`estudiantes/eliminar/${id}`);
        setMensaje({ texto: `El estudiante ${nombres} ha sido marcado como RETIRADO.`, tipo: 'success' });
        listarEstudiantes(); 
      } catch (err) {
        setMensaje({ texto: 'Error al dar de baja al estudiante.', tipo: 'error' });
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA DE CONTROL */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Estudiantes Registrados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>Código</th>
              <th>Nombres y Apellidos</th>
              <th>Grado</th> 
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesList.map((e) => (
              <tr key={e.idEstudiante} style={{ borderBottom: '1px solid var(--border-light)', opacity: e.estado === 'RETIRADO' ? 0.7 : 1 }}>
                <td style={{ padding: '12px 5px' }}>{e.codigoEstudiante}</td>
                <td>{e.nombres} {e.apellidos}</td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-main)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    {grados.find(g => g.idGrado === e.idGrado)?.nombreGrado || `Grado (${e.idGrado})`}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                    backgroundColor: e.estado === 'ACTIVO' ? '#d1fae5' : 'var(--danger-bg)',
                    color: e.estado === 'ACTIVO' ? '#065f46' : 'var(--danger-text)'
                  }}>
                    {e.estado}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px 5px' }}>
                  {e.estado !== 'RETIRADO' ? (
                    <>
                      <button 
                        onClick={() => handleEditClick(e)}
                        title="Editar estudiante"
                        style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleEliminarLogico(e.idEstudiante, e.nombres)}
                        title="Dar de baja (Retirar)"
                        style={{ padding: '6px 10px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                      🚫 Retirado
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DINÁMICO */}
      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
            {editingId ? 'Modificar Estudiante' : 'Registrar Nuevo Estudiante'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {editingId ? 'Modifica los campos del registro escolar.' : 'Al guardar se le asignará el estado inicial ACTIVO.'}
          </p>
        </div>

        {mensaje.texto && (
          <div style={{
            backgroundColor: mensaje.tipo === 'success' ? '#d1fae5' : 'var(--danger-bg)',
            color: mensaje.tipo === 'success' ? '#065f46' : 'var(--danger-text)',
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500'
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Código Alumno</label>
              <input type="text" name="codigoEstudiante" value={formData.codigoEstudiante} onChange={handleChange} placeholder="Ej. EST2026" />
            </div>
            <div className="input-group">
              <label>Nro Documento (DNI)</label>
              <input type="text" name="nroDocumento" maxLength={8} value={formData.nroDocumento} onChange={handleChange} placeholder="Ej. 74859612" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="input-group">
              <label>Nombres</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="input-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }} />
            </div>
            <div className="input-group">
              <label>Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            {/* Selector de Sede */}
            <div className="input-group">
              <label>Sede</label>
              <select name="idSede" value={formData.idSede} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
                {sedes.map((s) => (
                  <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Selector de Grado Académico: Enviando SOLO el ID numérico limpio al backend */}
            <div className="input-group">
              <label>Grado Académico</label>
              <select name="idGrado" value={formData.idGrado} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)' }}>
                {gradosFiltrados.map((g) => (
                  // El value SIEMPRE debe ser el id numérico del grado
                  <option key={g.idGrado} value={Number(g.idGrado)}>
                    {g.nombreGrado}
                  </option>
                ))}
                {gradosFiltrados.length === 0 && (
                  <option value="">⚠️ Sin grados en esta sede</option>
                )}
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Monto Pensión (S/.)</label>
            <input type="number" step="0.01" name="montoPension" value={formData.montoPension} onChange={handleChange} placeholder="0.00" />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || gradosFiltrados.length === 0} style={{ marginTop: '24px', width: '100%' }}>
            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Estudiante'}
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
import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function PersonalRegistroView() {
  const [personalList, setPersonalList] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [roles, setRoles] = useState([]); 
  const [tiposDoc, setTiposDoc] = useState([]); // 🆕 Estado para almacenar los tipos de documento desde el Backend
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    idTipoDoc: '', // 🔄 Se inicializa vacío para que tome el primer elemento dinámico cargado
    nroDocumento: '',
    nombres: '',
    apellidos: '',
    contrasenia: '',
    idRol: '',  
    idSede: ''  
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS DESDE EL BACKEND
  const listarPersonal = async () => {
    try {
      const response = await api.get('personal'); 
      setPersonalList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de personal", err);
    }
  };

  // 🆕 FUNCIÓN PARA CARGAR LOS TIPOS DE DOCUMENTO DESDE LA API
  const cargarTiposDocumento = async () => {
    try {
      const response = await api.get('tipos-documento');
      setTiposDoc(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, idTipoDoc: response.data[0].idTipoDoc }));
      }
    } catch (err) {
      console.error("Error al cargar tipos de documento para el select", err);
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
      console.error("Error al cargar sedes para el select", err);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await api.get('roles'); 
      setRoles(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, idRol: response.data[0].idRol }));
      }
    } catch (err) {
      console.error("Error al cargar roles para el select", err);
    }
  };

  useEffect(() => {
    listarPersonal();
    cargarTiposDocumento(); // 🆕 Disparamos la consulta al montar el componente
    cargarSedes(); 
    cargarRoles(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nroDocumento') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      const finalValue = ['idTipoDoc', 'idRol', 'idSede'].includes(name) ? Number(value) : value;
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (persona) => {
    if (persona.estado === 'RETIRADO') return;

    setEditingId(persona.idPersonal); 
    setFormData({
      idTipoDoc: persona.idTipoDoc?.idTipoDoc || (tiposDoc[0]?.idTipoDoc || 1), // 🔄 Mapeo dinámico del TipoDoc asignado
      nroDocumento: persona.nroDocumento,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      contrasenia: '', 
      idRol: persona.idRol?.idRol || (roles[0]?.idRol || 1), 
      idSede: persona.idSede?.idSede || (sedes[0]?.idSede || 1)
    });
    setMensaje({ texto: `Editando a: ${persona.nombres}`, tipo: 'success' });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({ 
      idTipoDoc: tiposDoc[0]?.idTipoDoc || '', // 🔄 Resetea al primer tipo de documento de la lista
      nroDocumento: '', 
      nombres: '', 
      apellidos: '', 
      contrasenia: '', 
      idRol: roles[0]?.idRol || '',  
      idSede: sedes[0]?.idSede || '' 
    });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (!formData.idTipoDoc || !formData.nroDocumento || !formData.nombres || !formData.apellidos || (!editingId && !formData.contrasenia)) {
      setMensaje({ texto: 'Por favor, rellena todos los campos requeridos.', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        const response = await api.put(`personal/modificar/${editingId}`, formData);
        setMensaje({ texto: `¡Personal ${response.data.nombres} actualizado con éxito!`, tipo: 'success' });
      } else {
        const response = await api.post('personal/registrar', formData);
        setMensaje({ texto: `¡Personal ${response.data.nombres} registrado con éxito!`, tipo: 'success' });
      }
      
      cancelarEdicion();
      listarPersonal(); 
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
    if (window.confirm(`¿Estás seguro de que deseas retirar a ${nombres}? Ya no podrá iniciar sesión.`)) {
      try {
        await api.delete(`personal/eliminar/${id}`);
        setMensaje({ texto: `El usuario ${nombres} ha sido marcado como RETIRADO.`, tipo: 'success' });
        listarPersonal(); 
      } catch (err) {
        setMensaje({ texto: 'Error al dar de baja al personal.', tipo: 'error' });
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA DE CONTROL */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Personal Registrado</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>Documento</th>
              <th>Nombres y Apellidos</th>
              <th>Rol / Cargo</th> 
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personalList.map((p) => (
              <tr key={p.idPersonal} style={{ borderBottom: '1px solid var(--border-light)', opacity: p.estado === 'RETIRADO' ? 0.7 : 1 }}>
                {/* 🔄 Muestra el tipo de documento abreviado junto al número (Ej: DNI - 74859612) */}
                <td style={{ padding: '12px 5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '4px' }}>
                    {p.idTipoDoc?.abreviatura || 'DOC'}:
                  </span>
                  {p.nroDocumento}
                </td>
                <td>{p.nombres} {p.apellidos}</td>
                
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-main)', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    {p.idRol?.nombreRol || 'Sin Rol'}
                  </span>
                </td>

                <td>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                    backgroundColor: p.estado === 'ACTIVO' ? '#d1fae5' : 'var(--danger-bg)',
                    color: p.estado === 'ACTIVO' ? '#065f46' : 'var(--danger-text)'
                  }}>
                    {p.estado}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px 5px' }}>
                  
                  {p.estado !== 'RETIRADO' ? (
                    <>
                      <button 
                        onClick={() => handleEditClick(p)}
                        title="Editar personal"
                        style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleEliminarLogico(p.idPersonal, p.nombres)}
                        title="Dar de baja"
                        style={{ padding: '6px 10px', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                      🚫 Cuenta Bloqueada
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
            {editingId ? 'Modificar Personal' : 'Registrar Nuevo Personal'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {editingId ? 'Actualiza los campos necesarios.' : 'Los datos se guardarán cifrados bajo protocolos BCrypt.'}
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

        <form onSubmit={handleSubmit} style={{ display: 'block' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Tipo Documento</label>
              {/* 🔄 SELECT COMPLETAMENTE DINÁMICO DESDE LA API DE TIPOS DE DOCUMENTO */}
              <select name="idTipoDoc" value={formData.idTipoDoc} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none' }}>
                {tiposDoc.map((tipo) => (
                  <option key={tipo.idTipoDoc} value={tipo.idTipoDoc}>
                    {tipo.abreviatura} - {tipo.descripcion}
                  </option>
                ))}
                {tiposDoc.length === 0 && (
                  <option value="">Cargando documentos...</option>
                )}
              </select>
            </div>
            <div className="input-group">
              <label>Nro Documento</label>
              <input type="text" name="nroDocumento" maxLength={15} value={formData.nroDocumento} onChange={handleChange} placeholder="Ej. 74859612" />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Nombres</label>
            <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} />
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Apellidos</label>
            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} />
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Contraseña {editingId && '(Dejar en blanco para no cambiar)'}</label>
            <input type="password" name="contrasenia" value={formData.contrasenia} onChange={handleChange} placeholder={editingId ? "Nueva contraseña opcional" : "Asigna una contraseña"} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="input-group">
              <label>Rol Asignado</label>
              <select name="idRol" value={formData.idRol} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none' }}>
                {roles.map((rol) => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.nombreRol}
                  </option>
                ))}
                {roles.length === 0 && (
                  <option value="">No hay roles disponibles</option>
                )}
              </select>
            </div>
            <div className="input-group">
              <label>Sede Destino</label>
              <select name="idSede" value={formData.idSede} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none' }}>
                {sedes.map((sede) => (
                  <option key={sede.idSede} value={sede.idSede}>
                    {sede.nombre}
                  </option>
                ))}
                {sedes.length === 0 && (
                  <option value="">No hay sedes disponibles</option>
                )}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Empleado'}
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
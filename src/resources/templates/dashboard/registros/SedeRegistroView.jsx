import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function SedeRegistroView() {
  // Lista de sedes para la tabla
  const [sedesList, setSedesList] = useState([]);
  
  // Estado para saber si estamos editando (guarda el ID de la sede) o registrando (null)
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    codigoSede: '',
    nombre: '',
    ubicacion: '',
    comentarios: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR LA LISTA DE SEDES AL MONTAR EL COMPONENTE
  const listarSedes = async () => {
    try {
      const response = await api.get('sedes'); 
      setSedesList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de sedes", err);
    }
  };

  useEffect(() => {
    listarSedes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (sede) => {
    setEditingId(sede.idSede); // Activamos modo edición
    setFormData({
      codigoSede: sede.codigoSede,
      nombre: sede.nombre,
      ubicacion: sede.ubicacion || '',
      comentarios: sede.comentarios || ''
    });
    setMensaje({ texto: `Editando la sede: ${sede.nombre}`, tipo: 'success' });
  };

  // Cancelar la edición y limpiar el formulario
  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({ codigoSede: '', nombre: '', ubicacion: '', comentarios: '' });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR (REGISTRAR O MODIFICAR)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    // Validación básica requerida por los campos obligatorios del Backend
    if (!formData.codigoSede || !formData.nombre) {
      setMensaje({ texto: 'Por favor, rellena los campos obligatorios (Código y Nombre).', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // 🔄 MODO MODIFICAR (PUT) -> /api/sedes/modificar/{id}
        const response = await api.put(`sedes/modificar/${editingId}`, formData);
        setMensaje({ texto: `¡Sede "${response.data.nombre}" actualizada con éxito!`, tipo: 'success' });
      } else {
        // ➕ MODO REGISTRAR (POST) -> /api/sedes/registrar
        const response = await api.post('sedes/registrar', formData);
        setMensaje({ texto: `¡Sede "${response.data.nombre}" registrada con éxito!`, tipo: 'success' });
      }
      
      cancelarEdicion();
      listarSedes(); // Recargar la tabla de sedes
    } catch (err) {
      // 💡 CORRECCIÓN CONTROLADA: Extrae el texto para evitar renderizar un objeto JSON directo
      let errorTexto = 'Ocurrió un error en la operación.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Si Spring Boot devuelve su JSON de error estructurado por defecto (como el 404)
          errorTexto = err.response.data.message || `Error ${err.response.status}: Servicio no disponible.`;
        } else {
          // Si el Backend responde con texto plano (e.g. e.getMessage() en BAD_REQUEST)
          errorTexto = err.response.data;
        }
      }
      
      setMensaje({ texto: errorTexto, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA DE CONTROL */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Sedes Registradas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>Código</th>
              <th>Nombre de Sede</th>
              <th>Ubicación</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedesList.map((s) => (
              <tr key={s.idSede} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 5px', fontWeight: '600' }}>{s.codigoSede}</td>
                <td>{s.nombre}</td>
                <td>{s.ubicacion || <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No asignada</span>}</td>
                <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px 5px' }}>
                  <button 
                    onClick={() => handleEditClick(s)}
                    style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {sedesList.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No hay sedes registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DINÁMICO */}
      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
            {editingId ? 'Modificar Sede' : 'Registrar Nueva Sede'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {editingId ? 'Actualiza la información geográfica o de control.' : 'Asigna un código único para identificar el nuevo establecimiento.'}
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
              <label>Código Sede *</label>
              <input 
                type="text" 
                name="codigoSede" 
                value={formData.codigoSede} 
                onChange={handleChange} 
                placeholder="Ej. SEDE-CENTRAL" 
                disabled={editingId !== null}
              />
            </div>
            <div className="input-group">
              <label>Nombre *</label>
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Ej. Sede Central Secundaria" 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Ubicación / Dirección</label>
            <input 
              type="text" 
              name="ubicacion" 
              value={formData.ubicacion} 
              onChange={handleChange} 
              placeholder="Ej. Av. Larco 123 - Miraflores" 
            />
          </div>

          <div className="input-group" style={{ marginTop: '12px' }}>
            <label>Comentarios adicionales</label>
            <textarea 
              name="comentarios" 
              value={formData.comentarios} 
              onChange={handleChange} 
              placeholder="Detalles sobre infraestructura, horarios o referencias de acceso..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none', minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Sede'}
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
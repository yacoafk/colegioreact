import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function RolRegistroView() {
  // Lista de roles para la tabla
  const [rolesList, setRolesList] = useState([]);

  // Formulario simplificado (Solo necesitamos el nombre del rol)
  const [formData, setFormData] = useState({
    nombreRol: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR LA LISTA DE ROLES AL MONTAR EL COMPONENTE
  const listarRoles = async () => {
    try {
      const response = await api.get('roles'); 
      setRolesList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de roles", err);
    }
  };

  useEffect(() => {
    listarRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Limpiar el formulario de forma segura
  const limpiarFormulario = () => {
    setFormData({ nombreRol: '' });
  };

  // 2. MANEJAR EL PROCESO DE GUARDAR (SÓLO REGISTRAR - POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    // Validación básica requerida por la lógica del Backend
    if (!formData.nombreRol.trim()) {
      setMensaje({ texto: 'Por favor, rellena el campo obligatorio (Nombre del Rol).', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      // ➕ MODO REGISTRAR (POST) -> /api/roles
      const response = await api.post('roles', formData);
      setMensaje({ texto: `¡Rol "${response.data.nombreRol}" registrado con éxito!`, tipo: 'success' });
      
      limpiarFormulario();
      listarRoles(); // Recargar la tabla de roles inmediatamente
    } catch (err) {
      let errorTexto = 'Ocurrió un error en la operación.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorTexto = err.response.data.message || `Error ${err.response.status}: Servicio no disponible.`;
        } else {
          // Captura el string del RuntimeException que configuramos en tu ServiceImpl
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
      
      {/* SECCIÓN IZQUIERDA: TABLA DE CONTROL (SÓLO LECTURA) */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Roles de Seguridad</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>ID</th>
              <th>Nombre del Rol</th>
              <th style={{ textAlign: 'center' }}>Restricción</th>
            </tr>
          </thead>
          <tbody>
            {rolesList.map((r) => (
              <tr key={r.idRol} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 5px', fontWeight: '600' }}>{r.idRol}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {r.nombreRol}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    🔒 Inmutable
                  </span>
                </td>
              </tr>
            ))}
            {rolesList.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No hay roles registrados en la base de datos.
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
            Registrar Nuevo Rol
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Por motivos de seguridad y auditoría institucional, los roles no admiten modificaciones posteriores ni eliminaciones una vez guardados.
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
          <div className="input-group">
            <label>Nombre del Rol *</label>
            <input 
              type="text" 
              name="nombreRol" 
              value={formData.nombreRol} 
              onChange={handleChange} 
              placeholder="Ej. administrador, docente, auxiliar" 
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px', width: '100%' }}>
            {loading ? 'Procesando...' : 'Registrar Rol Seguro'}
          </button>
        </form>
      </div>
    </div>
  );
}
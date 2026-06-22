import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function TipoDocumentoRegistroView() {
  // Lista de tipos de documento para la tabla
  const [documentosList, setDocumentosList] = useState([]);
  
  // Estado para saber si estamos editando (guarda el ID) o registrando (null)
  const [editingId, setEditingId] = useState(null);

  // Mapea exactamente con las propiedades del TipoDocumentoRequest del backend
  const [formData, setFormData] = useState({
    abreviatura: '',
    descripcion: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR LOS TIPOS DE DOCUMENTO AL MONTAR EL COMPONENTE
  const listarDocumentos = async () => {
    try {
      // Consume el GET de: /api/tipos-documento
      const response = await api.get('tipos-documento'); 
      setDocumentosList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de tipos de documento", err);
    }
  };

  useEffect(() => {
    listarDocumentos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (doc) => {
    setEditingId(doc.idTipoDoc); // Activamos modo edición con el ID correspondiente
    setFormData({
      abreviatura: doc.abreviatura,
      descripcion: doc.descripcion
    });
    setMensaje({ texto: `Editando el tipo de documento: ${doc.abreviatura}`, tipo: 'success' });
  };

  // Cancelar la edición y resetear el formulario
  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({ abreviatura: '', descripcion: '' });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR (REGISTRAR O MODIFICAR)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    // Validación de campos requeridos
    if (!formData.abreviatura || !formData.descripcion) {
      setMensaje({ texto: 'Por favor, rellena todos los campos obligatorios.', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // 🔄 MODO MODIFICAR (PUT) -> /api/tipos-documento/modificar/{id}
        const response = await api.put(`tipos-documento/modificar/${editingId}`, formData);
        setMensaje({ texto: `¡Tipo de documento "${response.data.abreviatura}" actualizado con éxito!`, tipo: 'success' });
      } else {
        // ➕ MODO REGISTRAR (POST) -> /api/tipos-documento/registrar
        const response = await api.post('tipos-documento/registrar', formData);
        setMensaje({ texto: `¡Tipo de documento "${response.data.abreviatura}" registrado con éxito!`, tipo: 'success' });
      }
      
      cancelarEdicion();
      listarDocumentos(); // Recargar la tabla de documentos
    } catch (err) {
      let errorTexto = 'Ocurrió un error en la operación.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorTexto = err.response.data.message || `Error ${err.response.status}: Servicio no disponible.`;
        } else {
          // Extrae el mensaje de error personalizado ("error") enviado por tu Controller
          try {
            const parsedError = JSON.parse(err.response.data);
            errorTexto = parsedError.error || errorTexto;
          } catch {
            errorTexto = err.response.data;
          }
        }
      }
      
      setMensaje({ texto: errorTexto, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA DE TIPOS DE DOCUMENTO */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Tipos de Documento</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>ID</th>
              <th>Abreviatura</th>
              <th>Descripción / Nombre Completo</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentosList.map((doc) => (
              <tr key={doc.idTipoDoc} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 5px', color: 'var(--text-muted)' }}>#{doc.idTipoDoc}</td>
                <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{doc.abreviatura}</td>
                <td>{doc.descripcion}</td>
                <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px 5px' }}>
                  <button 
                    onClick={() => handleEditClick(doc)}
                    style={{ padding: '6px 10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {documentosList.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No hay tipos de documento registrados en el sistema.
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
            {editingId ? 'Modificar Tipo Documento' : 'Registrar Tipo Documento'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {editingId ? 'Cambia la abreviatura o descripción oficial de este documento.' : 'Agrega una nueva identificación legal para el personal o estudiantes.'}
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
            <label>Abreviatura *</label>
            <input 
              type="text" 
              name="abreviatura" 
              value={formData.abreviatura} 
              onChange={handleChange} 
              placeholder="Ej. DNI, RUC, CE, PASAPORTE" 
              maxLength={10}
            />
          </div>

          <div className="input-group" style={{ marginTop: '14px' }}>
            <label>Descripción / Nombre Largo *</label>
            <input 
              type="text" 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Ej. Documento Nacional de Identidad" 
              maxLength={100}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Documento'}
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
import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 

export function GradosRegistroView() {
  const [gradosList, setGradosList] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    idSede: '',
    nombreGrado: '',
    seccion: '',
    nivel: 'Secundaria' // Nivel inicial por defecto
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS DESDE EL BACKEND
  const listarGrados = async () => {
    try {
      const response = await api.get('grados'); 
      setGradosList(response.data);
    } catch (err) {
      console.error("Error al obtener la lista de grados", err);
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
      console.error("Error al cargar sedes para el selector", err);
    }
  };

  useEffect(() => {
    listarGrados();
    cargarSedes(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si cambia la sede, la convertimos en número para que coincida con el Request DTO plano
    const finalValue = name === 'idSede' ? Number(value) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (grado) => {
    setEditingId(grado.idGrado); 
    setFormData({
      idSede: grado.idSede || (sedes[0]?.idSede || ''),
      nombreGrado: grado.nombreGrado,
      seccion: grado.seccion,
      nivel: grado.nivel
    });
    setMensaje({ texto: `Editando: ${grado.nombreGrado}`, tipo: 'success' });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({ 
      idSede: sedes[0]?.idSede || '', 
      nombreGrado: '', 
      seccion: '', 
      nivel: 'Secundaria'
    });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (!formData.idSede || !formData.nombreGrado || !formData.seccion || !formData.nivel) {
      setMensaje({ texto: 'Por favor, rellena todos los campos requeridos.', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        await api.put(`grados/modificar/${editingId}`, formData);
        setMensaje({ texto: `¡Grado actualizado con éxito!`, tipo: 'success' });
      } else {
        await api.post('grados/registrar', formData);
        setMensaje({ texto: `¡Grado registrado y asignado con éxito!`, tipo: 'success' });
      }
      
      cancelarEdicion();
      listarGrados(); 
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      
      {/* SECCIÓN IZQUIERDA: TABLA DE CONTROL DE GRADOS */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontWeight: '600' }}>Grados y Secciones Configuradas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 5px' }}>Grado / Aula</th>
              <th>Sección</th>
              <th>Nivel</th>
              <th>Sede Asignada</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gradosList.map((g) => (
              <tr key={g.idGrado} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 5px', fontWeight: '500', color: 'var(--text-main)' }}>{g.nombreGrado}</td>
                <td>{g.seccion}</td>
                <td>{g.nivel}</td>
                
                {/* Cruzamos el idSede con la lista de sedes local para pintar el nombre legible */}
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                    {sedes.find(s => s.idSede === g.idSede)?.nombre || `Sede (ID: ${g.idSede})`}
                  </span>
                </td>

                <td style={{ textAlign: 'center', padding: '12px 5px' }}>
                  <button 
                    onClick={() => handleEditClick(g)}
                    title="Editar configuración del grado"
                    style={{ padding: '6px 10px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {gradosList.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No hay grados registrados actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DE REGISTRO / MODIFICACIÓN */}
      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '600' }}>
            {editingId ? 'Modificar Configuración' : 'Registrar Nuevo Grado'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {editingId ? 'Ajusta los parámetros del aula seleccionada.' : 'Crea las aulas asignándoles su respectiva localización física.'}
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
            <label>Sede de Destino (Ubicación)</label>
            <select name="idSede" value={formData.idSede} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none' }}>
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>
                  {s.nombre}
                </option>
              ))}
              {sedes.length === 0 && (
                <option value="">No existen sedes creadas</option>
              )}
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '14px' }}>
            <label>Nombre del Grado / Año</label>
            <input 
              type="text" 
              name="nombreGrado" 
              value={formData.nombreGrado} 
              onChange={handleChange} 
              placeholder="Ej. Primero de Secundaria o 5to Grado" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
            <div className="input-group">
              <label>Sección</label>
              <input 
                type="text" 
                name="seccion" 
                value={formData.seccion} 
                onChange={handleChange} 
                placeholder="Ej. A, B o Única" 
              />
            </div>

            <div className="input-group">
              <label>Nivel Educativo</label>
              <select name="nivel" value={formData.nivel} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-input)', outline: 'none' }}>
                <option value="Inicial">Inicial</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '24px', width: '100%' }}>
            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Grado'}
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
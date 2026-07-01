import { useState, useEffect } from 'react';

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 
import '../../../static/Detalles.css'; 

export function ProfesoresMaterialesRegistroView({ idClase, onBack }) {

  const [formMaterial, setFormMaterial] = useState({
    titulo: '',
    descripcion: '',
    urlArchivo: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrarMaterial = async (e) => {
    e.preventDefault();

    if (!idClase) {
      setMensaje({ texto: 'Clase no válida.', tipo: 'error' });
      return;
    }

    setSubmitting(true);

    const payload = {
      idClase,
      titulo: formMaterial.titulo,
      descripcion: formMaterial.descripcion,
      urlArchivo: formMaterial.urlArchivo || null
    };

    try {
      await api.post('/materiales/registrar', payload);

      setMensaje({ texto: 'Material registrado correctamente', tipo: 'success' });

      setFormMaterial({
        titulo: '',
        descripcion: '',
        urlArchivo: ''
      });

    } catch (err) {
      setMensaje({ texto: 'Error al registrar material', tipo: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="page-container2">
        
      <button onClick={onBack} className="btn-back">
        ← Volver al curso
      </button> 

        <form onSubmit={handleRegistrarMaterial}>
          <h2>Registrar Nuevo Material</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              className="input-field" // Aplica estilos de input base
              name="titulo" 
              placeholder="Título del material" 
              onChange={handleFormChange} 
              required
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)' }}
            />
            
            <textarea 
              name="descripcion" 
              placeholder="Descripción breve..." 
              onChange={handleFormChange} 
              rows="4"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)', resize: 'vertical' }}
            />
            
            <input 
              name="urlArchivo" 
              placeholder="URL del archivo" 
              onChange={handleFormChange} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-videoconferencia" 
            disabled={submitting}
            style={{ marginTop: '20px', width: '100%' }}
          >
            {submitting ? 'Guardando...' : 'Guardar Material'}
          </button>

          {mensaje.texto && (
            <p style={{ 
              marginTop: '15px', 
              color: mensaje.tipo === 'error' ? 'var(--danger-text)' : 'var(--primary-color)' 
            }}>
              {mensaje.texto}
            </p>
          )}
        </form>
      </div>
    );
}
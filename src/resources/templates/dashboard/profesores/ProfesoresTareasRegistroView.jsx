import { useState, useEffect } from 'react';

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 
import '../../../static/Detalles.css'; 

export function ProfesoresTareasRegistroView({ idClase, onBack }) {
  const [formTarea, setFormTarea] = useState({
    titulo: '',
    descripcion: '',
    urlArchivoAdjunto: '',
    fechaInicio: '',
    fechaTermino: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormTarea(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrarTarea = async (e) => {
    e.preventDefault();
    if (!idClase) {
      setMensaje({ texto: 'Clase no válida.', tipo: 'error' });
      return;
    }
    setSubmitting(true);
    
    try {
      await api.post('/tareas/registrar', { idClase, ...formTarea });
      setMensaje({ texto: 'Tarea registrada correctamente', tipo: 'success' });
      setFormTarea({ titulo: '', descripcion: '', urlArchivoAdjunto: '', fechaInicio: '', fechaTermino: '' });
    } catch (err) {
      setMensaje({ texto: 'Error al registrar tarea', tipo: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container2">

      <button onClick={onBack} className="btn-back">
        ← Volver al curso
      </button> 

      <form onSubmit={handleRegistrarTarea}>
        <h2>Registrar Nueva Tarea</h2> 

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            className="input-field"
            name="titulo" 
            placeholder="Título de la tarea" 
            value={formTarea.titulo}
            onChange={handleFormChange} 
            required 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)' }}
          />
          
          <textarea 
            name="descripcion" 
            placeholder="Descripción detallada de la tarea..." 
            value={formTarea.descripcion}
            onChange={handleFormChange} 
            rows="4"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)', resize: 'vertical' }}
          />

          <input 
            name="urlArchivoAdjunto" 
            placeholder="URL del archivo adjunto" 
            value={formTarea.urlArchivoAdjunto}
            onChange={handleFormChange} 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Fecha de inicio:</label>
              <input 
                type="datetime-local" 
                name="fechaInicio" 
                onChange={handleFormChange} 
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Fecha de término:</label>
              <input 
                type="datetime-local" 
                name="fechaTermino" 
                onChange={handleFormChange} 
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input)', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-videoconferencia" 
          disabled={submitting}
          style={{ marginTop: '20px', width: '100%' }}
        >
          {submitting ? 'Registrando...' : 'Registrar Tarea'}
        </button>

        {mensaje.texto && (
          <p style={{ 
            marginTop: '15px', 
            textAlign: 'center',
            color: mensaje.tipo === 'error' ? 'var(--danger-text)' : 'var(--primary-color)' 
          }}>
            {mensaje.texto}
          </p>
        )}
      </form>
    </div>
  );
}
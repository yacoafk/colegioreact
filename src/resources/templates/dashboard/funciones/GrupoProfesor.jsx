import React, { useState, useEffect } from 'react';

import '../../../static/Dashboard.css';
import '../../../static/Aside.css';
import '../../../static/global.css';

export function GrupoProfesor({ onViewChange, currentView }) {
  const [openProfesor, setOpenProfesor] = useState(false);

  useEffect(() => {
  if (vistaPerteneceAProfesor) {
    setOpenProfesor(true);
  }
  }, [currentView]);

  // ✅ Detecta si estás dentro de una vista del profesor
  const vistaPerteneceAProfesor = [
    'profesores-cursos',
    'registrar-clases',
    'registrar-asistencia',
    'registrar-tareas',
    'registrar-material'
  ].includes(currentView);

  return (
    <div>
      <button 
        onClick={() => setOpenProfesor(!openProfesor)}
        className={`nav-item ${vistaPerteneceAProfesor ? 'active' : ''}`}
      >
        <span>  Control de Profesor</span>
        <span>{openProfesor ? '▼' : '▶'}</span>
      </button>

        {openProfesor && (
        <div className="sub-menu">

          <button 
            onClick={() => onViewChange('profesores-cursos')}
            className={`sub-item ${currentView === 'registrar-clases' ? 'active' : ''}`}
          >
            Cursos
          </button>

          <button 
            onClick={() => onViewChange('registrar-clases')}
            className={`sub-item ${currentView === 'registrar-clases' ? 'active' : ''}`}
          >
            Clases
          </button>

          <button 
            onClick={() => onViewChange('registrar-asistencia')}
            className={`sub-item ${currentView === 'registrar-asistencia' ? 'active' : ''}`}
          >
            Asistencia
          </button>

          <button 
            onClick={() => onViewChange('registrar-tareas')}
            className={`sub-item ${currentView === 'registrar-tareas' ? 'active' : ''}`}
          >
            Tareas
          </button>

          <button 
            onClick={() => onViewChange('registrar-material')}
            className={`sub-item ${currentView === 'registrar-material  ' ? 'active' : ''}`}
          >
            Material
          </button>

        </div>
      )}
    </div>
  );
}
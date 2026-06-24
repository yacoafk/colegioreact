import React, { useState, useEffect } from 'react';

import '../../../static/Dashboard.css';
import '../../../static/Aside.css';
import '../../../static/global.css';

export function GrupoConsultas({ onViewChange, currentView }) {

  const [openConsultas, setOpenConsultas] = useState(false);

  useEffect(() => {
  if (vistaPerteneceAConsultas) {
    setOpenConsultas(true);
  }
  }, [currentView]);

  const vistaPerteneceAConsultas = [
    'consulta-estudiantes',
    'consulta-padre',
    'consulta-padre-estudiantes',
    'consulta-personal',
    'consulta-cursos',
    'consulta-asistencia',
    'consulta-tareas',
    'consulta-material'
  ].includes(currentView);

  return (
   <div>
      <button 
        onClick={() => setOpenConsultas(!openConsultas)}
        className={`nav-item ${vistaPerteneceAConsultas ? 'active' : ''}`}
      >
        <span>🔍 Consultas</span>
        <span>{openConsultas ? '▼' : '▶'}</span>
      </button>

        {openConsultas && (
        <div className="sub-menu">
          <button 
            onClick={() => onViewChange('consulta-estudiantes')}
            className={`sub-item ${currentView === 'consulta-estudiantes' ? 'active' : ''}`}
          >
            Estudiantes
          </button>

          <button 
            onClick={() => onViewChange('consulta-padre')}
            className={`sub-item ${currentView === 'consulta-padre' ? 'active' : ''}`}
          >
            Padre
          </button>

          <button 
            onClick={() => onViewChange('consulta-padre-estudiantes')}
            className={`sub-item ${currentView === 'consulta-padre-estudiantes' ? 'active' : ''}`}
          >
            Padre y Estudiantes
          </button>

          <button 
            onClick={() => onViewChange('consulta-personal')}
            className={`sub-item ${currentView === 'consulta-personal' ? 'active' : ''}`}
          >
            Personal
          </button>

          <button 
            onClick={() => onViewChange('consulta-asistencia')}
            className={`sub-item ${currentView === 'consulta-asistencia' ? 'active' : ''}`}
          >
            Asistencia
          </button>

          <button 
            onClick={() => onViewChange('consulta-cursos')}
            className={`sub-item ${currentView === 'consulta-cursos' ? 'active' : ''}`}
          >
            Cursos
          </button>

          <button 
            onClick={() => onViewChange('consulta-tareas')}
            className={`sub-item ${currentView === 'consulta-tareas' ? 'active' : ''}`}
          >
            Tareas
          </button>

          <button 
            onClick={() => onViewChange('consulta-material')}
            className={`sub-item ${currentView === 'consulta-material' ? 'active' : ''}`}
          >
            Material
          </button>

        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';

import '../../../static/Dashboard.css';
import '../../../static/Aside.css';
import '../../../static/global.css';
import '../../../static/Password.css';

export function GrupoEstudiante({ onViewChange, currentView }) {
  const [openEstudiante, setOpenEstudiante] = useState(false);

  useEffect(() => {
  if (vistaPerteneceAEstudiante) {
    setOpenEstudiante(true);
  }
  }, [currentView]);

  // ✅ Detecta si estás dentro de una vista del profesor
  const vistaPerteneceAEstudiante = [
    'estudiantes-contrasenia',
    'estudiantes-cursos',

  ].includes(currentView);

  return (
    <div>
      <button 
        onClick={() => setOpenEstudiante(!openEstudiante)}
        className={`nav-item ${vistaPerteneceAEstudiante ? 'active' : ''}`}
      >
        <span>  Control de Estudiante</span>
        <span>{openEstudiante ? '▼' : '▶'}</span>
      </button>

        {openEstudiante && (
        <div className="sub-menu">
          <button 
            onClick={() => onViewChange('estudiantes-cursos')}
            className={`sub-item ${currentView === 'estudiantes-contrasenia' ? 'active' : ''}`}
          >
            Mis Cursos
          </button>
          <button 
            onClick={() => onViewChange('estudiantes-contrasenia')}
            className={`sub-item ${currentView === 'estudiantes-contrasenia' ? 'active' : ''}`}
          >
            Actulizar Contraseña
          </button>


        </div>
      )}
    </div>
  );
}
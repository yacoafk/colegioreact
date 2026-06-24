import React, { useState, useEffect } from 'react';

import '../../../static/Dashboard.css';
import '../../../static/Aside.css';
import '../../../static/global.css';

export function GrupoRegistrar({ onViewChange, currentView }) {
  const [openRegistrar, setOpenRegistrar] = useState(false);

  useEffect(() => {
  if (vistaPerteneceARegistrar) {
    setOpenRegistrar(true);
  }
  }, [currentView]);

  const vistaPerteneceARegistrar = [
    'registrar-tipo-documento',
    'registrar-personal',
    'registrar-roles',
    'registrar-sede',
    'registrar-grados',
    'registrar-cursos',
    'registrar-estudiantes',
    'registrar-padre'
  ].includes(currentView);

  return (
    <div>
      <button 
        onClick={() => setOpenRegistrar(!openRegistrar)}
        className={`nav-item ${vistaPerteneceARegistrar ? 'active' : ''}`}
      >
        <span>📝 Registrar</span>
        <span>{openRegistrar ? '▼' : '▶'}</span>
      </button>

        {openRegistrar && (
        <div className="sub-menu">
          <button 
            onClick={() => onViewChange('registrar-tipo-documento')}
            className={`sub-item ${currentView === 'registrar-tipo-documento' ? 'active' : ''}`}
          >
            Tipo de Documento
          </button>

          <button 
            onClick={() => onViewChange('registrar-personal')}
            className={`sub-item ${currentView === 'registrar-personal' ? 'active' : ''}`}
          >
            Personal
          </button>

          <button 
            onClick={() => onViewChange('registrar-roles')}
            className={`sub-item ${currentView === 'registrar-roles' ? 'active' : ''}`}
          >
            Roles
          </button>

          <button 
            onClick={() => onViewChange('registrar-sede')}
            className={`sub-item ${currentView === 'registrar-sede' ? 'active' : ''}`}
          >
            Sede
          </button>

          <button 
            onClick={() => onViewChange('registrar-grados')}
            className={`sub-item ${currentView === 'registrar-grados' ? 'active' : ''}`}
          >
            Grados
          </button>

          <button 
            onClick={() => onViewChange('registrar-cursos')}
            className={`sub-item ${currentView === 'registrar-cursos' ? 'active' : ''}`}
          >
            Cursos
          </button>

          <button 
            onClick={() => onViewChange('registrar-estudiantes')}
            className={`sub-item ${currentView === 'registrar-estudiantes' ? 'active' : ''}`}
          >
            Estudiantes
          </button>

          <button 
            onClick={() => onViewChange('registrar-padre')}
            className={`sub-item ${currentView === 'registrar-padre' ? 'active' : ''}`}
          >
            Padre
          </button>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';

import '../../static/Aside.css';
import '../../static/global.css';

export function Aside({ onViewChange, currentView }) {
  // Estados para controlar qué menús desplegables están abiertos
  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [openConsultas, setOpenConsultas] = useState(false);

  // Helper para verificar si la vista actual pertenece al grupo de registros
  const vistanPerteneceARegistrar = [
    'registrar-personal', 
    'registrar-sede', 
    'registrar-roles', 
    'registrar-grados', 
    'registrar-estudiantes'
  ].includes(currentView);

  // Helper para verificar si pertenece al grupo de consultas
  const vistaPerteneceAConsultas = [
    'consultar-estudiantes' // Añade aquí más consultas en el futuro (ej. 'consultar-personal')
  ].includes(currentView);

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <h2>Colegio University School</h2>
      </div>
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        
        {/* BOTÓN INICIO */}
        <button 
          onClick={() => onViewChange('funciones')} 
          className={`nav-item ${currentView === 'funciones' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '12px 16px' }}
        >
          🏠 Inicio
        </button>

        {/* ---------------------------------------------------- */}
        {/* GRUPO REGISTRAR */}
        {/* ---------------------------------------------------- */}
        <div>
          <button 
            onClick={() => setOpenRegistrar(!openRegistrar)} 
            className={`nav-item ${vistanPerteneceARegistrar ? 'active' : ''}`}
            style={{ 
              background: 'none', border: 'none', width: '100%', textAlign: 'left', 
              cursor: 'pointer', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}
          >
            <span>📝 Mantenimiento / Registrar</span>
            <span>{openRegistrar || vistanPerteneceARegistrar ? '▼' : '▶'}</span>
          </button>

          {/* Submenú de Registro (Se muestra si está abierto o si estás dentro de una de sus vistas) */}
          {(openRegistrar || vistanPerteneceARegistrar) && (
            <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
              <button 
                onClick={() => onViewChange('registrar-personal')} 
                className={`nav-item sub-item ${currentView === 'registrar-personal' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Personal
              </button>
              <button 
                onClick={() => onViewChange('registrar-sede')} 
                className={`nav-item sub-item ${currentView === 'registrar-sede' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Sede
              </button>
              <button 
                onClick={() => onViewChange('registrar-roles')} 
                className={`nav-item sub-item ${currentView === 'registrar-roles' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Roles
              </button>
              <button 
                onClick={() => onViewChange('registrar-grados')} 
                className={`nav-item sub-item ${currentView === 'registrar-grados' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Grados
              </button>
              <button 
                onClick={() => onViewChange('registrar-estudiantes')} 
                className={`nav-item sub-item ${currentView === 'registrar-estudiantes' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Estudiantes
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* GRUPO CONSULTAS / REPORTES */}
        {/* ---------------------------------------------------- */}
        <div style={{ marginTop: '4px' }}>
          <button 
            onClick={() => setOpenConsultas(!openConsultas)} 
            className={`nav-item ${vistaPerteneceAConsultas ? 'active' : ''}`}
            style={{ 
              background: 'none', border: 'none', width: '100%', textAlign: 'left', 
              cursor: 'pointer', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}
          >
            <span>📊 Consultas / Reportes</span>
            <span>{openConsultas || vistaPerteneceAConsultas ? '▼' : '▶'}</span>
          </button>

          {/* Submenú de Consultas */}
          {(openConsultas || vistaPerteneceAConsultas) && (
            <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
              <button 
                onClick={() => onViewChange('consultar-estudiantes')} 
                className={`nav-item sub-item ${currentView === 'consultar-estudiantes' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 16px', fontSize: '0.9rem' }}
              >
                • Estudiantes por Sección
              </button>
            </div>
          )}
        </div>

      </nav>
    </aside>
  );
}
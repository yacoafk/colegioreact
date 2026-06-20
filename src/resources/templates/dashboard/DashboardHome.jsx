import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aside } from '../fragments/Aside';   
import { Header } from '../fragments/Header'; 
import { PersonalRegistroView } from './registros/PersonalRegistroView'; 
import { SedeRegistroView } from './registros/SedeRegistroView'; 
import { RolRegistroView } from './registros/RolesRegistroView'; 
import { GradosRegistroView } from './registros/GradosRegistroView'; 
import { EstudiantesRegistroView } from './registros/EstudiantesRegistroView'; 
import { EstudiantesConsultaView } from './consulta/EstudiantesConsultaView'; 
import '../../static/Dashboard.css';
import '../../static/global.css';

export function DashboardHome() {
  const [userName, setUserName] = useState('Usuario');
  const [currentView, setCurrentView] = useState('funciones'); 
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      const userData = JSON.parse(session);
      setUserName(`${userData.nombres} ${userData.apellidos}`);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <Aside onViewChange={setCurrentView} currentView={currentView} />

      <div className="dashboard-main-container">
        <Header userName={userName} onLogout={handleLogout} />

        <main className="dashboard-content">
          {currentView === 'funciones' && (
            <>
              <div className="content-header">
                <h3>Mis funciones:</h3>
                <p>Selecciona una función para acceder a sus opciones.</p>
              </div>
              
              <div className="cursos-grid">
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('registrar-personal')}>
                  <div className="curso-card-header"><span className="curso-badge">Configuración</span></div>
                  <div className="curso-card-body"><h4>Registrar Personal</h4></div>
                  <div className="curso-card-footer"><span>Ir al Formulario →</span></div>
                </button>
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('registrar-sede')}>
                  <div className="curso-card-header"><span className="curso-badge">Configuración</span></div>
                  <div className="curso-card-body"><h4>Registrar Sede</h4></div>
                  <div className="curso-card-footer"><span>Ir al Formulario →</span></div>
                </button>
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('registrar-roles')}>
                  <div className="curso-card-header"><span className="curso-badge">Configuración</span></div>
                  <div className="curso-card-body"><h4>Registrar Roles</h4></div>
                  <div className="curso-card-footer"><span>Ir al Formulario →</span></div>
                </button>
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('registrar-estudiantes')}>
                  <div className="curso-card-header"><span className="curso-badge">Configuración</span></div>
                  <div className="curso-card-body"><h4>Registrar Estudiantes</h4></div>
                  <div className="curso-card-footer"><span>Ir al Formulario →</span></div>
                </button>
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('registrar-grados')}>
                  <div className="curso-card-header"><span className="curso-badge">Configuración</span></div>
                  <div className="curso-card-body"><h4>Registrar Grados</h4></div>
                  <div className="curso-card-footer"><span>Ir al Formulario →</span></div>
                </button>
                <button className="curso-card-button" style={{ '--accent-color': 'var(--primary-color)' }} onClick={() => setCurrentView('consulta-estudiantes')}>
                  <div className="curso-card-header"><span className="curso-badge">Consulta</span></div>
                  <div className="curso-card-body"><h4>Consultar Estudiantes</h4></div>
                  <div className="curso-card-footer"><span>Ir a la Consulta →</span></div>
                </button>
              </div>
            </>
          )}

          {currentView === 'registrar-personal' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <PersonalRegistroView />
            </div>
          )}

          {currentView === 'registrar-sede' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <SedeRegistroView />
            </div>
          )}

          {currentView === 'registrar-roles' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <RolRegistroView /> 
            </div>
          )}

          {currentView === 'registrar-estudiantes' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <EstudiantesRegistroView />
            </div>
          )}

          {currentView === 'registrar-grados' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              {/* 🛠️ CORREGIDO: Renderizamos la etiqueta correcta en plural */}
              <GradosRegistroView />
            </div>
          )}

          {currentView === 'consulta-estudiantes' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <EstudiantesConsultaView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
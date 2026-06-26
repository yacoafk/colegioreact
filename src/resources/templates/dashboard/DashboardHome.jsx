import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Aside } from '../fragments/Aside';   
import { Header } from '../fragments/Header'; 

import { PersonalRegistroView } from './registros/PersonalRegistroView'; 
import { SedeRegistroView } from './registros/SedeRegistroView'; 
import { RolRegistroView } from './registros/RolesRegistroView'; 
import { GradosRegistroView } from './registros/GradosRegistroView'; 
import { EstudiantesRegistroView } from './registros/EstudiantesRegistroView'; 
import { CursosRegistroView } from './registros/CursosRegistroView'; 
import { ClasesRegistroView } from './registros/ClasesRegistroView'; 
import { AsistenciaRegistroView } from './registros/AsistenciaRegistroView'; 
import { TareasRegistroView } from './registros/TareasRegistroView'; 
import { TipoDocumentoRegistroView } from './registros/TipoDocumentoRegistroView'; 
import { MaterialRegistroView } from './registros/MaterialRegistroView'; 
import { PadreRegistroView } from './registros/PadreRegistroView'; 

import { EstudiantesConsultaView } from './consulta/EstudiantesConsultaView'; 
import { PadreEstudiantesConsultaView } from './consulta/PadreEstudiantesConsultaView'; 
import { PadreConsultaView } from './consulta/PadreConsultaView'; 
import { PersonalConsultaView } from './consulta/PersonalConsultaView'; 
import { CursosConsultaView } from './consulta/CursosConsultaView'; 
import { AsistenciaConsultaView } from './consulta/AsistenciaConsultaView'; 
import { TareaConsultaView } from './consulta/TareaConsultaView'; 
import { MaterialConsultaView } from './consulta/MaterialConsultaView'; 

import { EstudiantesContraseniaView } from './estudiantes/EstudiantesContraseniaView'; 
import { EstudiantesCursosView } from './estudiantes/EstudiantesCursosView'; 
import { EstudiantesContenidosView } from './estudiantes/EstudiantesContenidosView'; 

import '../../static/Dashboard.css';
import '../../static/global.css';

export function DashboardHome() {
  const [userName, setUserName] = useState('Usuario');
  const [currentView, setCurrentView] = useState('funciones'); 
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
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

          {currentView === 'registrar-cursos' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <CursosRegistroView />
            </div>
          )}

          {currentView === 'registrar-clases' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <ClasesRegistroView />
            </div>
          )}
          {currentView === 'registrar-asistencia' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <AsistenciaRegistroView />
            </div>
          )}

          {currentView === 'registrar-tareas' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <TareasRegistroView />
            </div>
          )}

          {currentView === 'registrar-tipo-documento' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <TipoDocumentoRegistroView />
            </div>
          )}

          {currentView === 'registrar-material' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <MaterialRegistroView />
            </div>
          )}

          {currentView === 'registrar-padre' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <PadreRegistroView />
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


          {currentView === 'consulta-personal' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <PersonalConsultaView />
            </div>
          )}

          {currentView === 'consulta-padre-estudiantes' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <PadreEstudiantesConsultaView />
            </div>
          )}

          {currentView === 'consulta-padre' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <PadreConsultaView />
            </div>
          )}

          {currentView === 'consulta-cursos' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <CursosConsultaView />
            </div>
          )}

          {currentView === 'consulta-asistencia' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <AsistenciaConsultaView />
            </div>
          )}
          {currentView === 'consulta-tareas' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <TareaConsultaView />
            </div>
          )}
          {currentView === 'consulta-material' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <MaterialConsultaView />
            </div>
          )}




          {currentView === 'estudiantes-contrasenia' && (
            <div>
              <button onClick={() => setCurrentView('funciones')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú Principal
              </button>
              <EstudiantesContraseniaView/>
            </div>
          )}

          {/* 📚 LISTA DE CURSOS */}
          {currentView === 'estudiantes-cursos' && (
            <EstudiantesCursosView 
              onSelectCurso={(id) => {
                setCursoSeleccionado(id);
                setCurrentView('estudiantes-contenidos');
              }} 
            />
          )}

          {/* 📂 CONTENIDO DEL CURSO */}
          {currentView === 'estudiantes-contenidos' && (
            <div>
              <EstudiantesContenidosView idCurso={cursoSeleccionado} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

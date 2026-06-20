import '../../static/Header.css';
import '../../static/global.css';

export function Header({ userName, onLogout }) {
  return (
    <header className="dashboard-header">
      <div className="header-title">
        <p>Panel de Control Interno</p>
      </div>
      <div className="header-user-actions">
        <span className="user-name">Hola, <strong>{userName}</strong></span>
        <button className="btn-logout" onClick={onLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="logout-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M19 12H9m10 0-4-4m4 4-4 4" /></svg>
          Salir
        </button>
      </div>
    </header>
  );
}
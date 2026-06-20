import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir tras loguearse
import api from '../../api'; // Importamos tu archivo de configuración de Axios
import '../static/Login.css';

export function Login() {
  // Estados para el formulario
  const [dni, setDni] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  
  // Estados para la interfaz
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función principal para enviar los datos a Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica antes de enviar la petición
    if (!dni || !contrasenia) {
      setError('Por favor, rellene todos los campos.');
      setLoading(false);
      return;
    }

    try {
      // Coincide exactamente con el LoginRequest DTO de tu backend
      const response = await api.post('/auth/login', {
        dni: dni,
        contrasenia: contrasenia
      });

      // Si el backend responde con éxito, guardamos los datos del usuario logueado
      const data = response.data;
      
      // Guardamos la sesión en el almacenamiento del navegador (localStorage)
      localStorage.setItem('user_session', JSON.stringify(data));

      // ¡Inicio de sesión exitoso! Redirigimos al panel principal / intranet
      // Nota: Cambia "/dashboard" por la ruta interna que desees usar más adelante
      navigate('/DashboardHome'); 

    } catch (err) {
      // Capturamos el mensaje de error estructurado por el ResponseEntity de Java
      if (err.response && err.response.data) {
        setError(err.response.data); // Muestra "Usuario no encontrado..." o "Contraseña incorrecta."
      } else {
        setError('No se pudo conectar con el servidor. Inténtelo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Mitad Izquierda: Panel de bienvenida visual */}
      <div className="login-left">
        <div className="brand-wrapper">
          <h1 className="brand-title">Colegio University School</h1>
          <p className="brand-subtitle">Intranet Escolar</p>
        </div>
      </div>

      {/* Mitad Derecha: Formulario de Login */}
      <div className="login-right">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>¡Bienvenido!</h2>
            <p>Por favor, ingresa tus credenciales de acceso.</p>
          </div>

          {/* Banner dinámico de Alerta de Error */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '500',
              border: '1px solid #fca5a5'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Campo DNI */}
            <div className="input-group">
              <label htmlFor="dni">Número de DNI</label>
              <input 
                type="text" 
                id="dni" 
                placeholder="Ingresa tu DNI" 
                maxLength={8}
                autoComplete="username"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} // Solo permite números
              />
            </div>

            {/* Campo Contraseña con Ojito */}
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
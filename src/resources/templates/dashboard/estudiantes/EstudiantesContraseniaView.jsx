import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from '../../../../api'; 

import '../../../static/global.css'; 
import '../../../static/Registrar.css'; 
import '../../../static/Password.css'; 

export function EstudiantesContraseniaView() {
  const userSession = JSON.parse(localStorage.getItem("user"));
  const [passData, setPassData] = useState({
    nuevaContrasenia: '',
    confirmacion: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const validar = {
    length: passData.nuevaContrasenia.length >= 8,
    upper: /[A-Z]/.test(passData.nuevaContrasenia),
    number: /\d/.test(passData.nuevaContrasenia),
  };

  const esValida = validar.length && validar.upper && validar.number;

  const handleUpdatePassword = async () => {
    const userSession = JSON.parse(localStorage.getItem('user_session'));

    if (!userSession?.id) {
      alert("Sesión no válida.");
      return;
    }

    if (!esValida) {
      alert("La contraseña no cumple los requisitos.");
      return;
    }

    if (passData.nuevaContrasenia !== passData.confirmacion) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      await api.put(`estudiantes/actualizar-contrasenia/${userSession.id}`, passData);
      alert("✅ Contraseña actualizada correctamente.");
      setPassData({ nuevaContrasenia: '', confirmacion: '' });
    } catch (err) {
      alert("❌ Error al actualizar.");
    }
  };

  return (
    <div className="password-container">

      <h2>Cambiar Contraseña</h2>

        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={passData.nuevaContrasenia}
            onChange={(e) =>
              setPassData({ ...passData, nuevaContrasenia: e.target.value })
            }
            className="input-custom"
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* VALIDACIONES */}
        <div className="validaciones">
          <p className={validar.length ? "ok" : "error"}>
            • Mínimo 8 caracteres
          </p>
          <p className={validar.upper ? "ok" : "error"}>
            • Al menos una mayúscula
          </p>
          <p className={validar.number ? "ok" : "error"}>
            • Al menos un número
          </p>
        </div>

        {/* CONFIRMAR */}
        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={passData.confirmacion}
            onChange={(e) =>
              setPassData({ ...passData, confirmacion: e.target.value })
            }
            className={`input-custom ${
              passData.confirmacion.length > 0
                ? passData.nuevaContrasenia === passData.confirmacion
                  ? "match"
                  : "no-match"
                : ""
            }`}
          />
        </div>

        <button 
          className="btn-update"
          onClick={handleUpdatePassword} 
          disabled={!esValida}
        >
          Actualizar
        </button>

    </div>
  );
}
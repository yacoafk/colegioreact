import { useState, useEffect } from 'react';

import api from '../../../../api'; 

import '../../../static/global.css'; 
import '../../../static/Dashboard.css'; 

export function EstudiantesConsultaView() {
  const [sedes, setSedes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);

  // Criterios de búsqueda seleccionados por el usuario
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        const [resSedes, resGrados, resEstudiantes] = await Promise.all([
          api.get('sedes'),
          api.get('grados'),
          api.get('estudiantes/todos') // Trae la lista base para filtrar en memoria
        ]);

        setSedes(resSedes.data);
        setGrados(resGrados.data);
        setTodosLosEstudiantes(resEstudiantes.data);

        // Preseleccionar la primera sede si existe
        if (resSedes.data.length > 0) {
          setSelectedSede(resSedes.data[0].idSede);
        }
      } catch (err) {
        console.error("Error al cargar los datos de consulta", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // 2. FILTRADO EN CASCADA: Actualizar Grados cuando cambia la Sede
  useEffect(() => {
    if (selectedSede) {
      const filtrados = grados.filter(g => g.idSede === Number(selectedSede));
      setGradosFiltrados(filtrados);

      // Si hay grados para esta sede, selecciona el primero automáticamente; si no, limpia
      if (filtrados.length > 0) {
        setSelectedGrado(filtrados[0].idGrado);
      } else {
        setSelectedGrado('');
        setEstudiantesFiltrados([]); // No hay grados, por ende no hay estudiantes
      }
    }
  }, [selectedSede, grados]);

  // 3. FILTRADO FINAL: Filtrar alumnos cuando cambia el Grado o la lista maestra
  useEffect(() => {
    if (selectedSede && selectedGrado) {
      const resultado = todosLosEstudiantes.filter(
        e => e.idSede === Number(selectedSede) && e.idGrado === Number(selectedGrado)
      );
      setEstudiantesFiltrados(resultado);
    } else {
      setEstudiantesFiltrados([]);
    }
  }, [selectedSede, selectedGrado, todosLosEstudiantes]);

  return (
  <div className="page-container">

    {/* FILTROS */}
    <div className="card">
      <h3 className="card-title">
        🔍 Consulta de Estudiantes por Secciones
      </h3>

      <div className="form-grid">

        <div className="input-group">
          <label className="input-label">Seleccionar Sede</label>
          <select 
            value={selectedSede}
            onChange={(e) => setSelectedSede(Number(e.target.value))}
            className="select"
          >
            {sedes.map((s) => (
              <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Seleccionar Grado Académico</label>
          <select 
            value={selectedGrado}
            onChange={(e) => setSelectedGrado(Number(e.target.value))}
            disabled={gradosFiltrados.length === 0}
            className="select"
          >
            {gradosFiltrados.map((g) => (
              <option key={g.idGrado} value={g.idGrado}>{g.nombreGrado}</option>
            ))}
          </select>
        </div>

      </div>
    </div>

    {/* TABLA */}
    <div className="card">
      <div className="flex-between">
        <h4 className="section-title">
          Alumnos Asignados 
          <span className="badge">
            {estudiantesFiltrados.length} Total
          </span>
        </h4>
      </div>

      {loading ? (
        <p className="text-center text-muted">
          Cargando información escolar...
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nro Documento</th>
              <th>Nombres y Apellidos</th>
              <th>Sexo</th>
              <th>Pensión (S/.)</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>

          <tbody>
            {estudiantesFiltrados.map((e) => (
              <tr 
                key={e.idEstudiante}
                className={e.estado === 'RETIRADO' ? 'inactive' : ''}
              >
                <td className="text-primary">{e.codigoEstudiante}</td>
                <td>{e.nroDocumento}</td>
                <td>{e.nombres} {e.apellidos}</td>
                <td>{e.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
                <td>S/. {e.montoPension?.toFixed(2)}</td>
                <td className="text-center">
                  <span className={`status ${e.estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                    {e.estado}
                  </span>
                </td>
              </tr>
            ))}

            {estudiantesFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No se encontraron estudiantes matriculados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>

  </div>

  );
}
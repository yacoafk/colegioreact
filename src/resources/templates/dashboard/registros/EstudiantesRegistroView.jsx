import { useState, useEffect } from 'react';
import api from '../../../../api'; 
import '../../../static/global.css'; 
import '../../../static/Registrar.css'; 

export function EstudiantesRegistroView() {
  const [estudiantesList, setEstudiantesList] = useState([]);
  const [sedes, setSedes] = useState([]); 
  const [grados, setGrados] = useState([]); // Lista global de grados traída del backend
  const [gradosFiltrados, setGradosFiltrados] = useState([]); // 💡 NUEVO: Lista filtrada por la sede seleccionada
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    codigoEstudiante: '',
    idTipoDoc: 1, 
    nroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: 'M', 
    idGrado: '',  
    idSede: '',  
    montoPension: 0.00,
    estado: 'ACTIVO',
    // Nuevos campos
    celular: '',
    correo: '',
    direccion: '',
    colegioProcedencia: '',
    tipoAlumno: '',
    recomendacionesMedicas: '',
    tieneInformePsicologico: false,
    tieneCertificadoMedico: false,
    historialClinico: '',
    contactoReferencia: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  // 1. CARGAR DATOS DESDE EL BACKEND
  const listarEstudiantes = async () => {
    try {
      const response = await api.get('estudiantes/todos'); 
      setEstudiantesList(response.data);
    } catch (err) {
      console.error("Error al obtener lista de estudiantes", err);
    }
  };

  const cargarSedes = async () => {
    try {
      const response = await api.get('sedes');
      setSedes(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, idSede: response.data[0].idSede }));
      }
    } catch (err) {
      console.error("Error al cargar sedes", err);
    }
  };

  const cargarGrados = async () => {
    try {
      const response = await api.get('grados'); 
      setGrados(response.data);
    } catch (err) {
      console.error("Error al cargar grados", err);
    }
  };

  useEffect(() => {
    listarEstudiantes();
    cargarSedes(); 
    cargarGrados(); 
  }, []);

  // 💡 NUEVO: Efecto que vigila el cambio de 'idSede' o la lista de 'grados' para actualizar las opciones disponibles
  useEffect(() => {
    if (formData.idSede) {
      // Filtramos la lista maestra de grados basándonos en el idSede actual del formulario
      const filtrados = grados.filter(g => g.idSede === Number(formData.idSede));
      setGradosFiltrados(filtrados);

      // Verificamos si el grado actualmente seleccionado pertenece a la nueva lista filtrada
      const gradoEsValido = filtrados.some(g => g.idGrado === formData.idGrado);

      // Si no es válido (o está vacío) y hay grados disponibles para esa sede, auto-seleccionamos el primero
      if (!gradoEsValido && filtrados.length > 0) {
        setFormData(prev => ({ ...prev, idGrado: filtrados[0].idGrado }));
      } else if (filtrados.length === 0) {
        // Si la sede no tiene ningún grado configurado todavía, limpiamos el campo
        setFormData(prev => ({ ...prev, idGrado: '' }));
      }
    } else {
      setGradosFiltrados([]);
    }
  }, [formData.idSede, grados]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nroDocumento' ) {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else if (name === 'montoPension') {
      setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      const finalValue = ['idTipoDoc', 'idGrado', 'idSede'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value;
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  const dataEnviar = {
    ...formData,
  };

  // 2. PREPARAR EL FORMULARIO PARA EDITAR
  const handleEditClick = (estudiante) => {
    if (estudiante.estado === 'RETIRADO') return; 

    setEditingId(estudiante.idEstudiante); 
    setFormData({
      codigoEstudiante: estudiante.codigoEstudiante,
      idTipoDoc: estudiante.idTipoDoc || 1,
      nroDocumento: estudiante.nroDocumento,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      fechaNacimiento: estudiante.fechaNacimiento, 
      sexo: estudiante.sexo,
      idSede: estudiante.idSede || '',
      idGrado: estudiante.idGrado || '',
      montoPension: estudiante.montoPension,
      estado: estudiante.estado,
      // Mapeo de nuevos campos
      celular: estudiante.celular || '',
      correo: estudiante.correo || '',
      direccion: estudiante.direccion || '',
      colegioProcedencia: estudiante.colegioProcedencia || '',
      tipoAlumno: estudiante.tipoAlumno || '',
      recomendacionesMedicas: estudiante.recomendacionesMedicas || '',
      tieneInformePsicologico: estudiante.tieneInformePsicologico === true,
      tieneCertificadoMedico: estudiante.tieneCertificadoMedico === true,
      historialClinico: estudiante.historialClinico || '',
      contactoReferencia: estudiante.contactoReferencia || ''
    });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setFormData({
      codigoEstudiante: '',
      idTipoDoc: 1,
      nroDocumento: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      sexo: 'M',
      idSede: sedes[0]?.idSede || '',
      idGrado: '',
      montoPension: 0.00,
      estado: 'ACTIVO',
      celular: '',
      correo: '',
      direccion: '',
      colegioProcedencia: '',
      tipoAlumno: '',
      recomendacionesMedicas: '',
      tieneInformePsicologico: false,
      tieneCertificadoMedico: false,
      historialClinico: '',
      contactoReferencia: ''
    });
    setMensaje({ texto: '', tipo: '' });
  };

  // 3. MANEJAR EL PROCESO DE GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    if (
      !formData.codigoEstudiante ||
      !formData.nroDocumento ||
      !formData.nombres ||
      !formData.apellidos ||
      !formData.fechaNacimiento ||
      formData.idGrado === '' ||
      formData.idSede === ''
    ) {
      setMensaje({ texto: 'Por favor, rellena todos los campos obligatorios y asegúrate de asignar un grado válido.', tipo: 'error' });
      setLoading(false);
      return;
    }

    try {
      let response;

      if (editingId) {
        // EDITAR
        response = await api.put(`estudiantes/modificar/${editingId}`, dataEnviar);
      } else {
        // REGISTRAR
        response = await api.post('estudiantes/registrar', dataEnviar);
      }

      setMensaje({ texto: 'Guardado correctamente', tipo: 'success' });

      listarEstudiantes();
      cancelarEdicion();
      setShowModal(false);

    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
      setMensaje({ texto: 'Error al guardar', tipo: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarLogico = async (id, nombres) => {
    if (window.confirm(`¿Estás seguro de que deseas retirar al estudiante ${nombres}? Su estado cambiará a RETIRADO.`)) {
      try {
        await api.delete(`estudiantes/eliminar/${id}`);
        setMensaje({ texto: `El estudiante ${nombres} ha sido marcado como RETIRADO.`, tipo: 'success' });
        listarEstudiantes(); 
      } catch (err) {
        setMensaje({ texto: 'Error al dar de baja al estudiante.', tipo: 'error' });
      }
    }
  };

  return (
    <div className="page-container">

      {/* Colócalo antes de la tabla */}
      <button 
        className="btn-primary" 
        onClick={() => {
          cancelarEdicion(); // Limpia el formulario
          setShowModal(true);
        }}
        style={{ marginBottom: '20px' }}
      >
        + Nuevo Estudiante
      </button>

      <table className="table">
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Sede</th>
          <th>Grado</th>
          <th>Modalidad</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {estudiantesList.length > 0 ? (
          estudiantesList.map((est) => (
            <tr key={est.idEstudiante}>
              <td>{est.nroDocumento}</td>
              <td>{est.nombres}</td>
              <td>{est.apellidos}</td>
              <td>
                {sedes.find(s => s.idSede === est.idSede)?.nombre || "N/A"}
              </td>

              <td>
                {grados.find(g => g.idGrado === est.idGrado)?.nombreGrado || "N/A"}
              </td>
              <td>{est.tipoAlumno || "Presencial"}</td>
              <td>
                <span className={est.estado === "ACTIVO" ? "badge-activo" : "badge-inactivo"}>
                  {est.estado}
                </span>
              </td>
              <td>
                {est.estado !== 'RETIRADO' ? (
                  <>
                    <button 
                      className="btn-edit" 
                      onClick={() => {
                        handleEditClick(est);
                        setShowModal(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleEliminarLogico(est.idEstudiante, est.nombres)}
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Sin acciones
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8">No hay estudiantes</td>
          </tr>
        )}
      </tbody>
    </table>

    {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="flex-between">
        <h3>
          {editingId ? 'Editar Estudiante' : 'Registrar Estudiante'}
        </h3>

        <button onClick={() => setShowModal(false)}>X</button>
      </div>

        <form onSubmit={async (e) => {

          const ok = await handleSubmit(e); 

          if (ok) {
            setShowModal(false);
          }
        }} className="form-grid">
        
          <div className="input-group">
            <label className="input-label">Código Alumno</label>
            <input 
              className="input"
              type="text"
              name="codigoEstudiante"
              value={formData.codigoEstudiante}
              onChange={handleChange}
              placeholder="Ej. EST2026"
            />
          </div>

          <div className="input-group">
            <label className="input-label">DNI</label>
            <input 
              className="input"
              type="text"
              name="nroDocumento"
              maxLength={8}
              value={formData.nroDocumento}
              onChange={handleChange}
              placeholder="Ej. 74859612"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nombres</label>
            <input 
              className="input"
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Apellidos</label>
            <input 
              className="input"
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Fecha de Nacimiento</label>
            <input 
              className="input"
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Sexo</label>
            <select 
              className="select"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Sede</label>
            <select 
              className="select"
              name="idSede"
              value={formData.idSede}
              onChange={handleChange}
            >
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Grado Académico</label>
            <select 
              className="select"
              name="idGrado"
              value={formData.idGrado}
              onChange={handleChange}
            >
              {gradosFiltrados.map((g) => (
                <option key={g.idGrado} value={g.idGrado}>
                  {g.nombreGrado}
                </option>
              ))}

              {gradosFiltrados.length === 0 && (
                <option value="">⚠️ Sin grados en esta sede</option>
              )}
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Monto Pensión (S/.)</label>
            <input 
              className="input"
              type="number"
              step="0.01"
              name="montoPension"
              value={formData.montoPension}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          {/* Nuevos Campos */}
          <div className="input-group">
            <label className="input-label">Celular</label>
            <input className="input" type="text" name="celular" value={formData.celular} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Correo</label>
            <input className="input" type="email" name="correo" value={formData.correo} onChange={handleChange} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Dirección</label>
            <input className="input" type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Colegio Procedencia</label>
            <input className="input" type="text" name="colegioProcedencia" value={formData.colegioProcedencia} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Tipo Alumno</label>
            <input className="input" type="text" name="tipoAlumno" value={formData.tipoAlumno} onChange={handleChange} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Recomendaciones Médicas</label>
            <textarea className="input" name="recomendacionesMedicas" value={formData.recomendacionesMedicas} onChange={handleChange} />
          </div>

          {/* Checkboxes para booleanos */}
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <label className="input-label">
              <input type="checkbox" name="tieneInformePsicologico" checked={formData.tieneInformePsicologico} onChange={(e) => setFormData({...formData, tieneInformePsicologico: e.target.checked})} />
              Informe Psicológico
            </label>
            <label className="input-label">
              <input type="checkbox" name="tieneCertificadoMedico" checked={formData.tieneCertificadoMedico} onChange={(e) => setFormData({...formData, tieneCertificadoMedico: e.target.checked})} />
              Certificado Médico
            </label>
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Historial Clínico</label>
            <textarea className="input" name="historialClinico" value={formData.historialClinico} onChange={handleChange} />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Contacto Referencia</label>
            <input className="input" type="text" name="contactoReferencia" value={formData.contactoReferencia} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || gradosFiltrados.length === 0}
            >
              {loading 
                ? 'Procesando...' 
                : editingId 
                  ? 'Guardar Cambios' 
                  : 'Registrar Estudiante'}
            </button>

            {editingId && (
              <button 
                type="button" 
                onClick={() => {
                  cancelarEdicion();
                  setShowModal(false); 
                }}
                className="btn-primary"
                style={{ marginLeft: '10px', background: '#64748b' }}
              >
                Cancelar
              </button>
            )}
          </div>

        </form>
    </div>
  </div>
)}

    </div>
  );
}
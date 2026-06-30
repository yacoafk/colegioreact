import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from '../../../../api'; 

import '../../../static/Dashboard.css';
import '../../../static/Registrar.css'; 
import '../../../static/global.css'; 
import '../../../static/Contenido.css'; 
import '../../../static/Detalles.css'; 

export function EstudiantesDetallesView({ tipo, data, onBack }) {

  if (!data) return <div>No hay datos</div>;

  return (
    <div className="page-container2">
      <button onClick={onBack} className="btn-back">
        ← Volver al curso
      </button>

      {tipo === "material" && (
        <>
          <h2>📄 {data.titulo}</h2>
          <p>{data.descripcion}</p>
          {data.urlArchivo && (
            <a href={data.urlArchivo} target="_blank" rel="noreferrer">📥 Ver / Descargar archivo</a>
          )}
          <div className="meta-info">📅 Publicado el: {data.fechaPublicacion}</div>
        </>
      )}

      {tipo === "tarea" && (
        <>
          <h2>📝 {data.titulo}</h2>
          <p>{data.descripcion}</p>
          {data.urlArchivoAdjunto && (
            <a href={data.urlArchivoAdjunto} target="_blank" rel="noreferrer">📎 Ver archivo adjunto</a>
          )}
          <div className="meta-info">
            <p>📅 Inicio: {data.fechaInicio}</p>
            <p>⏳ Fin: {data.fechaTermino}</p>
          </div>
        </>
      )}
    </div>
  );
}
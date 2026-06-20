import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // 👈 Asegúrate de que diga Route aquí
import api from './api';

import { Login } from "./resources/templates/Login";
import { DashboardHome } from "./resources/templates/dashboard/DashboardHome"; // Importamos el nuevo componente DashboardHome

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 👈 Cambiado de CustomRoute a Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 👈 Cambiado de CustomRoute a Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/DashboardHome" element={<DashboardHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
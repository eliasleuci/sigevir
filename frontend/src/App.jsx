import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contextos
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Componentes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/common/MainLayout.jsx';

// Páginas
import Login from './pages/Login.jsx';
import PasswordRecovery from './pages/PasswordRecovery.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NuevaRetencion from './pages/NuevaRetencion.jsx';
import ConfirmarIngreso from './pages/deposito/ConfirmarIngreso.jsx';
import RegistrarEgreso from './pages/deposito/RegistrarEgreso.jsx';
import GestionCausas from './pages/judicial/GestionCausas.jsx';
import Busqueda from './pages/Busqueda.jsx';
import Administracion from './pages/Administracion.jsx';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/recovery" element={<PasswordRecovery />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Rutas Privadas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/retenciones/nueva" element={<NuevaRetencion />} />
                <Route path="/deposito/ingreso" element={<ConfirmarIngreso />} />
                <Route path="/deposito/egreso" element={<RegistrarEgreso />} />
                <Route path="/judicial/causas" element={<GestionCausas />} />
                <Route path="/busqueda" element={<Busqueda />} />
                <Route path="/admin" element={<Administracion />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" theme="colored" />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

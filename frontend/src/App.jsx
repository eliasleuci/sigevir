import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/common/MainLayout.jsx';

import Login from './pages/Login.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AuthCallbackPage from './pages/AuthCallbackPage.jsx';
import PasswordRecovery from './pages/PasswordRecovery.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NuevaRetencion from './pages/NuevaRetencion.jsx';
import ConfirmarIngreso from './pages/deposito/ConfirmarIngreso.jsx';
import RegistrarEgreso from './pages/deposito/RegistrarEgreso.jsx';
import GestionCausas from './pages/judicial/GestionCausas.jsx';
import Busqueda from './pages/Busqueda.jsx';
import Administracion from './pages/Administracion.jsx';
import Reportes from './pages/Reportes.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

const ROLES_ADMIN = ['admin'];
const ROLES_RETENCION = ['admin', 'agente_campo'];
const ROLES_DEPOSITO = ['admin', 'deposito'];
const ROLES_JUDICIAL = ['admin', 'fiscal_juez'];
const ROLES_BUSQUEDA = ['admin', 'agente_campo', 'fiscal_juez', 'deposito'];

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/recovery" element={<PasswordRecovery />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/retenciones/nueva" element={
                  <ProtectedRoute allowedRoles={ROLES_RETENCION}><NuevaRetencion /></ProtectedRoute>
                } />
                <Route path="/deposito/ingreso" element={
                  <ProtectedRoute allowedRoles={ROLES_DEPOSITO}><ConfirmarIngreso /></ProtectedRoute>
                } />
                <Route path="/deposito/egreso" element={
                  <ProtectedRoute allowedRoles={ROLES_DEPOSITO}><RegistrarEgreso /></ProtectedRoute>
                } />
                <Route path="/judicial/causas" element={
                  <ProtectedRoute allowedRoles={ROLES_JUDICIAL}><GestionCausas /></ProtectedRoute>
                } />
                <Route path="/busqueda" element={
                  <ProtectedRoute allowedRoles={ROLES_BUSQUEDA}><Busqueda /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={ROLES_ADMIN}><Administracion /></ProtectedRoute>
                } />
                <Route path="/reportes" element={
                  <ProtectedRoute allowedRoles={['admin']}><Reportes /></ProtectedRoute>
                } />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" theme="colored" />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

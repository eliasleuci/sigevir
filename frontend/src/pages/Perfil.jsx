import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { toast } from 'react-hot-toast';
import FotoPerfilUploader from '../components/common/FotoPerfilUploader';
import DocumentoIdentidadUploader from '../components/common/DocumentoIdentidadUploader';

export const Perfil = () => {
  const { perfil, actualizarPerfil, cambiarPassword, hasPassword } = useAuth();
  const location = useLocation();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Estados para sección de contraseña ──────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    cuit_cuil: '',
    telefono: '',
    direccion: '',
    estado_civil: '',
    cargo: '',
    institucion: '',
    jurisdiccion: ''
  });

  // Cargar datos cuando el perfil esté disponible
  useEffect(() => {
    if (perfil) {
      setFormData({
        nombre_completo: perfil.nombre_completo || '',
        dni: perfil.dni || '',
        cuit_cuil: perfil.cuit_cuil || '',
        telefono: perfil.telefono || '',
        direccion: perfil.direccion || '',
        estado_civil: perfil.estado_civil || '',
        cargo: perfil.cargo || '',
        institucion: perfil.institucion || '',
        jurisdiccion: perfil.jurisdiccion || ''
      });
    }
  }, [perfil]);

  useEffect(() => {
    if (location.state?.alert === 'verification_required') {
      toast.error('Debes tener tu documento verificado para acceder al resto del sistema.', { id: 'doc-verify' });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await actualizarPerfil(formData);
      if (result.success) {
        toast.success('Perfil actualizado correctamente');
      } else {
        toast.error('Error: ' + result.error);
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler para cambio de contraseña ───────────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword) {
      errors.newPassword = 'Ingresá una contraseña';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Debe contener al menos una letra mayúscula';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Debe contener al menos un número';
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errors.newPassword = 'Debe contener al menos un carácter especial (!@#$%)';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmá la contraseña';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      const result = await cambiarPassword(passwordData.newPassword);
      if (result.success) {
        toast.success(hasPassword ? 'Contraseña actualizada correctamente' : '¡Contraseña establecida! Ahora podés ingresar con email y contraseña.');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      } else {
        toast.error(result.error || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper: calcular fortaleza de la contraseña
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;

    if (score <= 1) return { level: 1, label: 'Muy débil', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Débil', color: 'bg-orange-500' };
    if (score === 3) return { level: 3, label: 'Aceptable', color: 'bg-yellow-500' };
    if (score === 4) return { level: 4, label: 'Fuerte', color: 'bg-green-500' };
    return { level: 5, label: 'Muy fuerte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      
      {perfil && !perfil.documentos_verificados && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5 flex gap-4 items-start shadow-sm">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-red-800">Acceso Restringido</h3>
            <p className="text-sm text-red-700 mt-1">
              Tu cuenta aún no está verificada por completo. Para poder operar en el sistema, es obligatorio subir una foto de tu documento de identidad (DNI, Pasaporte o Carnet) y esperar a que un administrador lo apruebe.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Perfil</h1>
        <p className="text-gray-500 mt-2">Gestioná tu información personal y datos laborales.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel Lateral: Foto, Documento y Resumen */}
        <div className="lg:w-1/3 space-y-4">
          {/* Foto de perfil: foto real + AvatarPicker conviven */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center sticky top-6">
            {/* Subida de foto REAL */}
            <FotoPerfilUploader />

            {/* Opción clásica de avatar de galería — no se elimina */}
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-2 text-xs text-gray-400 hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              O elegir avatar de galería
            </button>

            <h2 className="text-xl font-bold text-gray-900 mt-4">{perfil?.nombre_completo || 'Usuario'}</h2>
            <p className="text-sm text-gray-500 font-medium">{perfil?.rol ? perfil.rol.replace('_', ' ').toUpperCase() : 'AGENTE'}</p>

            <div className="w-full mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium truncate max-w-[160px]" title={perfil?.email}>{perfil?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Estado</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Activo</span>
              </div>
              {/* Badge de verificación de documentos */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Documentos</span>
                {perfil?.documentos_verificados ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">✓ Verificados</span>
                ) : perfil?.documento_identidad_url ? (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">⏳ Pendiente</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-md text-xs font-bold">Sin cargar</span>
                )}
              </div>
            </div>
          </div>

          {/* Carga de documento de identidad */}
          <DocumentoIdentidadUploader />
        </div>

        {/* Panel Principal: Formulario */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            
            {/* SECCIÓN: Datos Personales */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Datos Personales
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Sin puntos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CUIT / CUIL</label>
                  <input
                    type="text"
                    name="cuit_cuil"
                    value={formData.cuit_cuil}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: 20-12345678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: +54 9 11 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                    <option value="Concubinato">Concubinato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Dónde vive)</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Calle, Número, Piso, Ciudad, Provincia"
                  />
                </div>
              </div>
            </div>

            {/* Divisor */}
            <hr className="border-gray-100 my-8" />

            {/* SECCIÓN: Datos Laborales */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Datos Laborales
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: Inspector General"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución / Sede</label>
                  <input
                    type="text"
                    name="institucion"
                    value={formData.institucion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: Ministerio de Seguridad"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdicción</label>
                  <input
                    type="text"
                    name="jurisdiccion"
                    value={formData.jurisdiccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej: Juzgado de Faltas N° 2, Policía Departamental, etc."
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  if (perfil) {
                    setFormData({
                      nombre_completo: perfil.nombre_completo || '',
                      dni: perfil.dni || '',
                      cuit_cuil: perfil.cuit_cuil || '',
                      telefono: perfil.telefono || '',
                      direccion: perfil.direccion || '',
                      estado_civil: perfil.estado_civil || '',
                      cargo: perfil.cargo || '',
                      institucion: perfil.institucion || '',
                      jurisdiccion: perfil.jurisdiccion || ''
                    });
                  }
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
                disabled={loading}
              >
                Descartar Cambios
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/*  SECCIÓN: Seguridad - Contraseña                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seguridad
            </h3>
            <p className="text-sm text-gray-500 mb-6">Gestioná tu contraseña de acceso al sistema.</p>

            {/* Aviso para usuarios que se registraron con Google */}
            {!hasPassword && (
              <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">No tenés una contraseña configurada</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Te registraste con Google y no tenés una contraseña manual.
                    Establecé una para poder ingresar también con <strong>email y contraseña</strong> directamente.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nueva Contraseña */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {hasPassword ? 'Nueva Contraseña' : 'Establecer Contraseña'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2.5 pr-11 border ${
                      passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:ring-2 outline-none transition-all`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">{passwordErrors.newPassword}</p>
                )}

                {/* Barra de fortaleza */}
                {passwordData.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`flex-1 h-full rounded-full transition-all duration-300 ${
                              i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-semibold min-w-[70px] text-right ${
                        passwordStrength.level <= 2 ? 'text-red-600' : passwordStrength.level <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-0.5 pl-1">
                      <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Al menos una mayúscula
                      </li>
                      <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} Al menos un número
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[^A-Za-z0-9]/.test(passwordData.newPassword) ? '✓' : '○'} Al menos un carácter especial (!@#$%)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2.5 pr-11 border ${
                      passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg focus:ring-2 outline-none transition-all`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">{passwordErrors.confirmPassword}</p>
                )}
                {/* Indicador de coincidencia */}
                {passwordData.confirmPassword && !passwordErrors.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                  <p className="mt-1.5 text-sm text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Las contraseñas coinciden
                  </p>
                )}
              </div>
            </div>

            {/* Botón guardar contraseña */}
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-70"
                disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {passwordLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {hasPassword ? 'Actualizando...' : 'Estableciendo...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPicker && <AvatarPicker onClose={() => setShowPicker(false)} />}
    </div>
  );
};

export default Perfil;

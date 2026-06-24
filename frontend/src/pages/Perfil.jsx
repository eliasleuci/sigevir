import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { toast } from 'react-hot-toast';

export const Perfil = () => {
  const { perfil, actualizarPerfil } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Perfil</h1>
        <p className="text-gray-500 mt-2">Gestioná tu información personal y datos laborales.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel Lateral: Avatar y Resumen */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center sticky top-6">
            <div className="relative mb-4 group">
              {perfil?.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {(perfil?.nombre_completo?.charAt(0) || 'U').toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setShowPicker(true)}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
                title="Cambiar avatar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{perfil?.nombre_completo || 'Usuario'}</h2>
            <p className="text-sm text-gray-500 font-medium">{perfil?.rol ? perfil.rol.replace('_', ' ').toUpperCase() : 'AGENTE'}</p>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium">{perfil?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Estado</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Activo</span>
              </div>
            </div>
          </div>
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
        </div>
      </div>

      {showPicker && <AvatarPicker onClose={() => setShowPicker(false)} />}
    </div>
  );
};

export default Perfil;

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AvatarPicker } from '../components/common/AvatarPicker';

/**
 * Página de perfil del usuario.
 * Muestra datos básicos y permite cambiar el avatar mediante AvatarPicker.
 */
export const Perfil = () => {
  const { perfil } = useAuth(); // contiene avatar_url, nombre, email, etc.
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      <div className="flex items-center gap-6">
        {perfil?.avatar_url ? (
          <img
            src={perfil.avatar_url}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-2xl text-blue-700 font-bold">
            {(perfil?.nombre_completo?.charAt(0) || 'U')}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold">{perfil?.nombre_completo || perfil?.email}</p>
          <p className="text-sm text-gray-600">{perfil?.email}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setShowPicker(true)}
          >
            Cambiar Avatar
          </button>
        </div>
      </div>

      {showPicker && <AvatarPicker onClose={() => setShowPicker(false)} />}
    </div>
  );
};

export default Perfil;

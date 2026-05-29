import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { toast } from 'react-toastify';

/**
 * AvatarPicker – muestra una cuadrícula de avatares y permite seleccionar uno.
 * Al confirmar, actualiza `perfiles.avatar_url` del usuario actual.
 */
export const AvatarPicker = ({ onClose }) => {
  const { cargarPerfil } = useAuth();
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
  ];

  const [selected, setSelected] = useState(null);

  const saveAvatar = async () => {
    if (!selected) {
      toast.error('Seleccioná un avatar');
      return;
    }
    try {
      const user = supabase.auth.getUser();
      const { data: { user: supUser } } = await user;
      const { error } = await supabase
        .from('perfiles')
        .update({ avatar_url: selected })
        .eq('id', supUser.id);
      if (error) throw error;
      // Refresh perfil in context after successful update
      cargarPerfil && cargarPerfil(supUser.id);
      toast.success('Avatar actualizado');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar avatar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Seleccioná tu avatar</h2>
        <div className="grid grid-cols-4 gap-3">
          {avatars.map((url) => (
            <img
              key={url}
              src={url}
              alt="avatar"
              className={`w-16 h-16 rounded-full cursor-pointer border-2 ${selected === url ? 'border-blue-600' : 'border-transparent'}`}
              onClick={() => setSelected(url)}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveAvatar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

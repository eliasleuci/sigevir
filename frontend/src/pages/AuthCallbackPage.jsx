import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_READY } from '../config/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Procesando autenticación...');

  useEffect(() => {
    const handleCallback = async () => {
      if (!SUPABASE_READY) {
        setStatus('Supabase no configurado');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          setStatus('Autenticación exitosa. Redirigiendo...');
          navigate('/dashboard', { replace: true });
        } else {
          setStatus('No se pudo verificar la sesión');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } catch (err) {
        setStatus('Error en la autenticación');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6">
          <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Verificando sesión</h2>
        <p className="text-sm text-gray-500">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthButton = () => {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Asegurarse de que el script de Google esté cargado en index.html
    // <script src="https://accounts.google.com/gsi/client" async defer></script>
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_CLIENT_ID_AQUI',
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
      );
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    const res = await loginGoogle(response.credential);
    if (res.success) {
      toast.success('Sesión iniciada con Google');
      navigate('/dashboard');
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div id="google-btn" className="w-full mt-4 flex justify-center"></div>
  );
};

export default GoogleOAuthButton;

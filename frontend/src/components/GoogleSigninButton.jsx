import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GoogleSigninButton = () => {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse) => {
    const res = await loginGoogle(credentialResponse.credential);
    if (res.success) {
      toast.success('Sesión iniciada con Google');
      navigate('/dashboard');
    } else {
      toast.error(res.error || 'Error al autenticar con Google');
    }
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => toast.error('Error en autenticación con Google')}
        theme="outline"
        size="large"
        width="400"
        text="continue_with"
      />
    </div>
  );
};

export default GoogleSigninButton;

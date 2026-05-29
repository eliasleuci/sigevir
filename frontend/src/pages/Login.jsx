import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const { login, loginWithGoogle, supabaseReady } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        if (result.pendingApproval) {
          toast.info('Tu cuenta está pendiente de aprobación por el administrador.');
          navigate('/pending');
        } else {
          toast.success('Sesion iniciada correctamente');
          navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Error al iniciar sesion');
      }
    } catch (error) {
      toast.error('Error inesperado al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabaseReady) {
      toast.error('Google requiere Supabase. Configurá las variables en frontend/.env');
      return;
    }
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        toast.error(result.error || 'Error al iniciar con Google');
        setGoogleLoading(false);
      }
      // Si success, el navegador redirige a Google; no resetear loading
    } catch (error) {
      toast.error('Error al iniciar con Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-2xl sm:rounded-3xl sm:border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
          <div className="sm:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-10 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[200px] md:min-h-[250px]">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            <img src="/icono-de-la-app.jpeg" alt="SIGEVIR" className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-2xl object-cover mb-6 relative z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white relative z-10">SIGEVIR</h2>
            <p className="text-blue-200 text-center text-sm mt-2 relative z-10 max-w-xs">Sistema Integral de Gestion de Vehiculos Retenidos</p>
          </div>
          <div className="sm:w-3/5 p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesion</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para acceder al sistema</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Correo Electronico</label>
                <div className="mt-1 relative">
                  <input {...register('email')} type="email" className={'appearance-none block w-full px-3 py-2.5 border ' + (errors.email ? 'border-red-300' : 'border-gray-300') + ' rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all'} placeholder="ejemplo@institucion.gov.ar" />
                  {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Contrasena</label>
                <div className="mt-1 relative">
                  <input {...register('password')} type="password" className={'appearance-none block w-full px-3 py-2.5 border ' + (errors.password ? 'border-red-300' : 'border-gray-300') + ' rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all'} placeholder="********" />
                  {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Recordarme</label>
                </div>
                <div className="text-sm">
                  <Link to="/recovery" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">¿Olvidaste tu contrasena?</Link>
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]">
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </span>
                  ) : 'Iniciar Sesion'}
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500 font-medium">O continuar con</span></div>
              </div>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {googleLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {googleLoading ? 'Conectando...' : 'Continuar con correo institucional (Google)'}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              ¿No tenes cuenta?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Registrarse</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

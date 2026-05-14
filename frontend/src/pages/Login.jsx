import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';
import GoogleSigninButton from '../components/GoogleSigninButton';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, accessToken: token } = response.data.data || response.data;
      login(user, token);
      toast.success('Sesión iniciada correctamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-2xl sm:rounded-3xl sm:border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
          
          {/* Panel Izquierdo - Decorativo con icono */}
          <div className="sm:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-10 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[200px] md:min-h-[250px]">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            <img src="/icono-de-la-app.jpeg" alt="SIGEVIR" className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-2xl object-cover mb-6 relative z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white relative z-10">SIGEVIR</h2>
            <p className="text-blue-200 text-center text-sm mt-2 relative z-10 max-w-xs">
              Sistema Integral de Gestión de Vehículos Retenidos
            </p>
          </div>
          
          {/* Panel Derecho - Formulario */}
          <div className="sm:w-3/5 p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para acceder al sistema</p>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                <div className="mt-1 relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={`appearance-none block w-full px-3 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all`}
                    placeholder="ejemplo@institucion.gov.ar"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                <div className="mt-1 relative">
                  <input
                    {...register('password')}
                    type="password"
                    className={`appearance-none block w-full px-3 py-2.5 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/recovery" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </span>
                  ) : 'Iniciar Sesión'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">O continuar con</span>
                </div>
              </div>
              
              <div className="mt-6">
                <GoogleSigninButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

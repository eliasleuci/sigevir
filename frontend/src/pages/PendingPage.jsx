import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase, SUPABASE_READY } from '../config/supabase';
import { toast } from 'react-toastify';

const PendingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleRefresh = async () => {
    if (!SUPABASE_READY || !supabase || !user?.id) return;
    try {
      const { data } = await supabase
        .from('perfiles')
        .select('tipo_personal_id, activo, rol')
        .eq('id', user.id)
        .single();

      if (data?.tipo_personal_id && data?.activo) {
        toast.success('¡Tu cuenta fue aprobada! Ingresando...');
        navigate('/dashboard', { replace: true });
      } else {
        toast.info('Tu cuenta aún está en revisión. Intentá más tarde.');
      }
    } catch {
      toast.error('Error al verificar el estado de tu cuenta.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">

        {/* Ícono animado */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-[28px] bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-xl shadow-amber-100">
            <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
        </div>

        {/* Logo SIGEVIR */}
        <p className="text-xs font-black tracking-[0.3em] text-blue-400 uppercase mb-2">SIGEVIR</p>

        {/* Título */}
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
          Solicitud pendiente
        </h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">
          Tu cuenta fue registrada correctamente, pero aún no fue aprobada por el administrador del sistema.
          Recibirás acceso una vez que tu solicitud sea revisada y aprobada.
        </p>

        {/* Info del usuario */}
        {user?.email && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cuenta registrada</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-black text-blue-600">
                  {(user.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{user.user_metadata?.nombre_completo || user.email}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 text-left">
          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
          <p className="text-sm text-amber-700 font-semibold">
            Estado: <span className="font-black">En revisión</span>
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Verificar estado de aprobación
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Si tenés dudas, contactá al administrador del sistema SIGEVIR.
        </p>
      </div>
    </div>
  );
};

export default PendingPage;

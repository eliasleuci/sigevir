import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROLE_COLORS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '../utils/constants';
import { getTiposPersonal } from '../config/supabase';

const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'Nombre requerido'),
  dni: z.string().min(6, 'DNI inválido').max(9, 'DNI inválido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(7, 'Teléfono inválido').optional().or(z.literal('')),
  institucion: z.string().min(2, 'Institución requerida'),
  jurisdiccion: z.string().optional().or(z.literal('')),
  cargo: z.string().optional().or(z.literal('')),
  tipo_personal_id: z.string().min(1, 'Seleccioná un tipo de personal'),
  password: passwordSchema,
  confirmar_password: z.string(),
}).refine((data) => data.password === data.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
});

const steps = [
  { id: 1, label: 'Datos Personales' },
  { id: 2, label: 'Institución' },
  { id: 3, label: 'Personal y Acceso' },
];

const PasswordIndicator = ({ value }) => {
  const checks = [
    { label: 'Mínimo 8 caracteres', pass: value.length >= 8 },
    { label: 'Al menos una mayúscula', pass: /[A-Z]/.test(value) },
    { label: 'Al menos un número', pass: /[0-9]/.test(value) },
  ];
  return (
    <div className="mt-2 space-y-1.5">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
            check.pass ? `bg-emerald-500` : `bg-gray-200`
          }`}>
            {check.pass ? (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className={check.pass ? 'text-emerald-700 font-medium' : 'text-gray-400'}>{check.label}</span>
        </div>
      ))}
    </div>
  );
};

const RolePreview = ({ tipoPersonalId, tiposPersonal }) => {
  if (!tipoPersonalId) return null;
  const tipo = tiposPersonal.find(t => t.id === tipoPersonalId || t.id === Number(tipoPersonalId));
  if (!tipo) return null;
  const color = ROLE_COLORS[tipo.rol];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color.bg} ${color.border} border rounded-2xl p-5 mt-4`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
          <div className={`w-3 h-3 rounded-full ${color.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wider ${color.text}`}>Rol asignado</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color.bg} ${color.text} border ${color.border}`}>
              {ROLES[tipo.rol]}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ROLE_DESCRIPTIONS[tipo.rol]}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ROLE_PERMISSIONS[tipo.rol].slice(0, 4).map((perm) => (
              <span key={perm} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-white/60 px-2 py-1 rounded-lg border border-gray-100">
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {perm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [tiposPersonal, setTiposPersonal] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    const fetchTipos = async () => {
      const { data } = await getTiposPersonal();
      if (data) setTiposPersonal(data);
      setLoadingTipos(false);
    };
    fetchTipos();
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid, dirtyFields } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      nombre_completo: '',
      dni: '',
      email: '',
      telefono: '',
      institucion: '',
      jurisdiccion: '',
      cargo: '',
      tipo_personal_id: '',
      password: '',
      confirmar_password: '',
    },
  });

  const values = watch();
  const selectedTipoId = watch('tipo_personal_id');

  const canAdvance = () => {
    if (step === 1) return values.nombre_completo?.length >= 3 && values.dni?.length >= 6 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || '');
    if (step === 2) return values.institucion?.length >= 2;
    if (step === 3) {
      try { return registerSchema.parse(values); } catch { return false; }
    }
    return false;
  };

  const nextStep = () => { if (canAdvance() && step < 3) setStep(s => s + 1); };
  const prevStep = () => { if (step > 1) setStep(s => s - 1); };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const tipoPersonal = tiposPersonal.find(t => t.id === data.tipo_personal_id || t.id === Number(data.tipo_personal_id));
      const result = await registerUser({
        nombre_completo: data.nombre_completo,
        dni: data.dni,
        email: data.email,
        telefono: data.telefono,
        institucion: data.institucion,
        jurisdiccion: data.jurisdiccion,
        cargo: data.cargo,
        tipo_personal: tipoPersonal,
        password: data.password,
      });
      if (result.success) {
        toast.success('Registro exitoso. Revisá tu email para verificar la cuenta.', {
          autoClose: 6000,
        });
        navigate('/login');
      } else {
        toast.error(result.error || 'Error al registrarse');
      }
    } catch (error) {
      toast.error('Error inesperado al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white shadow-2xl sm:rounded-3xl sm:border border-gray-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Link to="/login" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" /></svg>
              </Link>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Crear cuenta</h2>
                <p className="text-sm text-gray-500">Registrate en el sistema SIGEVIR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((s) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s.id === step ? `bg-blue-600 text-white shadow-lg shadow-blue-200` :s.id < step ? `bg-emerald-500 text-white` : `bg-gray-100 text-gray-400`}`}>
                      {s.id < step ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : s.id}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${s.id === step ? `text-blue-700` : `text-gray-400`}`}>{s.label}</span>
                  </div>
                  {s.id < 3 && <div className={`h-px w-10 sm:w-16 ${s.id < step ? `bg-emerald-300` : `bg-gray-200`}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo *</label>
                    <input {...register('nombre_completo')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: Juan Pérez" />
                    {errors.nombre_completo && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nombre_completo.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">DNI *</label>
                    <input {...register('dni')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: 12345678" />
                    {errors.dni && <p className="mt-1 text-xs text-red-500 font-medium">{errors.dni.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email institucional *</label>
                    <input {...register('email')} type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: juan.perez@institucion.gob.ar" />
                    {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                    <input {...register('telefono')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: 351 555-1234" />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Institución *</label>
                    <input {...register('institucion')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: Policía de Córdoba, Municipalidad, Fiscalía..." />
                    {errors.institucion && <p className="mt-1 text-xs text-red-500 font-medium">{errors.institucion.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jurisdicción</label>
                    <input {...register('jurisdiccion')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: Córdoba Capital, Provincia, Nacional..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cargo o función</label>
                    <input {...register('cargo')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Ej: Oficial, Inspector, Secretario..." />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de personal *</label>
                    <select {...register('tipo_personal_id')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white" disabled={loadingTipos}>
                      <option value="">{loadingTipos ? 'Cargando tipos...' : 'Seleccioná tu tipo...'}</option>
                      {tiposPersonal.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                    {errors.tipo_personal_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.tipo_personal_id.message}</p>}
                    <RolePreview tipoPersonalId={selectedTipoId} tiposPersonal={tiposPersonal} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña *</label>
                    <input {...register('password')} type="password" onChange={(e) => { setValue('password', e.target.value); setPasswordValue(e.target.value); }} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="••••••••" />
                    {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                    {dirtyFields.password && <PasswordIndicator value={passwordValue} />}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña *</label>
                    <input {...register('confirmar_password')} type="password" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="••••••••" />
                    {errors.confirmar_password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmar_password.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div>
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Anterior
                  </button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <button type="button" onClick={nextStep} disabled={!canAdvance()} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                    Continuar
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ) : (
                  <button type="submit" disabled={loading || !canAdvance()} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Creando cuenta...
                      </span>
                    ) : 'Crear cuenta'}
                  </button>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Iniciar sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

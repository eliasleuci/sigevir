import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const OTP_LENGTH = 8;
const RESEND_COOLDOWN = 60; // seconds

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendVerificationCode, verifyCode, pendingVerification, pendingEmail, logout, supabaseReady } = useAuth();

  const email = pendingEmail || location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // ── Redirect if no pending verification ───────────────────────────────────
  useEffect(() => {
    if (!supabaseReady) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!pendingVerification && !email) {
      navigate('/login', { replace: true });
    }
  }, [pendingVerification, email, navigate, supabaseReady]);

  const hasRequestedRef = useRef(false);

  // ── Send initial code on mount ────────────────────────────────────────────
  useEffect(() => {
    if (email && !codeSent && supabaseReady && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      handleSendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, supabaseReady]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Send verification code ────────────────────────────────────────────────
  const handleSendCode = useCallback(async () => {
    if (!email) return;
    try {
      const result = await sendVerificationCode(email);
      if (result.success) {
        setCodeSent(true);
        setResendCooldown(RESEND_COOLDOWN);
        setError('');
        if (codeSent) {
          toast.success('Código reenviado a tu email');
        }
      } else {
        setError(result.error || 'Error al enviar el código');
        toast.error(result.error || 'Error al enviar el código');
      }
    } catch {
      setError('Error inesperado al enviar el código');
      toast.error('Error inesperado al enviar el código');
    }
  }, [email, sendVerificationCode, codeSent]);

  // ── Handle input change ───────────────────────────────────────────────────
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (value && index === OTP_LENGTH - 1 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  // ── Handle keyboard navigation ────────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Handle paste ──────────────────────────────────────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setError('');

    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if complete
    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError('Ingresá los 8 dígitos del código');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyCode(email, otpCode);
      if (result.success) {
        toast.success('Verificación exitosa');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Código inválido');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Error inesperado al verificar');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle back to login ──────────────────────────────────────────────────
  const handleBackToLogin = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // ── Mask email ────────────────────────────────────────────────────────────
  const maskEmail = (email) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user}@${domain}`;
    return `${user[0]}${'•'.repeat(Math.min(user.length - 2, 5))}${user[user.length - 1]}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-2xl sm:rounded-3xl sm:border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
          {/* ── Left Panel ─────────────────────────────────────────────── */}
          <div className="sm:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-10 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[200px] md:min-h-[250px]">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>

            {/* Shield icon */}
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white relative z-10">Verificación</h2>
            <p className="text-blue-200 text-center text-sm mt-2 relative z-10 max-w-xs">
              Autenticación de dos factores para proteger tu cuenta
            </p>

            {/* Decorative dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className="w-2 h-2 rounded-full bg-white/30"></div>
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <div className="w-2 h-2 rounded-full bg-white/30"></div>
            </div>
          </div>

          {/* ── Right Panel ────────────────────────────────────────────── */}
          <div className="sm:w-3/5 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Código de Verificación</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enviamos un código de 8 dígitos a{' '}
                <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
              </p>
            </div>

            {/* OTP Input Group */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                  className={
                    'w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl shadow-sm ' +
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' +
                    'transition-all duration-200 ' +
                    (error
                      ? 'border-red-300 bg-red-50 text-red-700 animate-shake'
                      : digit
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-900') +
                    (loading ? ' opacity-50 cursor-not-allowed' : '')
                  }
                  aria-label={`Dígito ${index + 1} del código de verificación`}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-red-600 font-medium animate-fade-in">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              id="verify-otp-btn"
              type="button"
              onClick={() => handleVerify()}
              disabled={loading || otp.some((d) => d === '')}
              className={
                'w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white ' +
                'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ' +
                'disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]'
              }
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Verificar Código
                </span>
              )}
            </button>

            {/* Resend + Back */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">
                  ¿No recibiste el código?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-400 font-medium">
                      Reenviar en {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      id="resend-otp-btn"
                      type="button"
                      onClick={handleSendCode}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      Reenviar código
                    </button>
                  )}
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">O</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Volver al inicio de sesión
                </button>
              </div>
            </div>

            {/* Info footer */}
            <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Verificación de dos factores activa para tu seguridad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Custom animations ──────────────────────────────────────────── */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default VerifyOTP;

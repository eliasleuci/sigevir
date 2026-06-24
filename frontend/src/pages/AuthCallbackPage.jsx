import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_READY } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Procesando autenticación...');
  const handled = useRef(false);
  const { startVerification } = useAuth();

  // ── Helper: redirect to 2FA verification or dashboard ─────────────────
  const redirectAfterAuth = (userEmail) => {
    if (SUPABASE_READY && userEmail) {
      startVerification(userEmail);
      setStatus('Redirigiendo a verificación de seguridad...');
      navigate('/verify-otp', { replace: true, state: { email: userEmail } });
    } else {
      setStatus('Autenticación exitosa. Redirigiendo...');
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const handleCallback = async () => {
      if (!SUPABASE_READY || !supabase) {
        console.warn('Supabase not ready');
        setStatus('Supabase no configurado');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
        return;
      }

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Check for OAuth error returned by provider
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setStatus(errorDescription || 'Error en la autenticación con Google');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        // ── Strategy 1: PKCE flow – exchange code for session ──
        if (code) {
          console.log('Auth callback: PKCE flow, exchanging code...');
          const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (session?.user) {
            redirectAfterAuth(session.user.email);
            return;
          }
        }

        // ── Strategy 2: Implicit flow – tokens in hash fragment ──
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        if (accessToken) {
          console.log('Auth callback: Implicit flow, setting session from hash...');
          const refreshToken = hashParams.get('refresh_token') || '';
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (session?.user) {
            redirectAfterAuth(session.user.email);
            return;
          }
        }

        // ── Strategy 3: Wait for onAuthStateChange to pick up the session ──
        console.log('Auth callback: Waiting for session via onAuthStateChange...');
        setStatus('Verificando sesión...');

        // Give the auth listener time to process
        const maxWait = 8000;
        const pollInterval = 500;
        let elapsed = 0;

        const poll = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            redirectAfterAuth(session.user.email);
            return;
          }
          elapsed += pollInterval;
          if (elapsed < maxWait) {
            setTimeout(poll, pollInterval);
          } else {
            console.warn('Auth callback: No session found after waiting');
            setStatus('No se pudo verificar la sesión. Redirigiendo al login...');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
          }
        };
        setTimeout(poll, pollInterval);
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus(`Error: ${err.message || 'Error en la autenticación'}`);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
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

import React from 'react';
import { css } from '@emotion/css';

// Estilos premium con glassmorphism y micro‑animaciones
const toastStyle = css`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 14px 20px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.35s ease-out;

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const iconStyle = css`
  font-size: 1.4rem;
  opacity: 0.9;
`;

export default function Toast({ notification, toast }) {
  const { mensaje, tipo } = notification;
  const bgColor = tipo === 'error' ? 'rgba(255,0,0,0.25)' : tipo === 'success' ? 'rgba(0,255,0,0.25)' : 'rgba(0,122,255,0.25)';

  return (
    <div className={toastStyle} style={{ background: bgColor }} onClick={() => toast.dismiss()}>
      <span className={iconStyle}>🔔</span>
      <span>{mensaje || notification.message || 'Nueva notificación'}</span>
    </div>
  );
}

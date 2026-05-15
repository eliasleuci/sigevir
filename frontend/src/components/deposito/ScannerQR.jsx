import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { HiOutlineCamera, HiOutlineQrcode, HiOutlineX } from 'react-icons/hi';

const ScannerQR = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);
  const readerId = 'qr-reader-container';

  const startCamera = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          scannerRef.current = null;
          setStarted(false);
          onScanSuccess(decodedText);
        },
        () => {}
      );
      setStarted(true);
    } catch (err) {
      setError(err?.message || 'Error al acceder a la cámara');
      if (onScanError) onScanError(err);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setStarted(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-gray-900 relative" style={{ minHeight: '360px' }}>
        <div id={readerId} className="w-full h-full"></div>

        {!started && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
            <HiOutlineCamera className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-gray-400 text-sm text-center mb-6">
              Presiona el botón para activar la cámara y escanear el QR
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Iniciar Cámara
            </button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
            <HiOutlineX className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-300 text-sm text-center mb-2">Error de cámara</p>
            <p className="text-gray-400 text-xs text-center mb-6">{error}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Reintentar
            </button>
          </div>
        )}

        {started && (
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
            <div className="w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 border-2 border-blue-500 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2 font-black uppercase tracking-tighter">
          <HiOutlineCamera className={`w-5 h-5 ${started ? 'animate-pulse' : ''}`} />
          <span>{started ? 'Escaneando...' : 'Cámara Apagada'}</span>
        </div>
        <p className="text-gray-500 text-sm">
          {started
            ? 'Apunta la cámara al código QR impreso en el acta de retención.'
            : 'Activa la cámara para escanear el código QR.'
          }
        </p>
      </div>

      {started && (
        <div className="mt-4">
          <button
            type="button"
            onClick={stopCamera}
            className="text-sm text-red-500 hover:text-red-700 font-semibold underline"
          >
            Detener cámara
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-2 w-full">
        <div className="flex-1 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
          <HiOutlineQrcode className={`w-8 h-8 ${started ? 'text-green-500' : 'text-gray-400'}`} />
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Estado</p>
            <p className="text-xs font-bold text-gray-700">{started ? 'Cámara Activa' : 'Cámara Inactiva'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerQR;

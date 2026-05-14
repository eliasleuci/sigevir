import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { HiOutlineCamera, HiOutlineQrcode, HiOutlineX } from 'react-icons/hi';

const ScannerQR = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const qrcodeScanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    qrcodeScanner.render(
      (decodedText) => {
        // Al tener éxito, detenemos el scanner y devolvemos el texto
        qrcodeScanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanError) onScanError(error);
      }
    );

    setScanner(qrcodeScanner);

    return () => {
      if (qrcodeScanner) {
        qrcodeScanner.clear().catch(err => console.error("Error clearing scanner", err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-gray-900 relative">
        <div id="reader" className="w-full"></div>
        
        {/* Overlay decorativo */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
          <div className="w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 border-2 border-blue-500 rounded-lg relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2 font-black uppercase tracking-tighter">
          <HiOutlineCamera className="w-5 h-5 animate-pulse" />
          <span>Buscando Código QR</span>
        </div>
        <p className="text-gray-500 text-sm">
          Apunta la cámara al código QR impreso en el acta de retención del vehículo.
        </p>
      </div>

      <div className="mt-6 flex gap-2 w-full">
        <div className="flex-1 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
          <HiOutlineQrcode className="w-8 h-8 text-gray-400" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Estado</p>
            <p className="text-xs font-bold text-gray-700">Cámara Activa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerQR;

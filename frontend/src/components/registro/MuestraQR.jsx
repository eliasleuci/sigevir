import React from 'react';
import { HiOutlineQrcode, HiOutlineDownload, HiOutlineExternalLink } from 'react-icons/hi';

const MuestraQR = ({ qrUrl, nroExpediente }) => {
  if (!qrUrl) return null;

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
        <HiOutlineQrcode className="w-10 h-10" />
      </div>
      
      <h3 className="text-2xl font-black text-gray-900 mb-2">Código QR de Seguimiento</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Este código permite al ciudadano consultar el estado de su vehículo y la resolución judicial.
      </p>

      <div className="bg-gray-50 p-6 rounded-3xl border-4 border-white shadow-inner mb-8">
        <img 
          src={qrUrl} 
          alt="Código QR" 
          className="w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 mix-blend-multiply"
        />
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nro. de Expediente</p>
          <p className="text-xl font-black text-blue-600">{nroExpediente}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        <a 
          href={qrUrl} 
          download={`QR-${nroExpediente}.png`}
          className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Descargar Código QR
        </a>
        
        <button className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all">
          <HiOutlineExternalLink className="w-5 h-5" />
          Ver Portal Público
        </button>
      </div>
    </div>
  );
};

export default MuestraQR;

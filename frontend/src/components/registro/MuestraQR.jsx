import React, { useState } from 'react';
import { HiOutlineQrcode, HiOutlineDownload, HiOutlineDocumentText } from 'react-icons/hi';
import apiClient from '../../services/apiClient';

const MuestraQR = ({ qrUrl, nroExpediente, retencionId, dominio }) => {
  const [downloadingComprobante, setDownloadingComprobante] = useState(false);

  if (!qrUrl) return null;

  // Descarga del QR como imagen
  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${nroExpediente || 'retencion'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(qrUrl, '_blank');
    }
  };

  // Descarga del Comprobante PDF para el ciudadano
  const handleDownloadComprobante = async () => {
    if (!retencionId) return;
    setDownloadingComprobante(true);
    try {
      const { data } = await apiClient.get(
        `/retenciones/${retencionId}/comprobante-ciudadano`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante-${dominio || nroExpediente || 'retencion'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar el comprobante ciudadano:', err);
    } finally {
      setDownloadingComprobante(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Alerta destacada ANTES del QR */}
      <div className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-left">
        <span className="text-3xl flex-shrink-0">⚠️</span>
        <p className="text-base font-bold text-amber-800 leading-snug">
          IMPORTANTE: Mostrale este código QR a la persona. Es su único medio para hacer seguimiento del vehículo.
        </p>
      </div>

      <div className="flex items-center gap-2 text-blue-600">
        <HiOutlineQrcode className="w-7 h-7" />
        <h3 className="text-xl font-black text-gray-900">Código QR de Seguimiento</h3>
      </div>

      {/* QR destacado y más grande */}
      <div className="flex justify-center w-full">
        <div className="p-6 bg-white border-4 border-blue-500 rounded-2xl shadow-lg flex flex-col items-center">
          <img 
            src={qrUrl} 
            alt="Código QR de seguimiento" 
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
          />
          {nroExpediente && (
            <div className="mt-4 pt-3 border-t border-gray-100 w-full text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nro. de Expediente</p>
              <p className="text-lg font-black text-blue-600">{nroExpediente}</p>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {/* Botón de descarga del comprobante formal para el ciudadano */}
        {retencionId && (
          <button
            onClick={handleDownloadComprobante}
            disabled={downloadingComprobante}
            className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <HiOutlineDocumentText className="w-5 h-5" />
            {downloadingComprobante ? 'Generando comprobante...' : '📄 Descargar comprobante para el ciudadano'}
          </button>
        )}

        <button
          onClick={handleDownloadQR}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Descargar Código QR
        </button>
      </div>

    </div>
  );
};

export default MuestraQR;

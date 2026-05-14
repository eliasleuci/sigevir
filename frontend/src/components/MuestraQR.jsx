import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';

/**
 * MuestraQR
 * Renders a large QR code containing the given URL.
 * Provides a button to download the QR code as a PNG image.
 */
const MuestraQR = ({ qrUrl }) => {
  const qrRef = useRef(null);

  const downloadQR = () => {
    try {
      const svg = qrRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'codigo_qr.png';
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
        toast.success('QR descargado con éxito');
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (e) {
      console.error(e);
      toast.error('Error al descargar el código QR');
    }
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">Código QR del Expediente</h3>
      <div ref={qrRef} className="bg-white p-4 rounded shadow-sm">
        <QRCode value={qrUrl} size={256} level="H" />
      </div>
      <p className="mt-4 text-sm text-gray-600 break-all text-center max-w-md">
        URL: {qrUrl}
      </p>
      <button
        onClick={downloadQR}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Descargar QR
      </button>
    </div>
  );
};

export default MuestraQR;

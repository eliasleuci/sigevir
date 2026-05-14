import React from 'react';
import { toast } from 'react-toastify';

/**
 * PreviewActa
 * Shows PDF preview in an iframe and provides download / print actions.
 */
const PreviewActa = ({ actaUrl }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(actaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'acta.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Acta descargada');
    } catch (e) {
      console.error(e);
      toast.error('Error al descargar el acta');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open(actaUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    } else {
      toast.error('No se pudo abrir la ventana de impresión');
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-lg font-medium">Vista previa del acta</h3>
      <iframe
        src={actaUrl}
        title="Acta PDF"
        className="w-full h-96 border rounded"
      />
      <div className="flex space-x-3 mt-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Descargar PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
};

export default PreviewActa;

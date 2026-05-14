import React from 'react';
import { HiOutlineDownload, HiOutlinePrinter, HiOutlineDocumentText } from 'react-icons/hi';

const PreviewActa = ({ pdfUrl }) => {
  if (!pdfUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col min-h-[400px] max-h-[80vh] lg:h-[700px] animate-in fade-in zoom-in duration-300">
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
          <span>Vista Previa del Acta Digital</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <HiOutlinePrinter className="w-4 h-4" />
            Imprimir
          </button>
          <a 
            href={pdfUrl} 
            download="acta-retencion.pdf"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <HiOutlineDownload className="w-4 h-4" />
            Descargar PDF
          </a>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 relative">
        <iframe 
          src={`${pdfUrl}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-none"
          title="Acta PDF"
        />
        
        {/* Mobile alternative */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <HiOutlineDocumentText className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Acta Generada</h3>
          <p className="text-sm text-gray-500 mb-6">El acta digital está lista. Debido a limitaciones del navegador móvil, descárgala para visualizarla.</p>
          <a 
            href={pdfUrl} 
            download="acta-retencion.pdf"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
          >
            Descargar Acta
          </a>
        </div>
      </div>
    </div>
  );
};

export default PreviewActa;

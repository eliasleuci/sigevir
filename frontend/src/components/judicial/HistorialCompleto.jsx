import React, { useState } from 'react';
import { 
  HiOutlineTruck, 
  HiOutlineUser, 
  HiOutlinePhotograph, 
  HiOutlineLocationMarker, 
  HiOutlineClock, 
  HiOutlineDocumentText
} from 'react-icons/hi';
import { FaGavel } from 'react-icons/fa';
import GaleriaFotos from './GaleriaFotos';
import TimelineEstados from './TimelineEstados';
import InventarioObjetos from '../deposito/InventarioObjetos';

const HistorialCompleto = ({ vehiculo, onEmitirResolucion }) => {
  const [activeTab, setActiveTab] = useState('vehiculo');

  if (!vehiculo) return null;

  const tabs = [
    { id: 'vehiculo', name: 'Vehículo', icon: HiOutlineTruck },
    { id: 'retencion', name: 'Retención', icon: HiOutlineDocumentText },
    { id: 'fotos', name: 'Fotos', icon: HiOutlinePhotograph },
    { id: 'deposito', name: 'Depósito', icon: HiOutlineLocationMarker },
    { id: 'estados', name: 'Estados', icon: HiOutlineClock },
    { id: 'resolucion', name: 'Resolución', icon: FaGavel },
  ];

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in duration-500">
      {/* Header del Expediente */}
      <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-500/20">
            {vehiculo.dominio?.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">{vehiculo.dominio}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Expediente {vehiculo.nro_expediente}</span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{vehiculo.marca} {vehiculo.modelo}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado Actual</p>
          <span className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-lg ${
            vehiculo.estado === 'LIBERADO' ? 'bg-green-600 border-green-500 text-white shadow-green-200/20' : 
            vehiculo.estado === 'RESOLUCION_PENDIENTE' ? 'bg-amber-500 border-amber-400 text-white shadow-amber-200/20' :
            'bg-blue-600 border-blue-500 text-white shadow-blue-200/20'
          }`}>
            {vehiculo.estado?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="px-8 bg-gray-50/50 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de Tabs */}
      <div className="flex-1 p-8 overflow-y-auto max-h-[70vh]">
        {activeTab === 'vehiculo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            <section className="space-y-6">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                Especificaciones Técnicas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Motor</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{vehiculo.nro_motor}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Cuadro / Chasis</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{vehiculo.nro_cuadro}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Color</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{vehiculo.color}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tipo</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{vehiculo.tipo_vehiculo}</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                Titular / Infractor
              </h4>
              <div className="p-6 border border-gray-100 rounded-[32px] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                    <HiOutlineUser className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">{vehiculo.titular_nombre}</p>
                    <p className="text-xs text-gray-500 mt-1 font-bold">DNI {vehiculo.titular_dni}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Domicilio Registrado</p>
                  <p className="text-sm text-gray-700 font-medium">{vehiculo.titular_domicilio}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'retencion' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Lugar del Hecho</p>
                <div className="flex items-center gap-3">
                  <HiOutlineLocationMarker className="w-10 h-10 text-blue-300" />
                  <p className="text-xl font-bold text-blue-900">{vehiculo.lugar_retencion}</p>
                </div>
                <p className="mt-4 text-sm text-blue-700 font-medium opacity-80">Fecha de Retención: {new Date(vehiculo.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Motivo Legal</p>
                <p className="text-lg font-bold text-gray-700 leading-relaxed italic">
                  "{vehiculo.motivo_retencion}"
                </p>
              </div>
            </div>

            {vehiculo.observaciones && (
              <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Observaciones del Agente</p>
                <p className="text-sm text-gray-600">{vehiculo.observaciones}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fotos' && (
          <div className="animate-in fade-in duration-300">
            <GaleriaFotos fotos={vehiculo.Fotos || []} />
          </div>
        )}

        {activeTab === 'deposito' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-900 text-white rounded-[32px] flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Sector</p>
                <p className="text-4xl font-black">{vehiculo.sector || 'S/D'}</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fila</p>
                <p className="text-4xl font-black text-gray-900">{vehiculo.fila || '0'}</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Espacio</p>
                <p className="text-4xl font-black text-gray-900">{vehiculo.espacio || '0'}</p>
              </div>
            </div>

            <InventarioObjetos initialItems={vehiculo.inventario_json ? JSON.parse(vehiculo.inventario_json) : []} readOnly={true} />
          </div>
        )}

        {activeTab === 'estados' && (
          <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
            <TimelineEstados logs={vehiculo.VehicleStatusLogs || []} />
          </div>
        )}

        {activeTab === 'resolucion' && (
          <div className="animate-in fade-in duration-300">
            {vehiculo.Resolucion ? (
              <div className="p-10 bg-green-50 rounded-[40px] border border-green-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-green-600 shadow-xl shadow-green-200/50 mb-6">
                  <FaGavel className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-green-900 mb-2 uppercase tracking-tighter">Causa Resuelta</h3>
                <span className="px-4 py-1 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  {vehiculo.Resolucion.tipo}
                </span>
                
                <p className="text-lg text-green-800 font-medium italic max-w-2xl leading-relaxed">
                  "{vehiculo.Resolucion.observaciones}"
                </p>
                
                <div className="mt-10 pt-8 border-t border-green-100 w-full flex flex-col items-center">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Fecha de Resolución</p>
                  <p className="text-sm font-bold text-green-900">{new Date(vehiculo.Resolucion.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
                  <FaGavel className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se ha emitido una resolución</h3>
                <p className="text-sm text-gray-500 max-w-sm">Este vehículo se encuentra actualmente bajo custodia en depósito a la espera de una orden judicial.</p>
                
                <button 
                  onClick={onEmitirResolucion}
                  className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all transform active:scale-95"
                >
                  Emitir Resolución Ahora
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!vehiculo.Resolucion && (
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onEmitirResolucion}
            className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
          >
            <FaGavel className="w-6 h-6" />
            Dictar Resolución Judicial
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialCompleto;

import React, { useState } from 'react';
import { 
  HiOutlineTruck, 
  HiOutlineUser, 
  HiOutlinePhotograph, 
  HiOutlineLocationMarker, 
  HiOutlineClock, 
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineClipboardList
} from 'react-icons/hi';
import { FaGavel } from 'react-icons/fa';
import GaleriaFotos from './GaleriaFotos';
import TimelineEstados from './TimelineEstados';
import InventarioObjetos from '../deposito/InventarioObjetos';

const HistorialCompleto = ({ vehiculo, onEmitirResolucion }) => {
  const [activeTab, setActiveTab] = useState('vehiculo');

  if (!vehiculo) return null;

  const personas = vehiculo.personas_involucradas || [];

  const tabs = [
    { id: 'vehiculo', name: 'Vehículo', icon: HiOutlineTruck },
    { id: 'retencion', name: 'Retención y Protocolo', icon: HiOutlineDocumentText },
    { id: 'personas', name: `Involucrados (${personas.length})`, icon: HiOutlineUserGroup },
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">
                Expediente {vehiculo.nro_expediente || vehiculo.numero_expediente}
              </span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{vehiculo.marca} {vehiculo.modelo}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado Actual</p>
          <span className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-lg ${
            vehiculo.estado_actual === 'LIBERADO' ? 'bg-green-600 border-green-500 text-white shadow-green-200/20' : 
            vehiculo.estado_actual === 'RESOLUCION_PENDIENTE' ? 'bg-amber-500 border-amber-400 text-white shadow-amber-200/20' :
            'bg-blue-600 border-blue-500 text-white shadow-blue-200/20'
          }`}>
            {vehiculo.estado_actual?.replace('_', ' ')}
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
        
        {/* TAB 1: VEHÍCULO */}
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
                  <p className="text-sm font-bold text-gray-900 truncate">{vehiculo.nro_motor || vehiculo.numero_motor || 'N/A'}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Cuadro / Chasis</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{vehiculo.nro_cuadro || vehiculo.numero_cuadro || 'N/A'}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Color</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{vehiculo.color || 'N/A'}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tipo</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{vehiculo.tipo_vehiculo || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                Titular Registrado
              </h4>
              <div className="p-6 border border-gray-100 rounded-[32px] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                    <HiOutlineUser className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">{vehiculo.titular_nombre || 'No registrado'}</p>
                    <p className="text-xs text-gray-500 mt-1 font-bold">DNI {vehiculo.titular_dni || 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Domicilio Registrado</p>
                  <p className="text-sm text-gray-700 font-medium">{vehiculo.titular_domicilio || 'No especificado'}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: RETENCIÓN Y PROTOCOLO POLICIAL */}
        {activeTab === 'retencion' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Lugar y Motivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Lugar del Hecho</p>
                <div className="flex items-center gap-3">
                  <HiOutlineLocationMarker className="w-10 h-10 text-blue-400 flex-shrink-0" />
                  <p className="text-xl font-bold text-blue-900">{vehiculo.calle_direccion || vehiculo.lugar_retencion || 'No especificado'}</p>
                </div>
                <p className="mt-4 text-sm text-blue-700 font-medium opacity-80">Fecha de Retención: {vehiculo.fecha_hora ? new Date(vehiculo.fecha_hora).toLocaleString('es-AR') : 'N/D'}</p>
              </div>

              <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Motivo Legal</p>
                <p className="text-lg font-bold text-gray-700 leading-relaxed italic">
                  "{vehiculo.motivo_retencion}"
                </p>
              </div>
            </div>

            {/* Agente e Institución */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Oficial / Agente Interviniente</p>
                  <p className="text-base font-bold text-white">
                    {vehiculo.agente?.nombre_completo || (vehiculo.agente?.nombre ? `${vehiculo.agente.nombre} ${vehiculo.agente.apellido || ''}` : 'Oficial de Turno')}
                  </p>
                </div>
              </div>
              {vehiculo.institucion && (
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dependencia / Institución</p>
                  <p className="text-sm font-bold text-blue-300">{vehiculo.institucion?.nombre}</p>
                </div>
              )}
            </div>

            {/* Protocolo Policial */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                Datos del Procedimiento Policial
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase">N° de Comisión</p>
                  <p className="text-sm font-bold text-gray-900">{vehiculo.numero_comision || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Móvil Policial</p>
                  <p className="text-sm font-bold text-gray-900">{vehiculo.numero_movil || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Policía Judicial</p>
                  <p className="text-sm font-bold text-gray-900">
                    {vehiculo.coopera_policia_judicial === true ? 'Sí (Cooperó)' : vehiculo.coopera_policia_judicial === false ? 'No' : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase">N° Sumario / Hecho</p>
                  <p className="text-sm font-bold text-gray-900">{vehiculo.numero_hecho || vehiculo.num_sumario || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Colaboración Especial & Traslado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colaboraciones */}
              <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaboración Especial Recibida</p>
                {Array.isArray(vehiculo.colaboracion_especial) && vehiculo.colaboracion_especial.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {vehiculo.colaboracion_especial.map((colab, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-100">
                        {String(colab).replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin colaboraciones especiales registradas</p>
                )}
              </div>

              {/* Traslado / Grúa */}
              <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Traslado del Vehículo</p>
                <p className="text-sm font-bold text-gray-900">
                  Tipo: <span className="text-blue-600">{vehiculo.tipo_traslado?.replace(/_/g, ' ') || 'Grúa Policial'}</span>
                </p>
                {vehiculo.grua_dominio && (
                  <p className="text-xs text-gray-600 font-medium">
                    Grúa Dominio: <strong>{vehiculo.grua_dominio}</strong> {vehiculo.grua_empresa ? `(${vehiculo.grua_empresa})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Consigna Policial si existe */}
            {vehiculo.queda_consigna && (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-2">
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Consigna Policial Asignada</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-amber-900">
                  <div>Oficial: {vehiculo.consigna_nombre || 'N/A'}</div>
                  <div>Dependencia: {vehiculo.consigna_dependencia || 'N/A'}</div>
                  <div>Teléfono: {vehiculo.consigna_telefono || 'N/A'}</div>
                </div>
              </div>
            )}

            {/* Observaciones */}
            {vehiculo.observaciones && (
              <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Observaciones Generales</p>
                <p className="text-sm text-gray-600">{vehiculo.observaciones}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSONAS INVOLUCRADAS */}
        {activeTab === 'personas' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
              Registro de Participantes e Involucrados
            </h4>

            {personas.length === 0 ? (
              <div className="py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold">No hay personas involucradas registradas en esta causa.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personas.map((p, index) => (
                  <div key={p.id || index} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-black text-xs rounded-xl uppercase tracking-wider">
                        {p.rol || 'Participante'}
                      </span>
                      {p.es_lesionado && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 font-black text-xs rounded-xl uppercase tracking-wider border border-red-100">
                          ⚠️ Lesionado
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-lg font-black text-gray-900">{p.nombre_completo}</p>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">DNI: {p.dni || 'No informado'} {p.edad ? `• ${p.edad} años` : ''}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-50 space-y-1 text-xs text-gray-600">
                      <p><strong>Domicilio:</strong> {p.domicilio || 'No especificado'}</p>
                      <p><strong>Teléfono:</strong> {p.telefono || 'No especificado'}</p>
                      {p.es_lesionado && (
                        <div className="mt-2 p-3 bg-red-50/50 rounded-xl border border-red-100 text-red-800">
                          <p><strong>Lesión:</strong> {p.tipo_lesion || 'En observación'}</p>
                          <p><strong>Nosocomio:</strong> {p.nosocomio_traslado || 'Trasladado por emergencia'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FOTOS */}
        {activeTab === 'fotos' && (
          <div className="animate-in fade-in duration-300">
            <GaleriaFotos fotos={vehiculo.fotos || []} />
          </div>
        )}

        {/* TAB 5: DEPÓSITO */}
        {activeTab === 'deposito' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {vehiculo.deposito_institucion && (
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Depósito Asignado</p>
                <p className="text-xl font-bold text-blue-900">{vehiculo.deposito_institucion.nombre}</p>
                <p className="text-xs text-blue-700 mt-1">{vehiculo.deposito_institucion.direccion}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-900 text-white rounded-[32px] flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Sector</p>
                <p className="text-4xl font-black">{vehiculo.deposito_activo?.sector || vehiculo.sector || 'S/D'}</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fila</p>
                <p className="text-4xl font-black text-gray-900">{vehiculo.deposito_activo?.fila || vehiculo.fila || '0'}</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Espacio</p>
                <p className="text-4xl font-black text-gray-900">{vehiculo.deposito_activo?.numero_espacio || vehiculo.espacio || '0'}</p>
              </div>
            </div>

            <InventarioObjetos initialItems={vehiculo.deposito_activo?.inventario_objetos || vehiculo.inventario_objetos || []} readOnly={true} />
          </div>
        )}

        {/* TAB 6: ESTADOS */}
        {activeTab === 'estados' && (
          <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-300">
            <TimelineEstados logs={vehiculo.status_logs || []} />
          </div>
        )}

        {/* TAB 7: RESOLUCIÓN */}
        {activeTab === 'resolucion' && (
          <div className="animate-in fade-in duration-300">
            {vehiculo.resolucion_judicial ? (
              <div className="p-10 bg-green-50 rounded-[40px] border border-green-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-green-600 shadow-xl shadow-green-200/50 mb-6">
                  <FaGavel className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-green-900 mb-2 uppercase tracking-tighter">Causa Resuelta</h3>
                <span className="px-4 py-1 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  {vehiculo.resolucion_judicial.tipo}
                </span>
                
                <p className="text-lg text-green-800 font-medium italic max-w-2xl leading-relaxed">
                  "{vehiculo.resolucion_judicial.observaciones}"
                </p>
                
                <div className="mt-10 pt-8 border-t border-green-100 w-full flex flex-col items-center">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Fecha de Resolución</p>
                  <p className="text-sm font-bold text-green-900">{new Date(vehiculo.resolucion_judicial.fecha_emision).toLocaleString()}</p>
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
      {!vehiculo.resolucion_judicial && (
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

import React, { useState } from 'react';
import { HiOutlineDocumentText, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const InventarioVehiculo = ({ tipoVehiculo, value, onChange, readonly = false }) => {
  const [openSection, setOpenSection] = useState(null);

  // Normalizar el tipo de vehículo
  const isMoto = tipoVehiculo?.toUpperCase().includes('MOTO');

  // Asegurar que value siempre sea un objeto manejable
  const inventario = value || {};

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleCheckboxChange = (section, item) => {
    if (readonly) return;
    onChange({
      ...inventario,
      [section]: {
        ...(inventario[section] || {}),
        [item]: {
          ...(inventario[section]?.[item] || {}),
          presente: !(inventario[section]?.[item]?.presente)
        }
      }
    });
  };

  const handleStateChange = (section, item, field, val) => {
    if (readonly) return;
    onChange({
      ...inventario,
      [section]: {
        ...(inventario[section] || {}),
        [item]: {
          ...(inventario[section]?.[item] || {}),
          [field]: val
        }
      }
    });
  };

  const seccionesMoto = [
    {
      id: 'conjunto_general',
      title: 'Conjunto General',
      items: [
        'Rueda delantera', 'Guardabarros delanteros', 'Suspensión delantera', 'Canasto',
        'Freno delantero', 'Óptica alta y baja', 'Manubrio', 'Llave de contacto',
        'Relojes adicionales', 'Instrumental de tablero', 'Palanca de freno', 'Acelerador',
        'Llave de luces', 'Botón de arranque', 'Pulsador de bocina', 'Cachas', 'Cable de freno',
        'Guiños delanteros', 'Espejo retrovisor', 'Tanque de combustible', 'Tapa de tanque',
        'Block', 'Varilla medidora aceite', 'Batería', 'Bujías', 'Cable bujías',
        'Bobina', 'Bocina', 'Filtro de aire', 'Radiador', 'Carburador', 'Caja de velocidad',
        'Embrague', 'Pedal cambio marcha', 'Caño de escape', 'Pedal de freno', 'Corona',
        'Cubrecadena', 'Posa pies', 'Pie de apoyo/caballete', 'Asiento', 'Parrilla',
        'Compartimiento objetos', 'Freno trasero', 'Suspensión trasera', 'Guardabarros trasero',
        'Rueda trasera', 'Piñón', 'Luz trasera', 'Guiños traseros', 'Valija', 'Placas patentes'
      ]
    },
    {
      id: 'cubiertas',
      title: 'Cubiertas y Rodado',
      items: ['Delantera', 'Trasera'],
      hasExtra: true // Permite agregar "Rodado" y "Estado"
    }
  ];

  const seccionesAuto = [
    {
      id: 'conjunto_motriz',
      title: 'Conjunto Motriz',
      items: [
        'Bloc', 'Varilla med. aceite', 'Batería', 'Distribuidor', 'Bobina', 'Bujías',
        'Cable de Bujías', 'Regulador de Carga', 'Motor de arranque', 'Alternador',
        'Bocina', 'Radiador', 'Hélice', 'Electroventilador', 'Correa', 'Bomba de agua',
        'Tubería de agua', 'Depósito de agua', 'Equipo calefactor', 'Equipo de A. Acond.',
        'Motor Limpiaparabrisas', 'Bomba de nafta', 'Carburador', 'Filtro de aire',
        'Bomba inyectora', 'Inyectores', 'Bomba de freno', 'Servo de freno', 'Dep. líquido freno',
        'Caja de dirección', 'Caja de velocidad', 'Semiejes', 'Embrague', 'Diferencial', 'Palier',
        'Cardan', 'Tanque de combustible', 'Dir. mecánica/hidráulica', 'Regulador G.N.C.'
      ]
    },
    {
      id: 'parte_interior',
      title: 'Parte Interior',
      items: [
        'Llave de Contacto', 'Volante', 'Llave de luces', 'Palanca de luces', 'Relojes adicionales',
        'Instalación eléctrica', 'Instrumental tablero', 'Comando aire/calef.', 'Encendedor',
        'Ceniceros', 'Soleras', 'Espejo retrovisor', 'Plafón de luz interna', 'Cielorraso',
        'Asientos', 'Apoya cabezas', 'Cints. de seguridad', 'Posabrazos', 'Traba de puertas',
        'Levanta vidrios', 'Manija puerta interna', 'Palanca de cambio', 'Freno de mano',
        'Alfombra', 'Cubre alfombras', 'Portamantas', 'Parlantes'
      ]
    },
    {
      id: 'laterales',
      title: 'Estado Laterales (B/R/M)',
      items: [
        'Guardabarros del. izq.', 'Puerta del. izq.', 'Puerta tras. izq.', 'Guardabarros tras. izq.',
        'Guardabarros del. der.', 'Puerta del. der.', 'Puerta tras. der.', 'Guardabarros tras. der.'
      ],
      hasBRM: true // Solo estado Bueno/Regular/Malo
    },
    {
      id: 'parte_externa',
      title: 'Parte Externa',
      items: [
        'Tren delantero', 'Placa patente delantera', 'Paragolpe delantero', 'Faros de alta y baja',
        'Guiños', 'Faros busca huellas', 'Grilla', 'Antena', 'Capot', 'Escobillas limpiaparabrisas',
        'Parabrisas', 'Vidrios puertas del.', 'Espejos retrovisores', 'Cerraduras puertas',
        'Manijas puertas', 'Vidrios puertas tras.', 'Ventiletes', 'Tapa tanque combust.',
        'Luneta', 'Escobilla limpia luneta', 'Tapa de baúl', 'Cerradura de baúl', 'Acrílicos luces tras.',
        'Paragolpe trasero', 'Placa patente trasera', 'Caño de escape', 'Tren trasero'
      ]
    },
    {
      id: 'neumaticos',
      title: 'Neumáticos',
      items: ['Rueda del. izq.', 'Rueda tras. izq.', 'Rueda del. der.', 'Rueda tras. der.', 'Rueda auxiliar'],
      hasExtra: true // Permite agregar "Llanta", "Taza", "Cubierta", "Marca", "Medida"
    }
  ];

  const secciones = isMoto ? seccionesMoto : seccionesAuto;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-black text-gray-900">Inventario del Vehículo</h3>
          <p className="text-xs text-gray-500 font-medium">Opcional. Selecciona las partes presentes y su estado.</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {secciones.map((sec, idx) => {
          const isOpen = openSection === sec.id;
          return (
            <div key={sec.id}>
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wide text-sm">{sec.title}</span>
                {isOpen ? <HiOutlineChevronUp className="text-gray-400" /> : <HiOutlineChevronDown className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                    {sec.items.map(item => {
                      const itemData = inventario[sec.id]?.[item] || {};
                      return (
                        <div key={item} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-gray-200">
                          
                          {sec.hasBRM ? (
                            // Modo B/R/M (Bueno, Regular, Malo)
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xs font-bold text-gray-700 truncate w-1/2" title={item}>{item}</span>
                              <div className="flex gap-1">
                                {['B', 'R', 'M'].map(st => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStateChange(sec.id, item, 'estado', st)}
                                    className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                      itemData.estado === st ? (st === 'B' ? 'bg-green-100 text-green-700' : st === 'R' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            // Modo Normal (Checkbox Presente/Ausente)
                            <>
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={readonly}
                                  checked={itemData.presente || false}
                                  onChange={() => handleCheckboxChange(sec.id, item)}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className={`text-xs font-bold truncate ${itemData.presente ? 'text-gray-900' : 'text-gray-500'}`} title={item}>
                                  {item}
                                </span>
                              </label>

                              {/* Campos extra si el ítem está presente y tiene la opción extra (como Cubiertas o Neumáticos) */}
                              {itemData.presente && sec.hasExtra && (
                                <div className="ml-7 mt-1 grid grid-cols-2 gap-2">
                                  {sec.id === 'cubiertas' ? (
                                    <>
                                      <input type="text" placeholder="Rodado" value={itemData.rodado || ''} onChange={e => handleStateChange(sec.id, item, 'rodado', e.target.value)} disabled={readonly} className="text-xs px-2 py-1 rounded border border-gray-200 w-full" />
                                      <input type="text" placeholder="Estado" value={itemData.estado || ''} onChange={e => handleStateChange(sec.id, item, 'estado', e.target.value)} disabled={readonly} className="text-xs px-2 py-1 rounded border border-gray-200 w-full" />
                                    </>
                                  ) : sec.id === 'neumaticos' ? (
                                    <>
                                      <input type="text" placeholder="Marca" value={itemData.marca || ''} onChange={e => handleStateChange(sec.id, item, 'marca', e.target.value)} disabled={readonly} className="text-xs px-2 py-1 rounded border border-gray-200 w-full" />
                                      <input type="text" placeholder="Medida" value={itemData.medida || ''} onChange={e => handleStateChange(sec.id, item, 'medida', e.target.value)} disabled={readonly} className="text-xs px-2 py-1 rounded border border-gray-200 w-full" />
                                      <div className="col-span-2 flex gap-4 mt-1">
                                        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={itemData.llanta || false} onChange={e => handleStateChange(sec.id, item, 'llanta', e.target.checked)} disabled={readonly} /> Llanta</label>
                                        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={itemData.taza || false} onChange={e => handleStateChange(sec.id, item, 'taza', e.target.checked)} disabled={readonly} /> Taza</label>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              )}
                            </>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventarioVehiculo;

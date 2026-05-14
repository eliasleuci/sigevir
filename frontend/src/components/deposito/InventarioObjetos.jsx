import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSave, HiOutlineArchive } from 'react-icons/hi';

const InventarioObjetos = ({ initialItems = [], onSave, readOnly = false }) => {
  const [items, setItems] = useState(initialItems.length > 0 ? initialItems : [{ id: 1, item: '', descripcion: '', estado: 'Bueno' }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), item: '', descripcion: '', estado: 'Bueno' }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <HiOutlineArchive className="w-5 h-5 text-blue-600" />
          <span>Inventario de Objetos</span>
        </div>
        {!readOnly && (
          <button 
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Agregar Ítem
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Objeto / Ítem</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / Detalles</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Estado</th>
              {!readOnly && <th className="px-6 py-4 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="group transition-colors hover:bg-gray-50/50">
                <td className="px-6 py-3">
                  <input 
                    type="text" 
                    value={item.item}
                    readOnly={readOnly}
                    onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                    placeholder="Ej: Auxilio, Estéreo..."
                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-700 placeholder-gray-300 ${readOnly ? 'cursor-default' : 'cursor-text'}`}
                  />
                </td>
                <td className="px-6 py-3">
                  <input 
                    type="text" 
                    value={item.descripcion}
                    readOnly={readOnly}
                    onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                    placeholder="Ej: Marca Sony, con cable..."
                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-600 placeholder-gray-300 ${readOnly ? 'cursor-default' : 'cursor-text'}`}
                  />
                </td>
                <td className="px-6 py-3">
                  <select 
                    value={item.estado}
                    disabled={readOnly}
                    onChange={(e) => updateItem(item.id, 'estado', e.target.value)}
                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-black uppercase tracking-wider ${
                      item.estado === 'Bueno' ? 'text-green-600' : item.estado === 'Regular' ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo / Dañado</option>
                  </select>
                </td>
                {!readOnly && (
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => onSave(items)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg"
          >
            <HiOutlineSave className="w-4 h-4" />
            Guardar Inventario
          </button>
        </div>
      )}
    </div>
  );
};

export default InventarioObjetos;

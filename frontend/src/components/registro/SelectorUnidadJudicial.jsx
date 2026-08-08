import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { HiOutlineOfficeBuilding, HiOutlineCheck } from 'react-icons/hi';

const SelectorUnidadJudicial = ({ retencionId }) => {
  const [judiciales, setJudiciales] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    const fetchJudiciales = async () => {
      try {
        const { data } = await apiClient.get('/instituciones/judiciales');
        setJudiciales(data?.data || []);
      } catch (error) {
        console.error('Error fetching unidades judiciales:', error);
      }
    };
    fetchJudiciales();
  }, []);

  const handleConfirm = async () => {
    if (!selected) {
      toast.warning('Por favor, selecciona una Unidad Judicial.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.put(`/retenciones/${retencionId}`, {
        unidad_judicial_destino_id: selected
      });
      const selectedInst = judiciales.find(j => j.id === selected);
      setSelectedName(selectedInst?.nombre || 'la Unidad Judicial seleccionada');
      setConfirmed(true);
      toast.success('Turno virtual registrado con éxito.');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al registrar el turno virtual.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-green-50 p-6 rounded-2xl border border-green-200 mt-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
            <HiOutlineCheck className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-green-900">¡Turno Virtual Confirmado!</h4>
        </div>
        <p className="text-green-800 text-sm font-medium">
          Ya estás anotado para entregar el procedimiento en <span className="font-bold">{selectedName}</span>. 
          Dirigite hacia allá y preséntate directamente con el número de expediente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <HiOutlineOfficeBuilding className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">Entrega de Procedimiento</h4>
          <p className="text-sm text-gray-500">¿A qué Unidad Judicial vas a entregar los papeles?</p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700"
          disabled={loading}
        >
          <option value="">-- Selecciona una Unidad Judicial --</option>
          {judiciales.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.nombre}</option>
          ))}
        </select>

        <button
          onClick={handleConfirm}
          disabled={loading || !selected}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Registrando...' : 'Anotarse para entregar procedimiento'}
        </button>
      </div>
    </div>
  );
};

export default SelectorUnidadJudicial;

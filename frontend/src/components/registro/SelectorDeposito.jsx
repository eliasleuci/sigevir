import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const SelectorDeposito = ({ coords, value, onChange }) => {
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords?.latitud || !coords?.longitud) return;

    const cargarDepositos = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get('/depositos-disponibles/cercanos', {
          params: { lat: coords.latitud, lng: coords.longitud },
        });
        setDepositos(data?.data || []);
      } catch (err) {
        setError('No se pudieron cargar los depositos disponibles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarDepositos();
  }, [coords?.latitud, coords?.longitud]);

  if (!coords?.latitud) {
    return (
      <p className="text-sm text-gray-400 italic">
        Selecciona la ubicacion de la retencion para ver depositos cercanos.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Buscando depositos cercanos...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-2">
      {depositos.length === 0 && (
        <p className="text-sm text-gray-400">No hay depositos configurados cerca de esta ubicacion.</p>
      )}
      <div className="space-y-2">
        {depositos.map(dep => (
          <label
            key={dep.id}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition
              ${value === dep.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              ${!dep.tiene_lugar ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="deposito_institucion_id"
                value={dep.id}
                disabled={!dep.tiene_lugar}
                checked={value === dep.id}
                onChange={() => onChange(dep.id)}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{dep.nombre}</p>
                <p className="text-xs text-gray-500">{dep.direccion}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600">{dep.distancia_km} km</p>
              <p className={`text-xs font-semibold ${dep.tiene_lugar ? 'text-green-600' : 'text-red-500'}`}>
                {dep.tiene_lugar
                  ? `${dep.espacios_disponibles} lugares libres`
                  : 'Sin lugar disponible'}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SelectorDeposito;

import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { HiOutlineLocationMarker } from 'react-icons/hi';

// Debe estar fuera del componente para que la referencia no cambie entre renders
const LIBRARIES = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const defaultCenter = { lat: -31.4201, lng: -64.1888 }; // Argentina centre

export default function MapaSelector({ onLocationChange, initialPosition = null }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Sincronizar posición inicial (ej. búsqueda de dirección) con el marcador
  useEffect(() => {
    if (initialPosition && initialPosition.lat && initialPosition.lng) {
      setMarkerPos({ lat: initialPosition.lat, lng: initialPosition.lng });
      reverseGeocode(initialPosition.lat, initialPosition.lng).then((addr) => setAddress(addr));
    }
  }, [initialPosition]);

  const [markerPos, setMarkerPos] = useState(
    initialPosition ? { lat: initialPosition.lat, lng: initialPosition.lng } : null
  );
  // Dirección obtenida del geocoder
  const [address, setAddress] = useState('');

  // Lazy‑load the Google Geocoder instance
  const geocoderRef = React.useRef(null);
  useEffect(() => {
    if (window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, []);

  const reverseGeocode = async (lat, lng) => {
    if (!geocoderRef.current) return '';
    return new Promise((resolve) => {
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve('');
        }
      });
    });
  };

  const handleMapClick = useCallback(
    async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      onLocationChange?.({ lat, lng, direccion: addr });
    },
    [onLocationChange]
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Su navegador no soporta geolocalización o está desactivada.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPos({ lat, lng });
        const address = await reverseGeocode(lat, lng);
        setAddress(address);
        onLocationChange?.({ lat, lng, direccion: address });
      },
      (error) => {
        console.error('Error geolocalización:', error);
        alert('No se pudo obtener su ubicación actual.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loadError) return <p>⚠️ Error al cargar Google Maps.</p>;
  if (!isLoaded) return <p>Cargando mapa…</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">Ubicación en el mapa</label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <HiOutlineLocationMarker className="w-3.5 h-3.5" />
          Usar mi ubicación
        </button>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPos || defaultCenter}
          zoom={markerPos ? 16 : 5}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            // Si prefieres el estilo por defecto de Google Maps (claro), elimina o comenta la siguiente línea.
            // styles: [], // <--- Comentado para usar estilo claro estándar
          }}
        >
          {markerPos && <Marker position={markerPos} />}
          {/* Mostrar la dirección debajo del mapa */}
          {address && (
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 rounded px-2 py-1 text-sm text-gray-800 shadow">
              {address}
            </div>
          )}
        </GoogleMap>
      </div>
      {markerPos && (
        <p className="text-xs text-gray-500">
          Coordenadas: {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

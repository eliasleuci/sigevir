import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiOutlineLocationMarker } from 'react-icons/hi';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [-31.4201, -64.1888];

const MapContent = ({ markerPos, onMarkerChange, onLocationChange }) => {
  const map = useMap();

  useMapEvents({
    click: async (event) => {
      const { lat, lng } = event.latlng;
      onMarkerChange([lat, lng]);
      map.panTo([lat, lng]);
      map.setZoom(16);
      const direccion = await reverseGeocode(lat, lng);
      onLocationChange?.({ lat, lng, direccion });
    },
  });

  return (
    <>
      {markerPos && (
        <Marker
          position={markerPos}
          draggable={true}
          eventHandlers={{
            dragend: async (event) => {
              const { lat, lng } = event.target.getLatLng();
              onMarkerChange([lat, lng]);
              const direccion = await reverseGeocode(lat, lng);
              onLocationChange?.({ lat, lng, direccion });
            },
          }}
        />
      )}
    </>
  );
};

const PanToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position);
      map.setZoom(16);
    }
  }, [map, position]);
  return null;
};

let geocodingAbort;

async function reverseGeocode(lat, lng) {
  if (geocodingAbort) geocodingAbort.abort();
  const controller = new AbortController();
  geocodingAbort = controller;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { signal: controller.signal, headers: { 'User-Agent': 'SIGEVIR-App/1.0' } }
    );
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

const MapaSelector = ({ onLocationChange, initialPosition = null }) => {
  const [markerPos, setMarkerPos] = useState(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : null
  );

  useEffect(() => {
    if (initialPosition) {
      setMarkerPos([initialPosition.lat, initialPosition.lng]);
    }
  }, [initialPosition]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPos([lat, lng]);
        const direccion = await reverseGeocode(lat, lng);
        onLocationChange?.({ lat, lng, direccion });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Ubicación en el mapa
        </label>
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
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={5}
          style={{ width: '100%', height: '320px' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapContent
            markerPos={markerPos}
            onMarkerChange={setMarkerPos}
            onLocationChange={onLocationChange}
          />
          {markerPos && <PanToLocation position={markerPos} />}
        </MapContainer>
      </div>
      {markerPos && (
        <p className="text-xs text-gray-500">
          Coordenadas: {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
        </p>
      )}
    </div>
  );
};

export default MapaSelector;

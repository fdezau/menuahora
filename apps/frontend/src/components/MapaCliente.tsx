'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CocineraPin {
  id: number;
  nombreNegocio: string;
  lat: number;
  lng: number;
  radio: number;
  estrellas: number;
}

interface Props {
  cocineras: CocineraPin[];
  userLat: number;
  userLng: number;
  onCocineraClick: (id: number) => void;
}

export default function MapaCliente({ cocineras, userLat, userLng, onCocineraClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([userLat, userLng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Pin del usuario
    const userIcon = L.divIcon({
      html: '<div style="font-size:24px">📍</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('Tu ubicación');

    // Pines de cocineras
    cocineras.forEach((c) => {
      const icon = L.divIcon({
        html: '<div style="font-size:24px">🍳</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: '',
      });

      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map);
      marker.bindPopup(`<b>${c.nombreNegocio}</b><br>⭐ ${c.estrellas.toFixed(1)}`);
      marker.on('click', () => onCocineraClick(c.id));

      L.circle([c.lat, c.lng], {
        radius: c.radio,
        color: '#7c2dea',
        fillColor: '#7c2dea',
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(map);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [cocineras]);

  return <div ref={mapRef} style={{ height: '250px', width: '100%', borderRadius: '16px', zIndex: 1 }} />;
}

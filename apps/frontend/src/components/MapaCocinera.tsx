'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lng: number;
  radio?: number;
  editable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  onRadioChange?: (radio: number) => void;
  height?: string;
}

export default function MapaCocinera({ lat, lng, radio = 1000, editable = false, onLocationChange, onRadioChange, height = '300px' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      html: '<div style="font-size:28px">🍳</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: '',
    });

    const marker = L.marker([lat, lng], { icon, draggable: editable }).addTo(map);
    markerRef.current = marker;

    const circle = L.circle([lat, lng], {
      radius: radio,
      color: '#7c2dea',
      fillColor: '#7c2dea',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;

    if (editable) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        circle.setLatLng(pos);
        onLocationChange?.(pos.lat, pos.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radio);
    }
  }, [radio]);

  return <div ref={mapRef} style={{ height, width: '100%', borderRadius: '16px', zIndex: 1 }} />;
}

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import MapaDynamic from '@/components/MapaDynamic';
import api from '@/lib/api';

export default function UbicacionPage() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [cocineraId, setCocineraId] = useState<number | null>(null);
  const [lat, setLat] = useState(-12.0464);
  const [lng, setLng] = useState(-77.0428);
  const [direccion, setDireccion] = useState('');
  const [repartirLejos, setRepartirLejos] = useState(false);
  const [radio, setRadio] = useState(1000);
  const [guardando, setGuardando] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (usuario) cargarCocinera();
  }, [usuario]);

  const cargarCocinera = async () => {
    const { data } = await api.get('/cocineras');
    const mi = data.find((c: any) => c.usuarioId === usuario?.id);
    if (mi) {
      setCocineraId(mi.id);
      if (mi.latitudCocina) setLat(mi.latitudCocina);
      if (mi.longitudCocina) setLng(mi.longitudCocina);
      if (mi.direccionReferencia) setDireccion(mi.direccionReferencia);
      if (mi.repartirLejos) setRepartirLejos(mi.repartirLejos);
      if (mi.radioRepartoMetros) setRadio(mi.radioRepartoMetros);
    }

    // Intentar GPS
    if (navigator.geolocation && !mi?.latitudCocina) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }

    setCargado(true);
  };

  const guardar = async () => {
    if (!cocineraId) return;
    setGuardando(true);
    try {
      await api.put(`/cocineras/${cocineraId}`, {
        latitudCocina: lat,
        longitudCocina: lng,
        direccionReferencia: direccion,
        repartirLejos,
        radioRepartoMetros: radio,
      });
      alert('✅ ¡Ubicación y zona de reparto guardados!');
      router.push('/cocinera');
    } catch {
      alert('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (!cargado) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-light pb-10">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cocinera')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">📍 Mi Ubicación y Zona de Reparto</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Pregunta de rango */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-3">¿Puedes repartir más de 1km?</h3>
          <div className="flex gap-3">
            <button
              onClick={() => { setRepartirLejos(true); if (radio <= 1000) setRadio(2000); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                repartirLejos ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ✅ Sí, puedo
            </button>
            <button
              onClick={() => { setRepartirLejos(false); if (radio > 1000) setRadio(1000); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !repartirLejos ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ❌ Solo zona cercana
            </button>
          </div>
        </div>

        {/* Radio de reparto */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-2">Radio de reparto: <span className="text-primary-600">{radio >= 1000 ? `${(radio / 1000).toFixed(1)}km` : `${radio}m`}</span></h3>
          <input
            type="range"
            min={500}
            max={repartirLejos ? 5000 : 1000}
            step={100}
            value={radio}
            onChange={(e) => setRadio(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500m</span>
            <span>{repartirLejos ? '5km' : '1km'}</span>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-2">📍 Arrastra el pin a tu ubicación</h3>
          <MapaDynamic
            lat={lat}
            lng={lng}
            radio={radio}
            editable={true}
            onLocationChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
            height="350px"
          />
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-2">Dirección de referencia</h3>
          <input
            type="text"
            placeholder="Ej: Av. Arequipa 1200, Lince"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Guardar */}
        <button
          onClick={guardar}
          disabled={guardando}
          className="w-full bg-accent-500 text-dark py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all"
        >
          {guardando ? 'Guardando...' : '💾 Guardar Zona de Reparto'}
        </button>
      </main>
    </div>
  );
}

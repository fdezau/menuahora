'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import MapaClienteDynamic from '@/components/MapaClienteDynamic';

interface Cocinera {
  id: number;
  nombreNegocio: string;
  descripcion: string;
  promedioEstrellas: number;
  totalCalificaciones: number;
  direccionReferencia: string;
  distanciaMetros?: number;
  usuario: { nombre: string };
}

export default function ClienteHome() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const [cocineras, setCocineras] = useState<Cocinera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMapa, setShowMapa] = useState(false);
  const [userLat, setUserLat] = useState(-12.0464);
  const [userLng, setUserLng] = useState(-77.0428);
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    cargarCocineras();
  }, []);

  const cargarCocineras = async () => {
    try {
      // Intentar con geolocalización
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setUserLat(pos.coords.latitude);
            setUserLng(pos.coords.longitude);
            const { data } = await api.get('/cocineras/cercanas', {
              params: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            });
            setCocineras(data);
            setLoading(false);
          },
          async () => {
            // Si no permite ubicación, traer todas
            const { data } = await api.get('/cocineras');
            setCocineras(data);
            setLoading(false);
          },
        );
      } else {
        const { data } = await api.get('/cocineras');
        setCocineras(data);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const renderEstrellas = (promedio: number) => {
    const llenas = Math.floor(promedio);
    const media = promedio % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return (
      <span className="text-lg">
        {'★'.repeat(llenas)}
        {media ? '½' : ''}
        {'☆'.repeat(vacias)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/logo.png" alt="MenuAhora" style={{ width: '130px', height: 'auto' }} />
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">Hola, {usuario?.nombre?.split(' ')[0]}</span>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Ubicación */}
      <div className="bg-primary-700 text-white px-4 py-2 text-sm flex items-center gap-2">
        <span>📍</span>
        <span>Mostrando cocineras cerca de ti</span>
      </div>

      {/* Toggle mapa */}
      <div className="px-4 pt-3 max-w-lg mx-auto">
        <button
          onClick={() => setShowMapa(!showMapa)}
          className="w-full bg-white rounded-xl shadow-sm border border-gray-200 py-2 text-sm font-semibold text-primary-600"
        >
          {showMapa ? '📋 Ver lista' : '🗺️ Ver mapa'}
        </button>
      </div>

      {/* Mapa */}
      {showMapa && cocineras.length > 0 && (
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <MapaClienteDynamic
            cocineras={cocineras.filter((c: any) => c.latitudCocina).map((c: any) => ({
              id: c.id,
              nombreNegocio: c.nombreNegocio,
              lat: c.latitudCocina,
              lng: c.longitudCocina,
              radio: c.radioRepartoMetros,
              estrellas: c.promedioEstrellas,
            }))}
            userLat={userLat}
            userLng={userLng}
            onCocineraClick={(id) => router.push(`/cliente/cocinera/${id}`)}
          />
        </div>
      )}

      {/* Lista de cocineras */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Buscando cocineras cerca de ti...</p>
          </div>
        ) : cocineras.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">😔</p>
            <p className="text-gray-500">No hay cocineras disponibles en tu zona aún</p>
          </div>
        ) : (
          cocineras.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/cliente/cocinera/${c.id}`)}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark">{c.nombreNegocio}</h3>
                  <p className="text-sm text-gray-500">{c.usuario.nombre}</p>
                </div>
                {c.distanciaMetros && (
                  <span className="bg-accent-500 text-dark text-xs font-semibold px-2 py-1 rounded-lg">
                    {c.distanciaMetros < 1000
                      ? `${c.distanciaMetros}m`
                      : `${(c.distanciaMetros / 1000).toFixed(1)}km`}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2">{c.descripcion}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">{renderEstrellas(c.promedioEstrellas)}</span>
                  <span className="text-xs text-gray-400">({c.totalCalificaciones})</span>
                </div>
                <span className="text-xs text-gray-400">📍 {c.direccionReferencia}</span>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        <button className="flex flex-col items-center text-primary-600">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-semibold">Inicio</span>
        </button>
        <button
          onClick={() => router.push('/cliente/pedidos')}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px]">Pedidos</span>
        </button>
        <button
          onClick={() => router.push('/cliente/perfil')}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

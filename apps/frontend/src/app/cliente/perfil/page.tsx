'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function PerfilPage() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => { loadFromStorage(); }, []);

  return (
    <div className="min-h-screen bg-light pb-24">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cliente')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">👤 Mi Perfil</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-4xl">
            👤
          </div>
          <h2 className="font-bold text-xl text-dark mt-4">{usuario?.nombre}</h2>
          <p className="text-sm text-gray-500">{usuario?.email}</p>
          <span className="inline-block mt-2 bg-primary-100 text-primary-600 text-xs font-semibold px-3 py-1 rounded-lg">
            {usuario?.rol}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 space-y-3">
          <button
            onClick={() => router.push('/cliente/pedidos')}
            className="w-full flex items-center justify-between py-3 border-b border-gray-50"
          >
            <span className="text-sm text-dark">📋 Mis pedidos</span>
            <span className="text-gray-300">→</span>
          </button>
          <button className="w-full flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-dark">📍 Mis direcciones</span>
            <span className="text-gray-300">→</span>
          </button>
          <button className="w-full flex items-center justify-between py-3">
            <span className="text-sm text-dark">🔔 Notificaciones</span>
            <span className="text-gray-300">→</span>
          </button>
        </div>

        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold text-sm"
        >
          Cerrar sesión
        </button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Inicio</span>
        </button>
        <button onClick={() => router.push('/cliente/pedidos')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">📋</span>
          <span className="text-[10px]">Pedidos</span>
        </button>
        <button className="flex flex-col items-center text-primary-600">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-semibold">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

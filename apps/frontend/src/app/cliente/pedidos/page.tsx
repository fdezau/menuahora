'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function PedidosClientePage() {
  const { loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    try {
      const { data } = await api.get('/pedidos/mis-pedidos');
      setPedidos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const estadoLabel: Record<string, string> = {
    PAGADO: '💰 Pagado',
    EN_PREPARACION: '🍳 En preparación',
    LISTO_PARA_ENVIO: '📦 Listo para envío',
    ENVIADO: '🛵 En camino',
    ENTREGADO: '✅ Entregado',
    CANCELADO: '❌ Cancelado',
  };

  const estadoColor: Record<string, string> = {
    PAGADO: 'bg-blue-100 text-blue-700',
    EN_PREPARACION: 'bg-yellow-100 text-yellow-700',
    LISTO_PARA_ENVIO: 'bg-accent-100 text-accent-700',
    ENVIADO: 'bg-purple-100 text-purple-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-light pb-24">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cliente')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">📋 Mis Pedidos</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {pedidos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">Aún no tienes pedidos</p>
            <button
              onClick={() => router.push('/cliente')}
              className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Ver cocineras
            </button>
          </div>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-dark">Pedido #{p.id}</p>
                  <p className="text-sm text-gray-500">{p.cocinera.usuario.nombre}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${estadoColor[p.estado] || 'bg-gray-100'}`}>
                  {estadoLabel[p.estado] || p.estado}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {p.detalles.map((d: any, i: number) => (
                  <p key={i} className="text-sm text-gray-600">
                    • {d.cantidad}x {d.menuSemanal?.descripcion || d.productoCarta?.nombre || 'Producto'}
                  </p>
                ))}
              </div>

              <div className="mt-3 flex justify-between items-center text-sm">
                <span className="text-gray-400">🕐 {p.horaEntregaElegida} — 📍 {p.direccionEntrega}</span>
                <span className="font-bold text-primary-600">S/. {p.totalPagado.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-300 mt-2">
                {new Date(p.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Inicio</span>
        </button>
        <button className="flex flex-col items-center text-primary-600">
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-semibold">Pedidos</span>
        </button>
        <button onClick={() => router.push('/cliente/perfil')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

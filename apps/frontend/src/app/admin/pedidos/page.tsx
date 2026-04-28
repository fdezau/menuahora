'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function AdminPedidosPage() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const [cocineras, setCocineras] = useState<any[]>([]);
  const [pedidosPorCocinera, setPedidosPorCocinera] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  const cargarDatos = async () => {
    try {
      const { data: cocs } = await api.get('/cocineras');
      setCocineras(cocs);

      const pedidosMap: Record<number, any[]> = {};
      for (const c of cocs) {
        try {
          const { data: pedidos } = await api.get(`/pedidos/cocinera/${c.id}`);
          if (pedidos.length > 0) pedidosMap[c.id] = pedidos;
        } catch { /* sin pedidos */ }
      }
      setPedidosPorCocinera(pedidosMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const estadoLabel: Record<string, string> = {
    PAGADO: '💰 Pagado', EN_PREPARACION: '🍳 Preparando', LISTO_PARA_ENVIO: '📦 Listo',
    ENVIADO: '🛵 Enviado', ENTREGADO: '✅ Entregado', CANCELADO: '❌ Cancelado',
  };

  const estadoColor: Record<string, string> = {
    PAGADO: 'bg-blue-100 text-blue-700', EN_PREPARACION: 'bg-yellow-100 text-yellow-700',
    LISTO_PARA_ENVIO: 'bg-cyan-100 text-cyan-700', ENVIADO: 'bg-purple-100 text-purple-700',
    ENTREGADO: 'bg-green-100 text-green-700', CANCELADO: 'bg-red-100 text-red-700',
  };

  const todosPedidos = Object.values(pedidosPorCocinera).flat();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🍽️ MenuAhora — Panel Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{usuario?.nombre}</span>
          <button onClick={() => { logout(); router.push('/login'); }} className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">Cerrar sesión</button>
        </div>
      </header>

      <nav className="bg-primary-600 text-white px-8 py-2 flex gap-6 text-sm">
        <button onClick={() => router.push('/admin')} className="opacity-70 hover:opacity-100">📊 Dashboard</button>
        <button onClick={() => router.push('/admin/cocineras')} className="opacity-70 hover:opacity-100">👩‍🍳 Cocineras</button>
        <button className="font-semibold border-b-2 border-white pb-1">📦 Pedidos</button>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total pedidos hoy</p>
            <p className="text-3xl font-bold text-dark">{todosPedidos.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Ingresos brutos</p>
            <p className="text-3xl font-bold text-dark">S/. {todosPedidos.reduce((a, p) => a + p.totalPagado, 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-md p-6 text-white">
            <p className="text-sm opacity-80">Tu comisión 💰</p>
            <p className="text-3xl font-bold">S/. {todosPedidos.reduce((a, p) => a + p.comisionPlataforma, 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-dark">📦 Todos los pedidos de hoy</h2>
          </div>
          {todosPedidos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay pedidos hoy</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cocinera</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Entrega</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tu comisión</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {todosPedidos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-400">#{p.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-dark">{p.cliente?.usuario?.nombre || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cocineras.find((c) => c.id === p.cocineraId)?.nombreNegocio || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.horaEntregaElegida}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold">S/. {p.totalPagado.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-primary-600">S/. {p.comisionPlataforma.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${estadoColor[p.estado] || 'bg-gray-100'}`}>
                        {estadoLabel[p.estado] || p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

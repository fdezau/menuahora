'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function GananciasPage() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [cocinera, setCocinera] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      const { data } = await api.get('/cocineras');
      const mi = data.find((c: any) => c.usuarioId === usuario?.id);
      if (mi) {
        setCocinera(mi);
        const pedidosRes = await api.get(`/pedidos/cocinera/${mi.id}`);
        setPedidos(pedidosRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const gananciaHoy = pedidos.reduce((acc, p) => acc + p.gananciaCocinera, 0);
  const totalPedidosHoy = pedidos.length;
  const entregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length;
  const menusVendidos = pedidos.reduce((acc, p) => acc + p.detalles.reduce((a: number, d: any) => a + d.cantidad, 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-light pb-10">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cocinera')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">💰 Mis Ganancias</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Resumen principal */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white text-center">
          <p className="text-sm opacity-80">Ganancia del día</p>
          <p className="text-4xl font-bold mt-1">S/. {gananciaHoy.toFixed(2)}</p>
          <p className="text-xs opacity-60 mt-2">Después de comisiones</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-primary-600">{totalPedidosHoy}</p>
            <p className="text-xs text-gray-500">Pedidos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-accent-600">{menusVendidos}</p>
            <p className="text-xs text-gray-500">Menús vendidos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{entregados}</p>
            <p className="text-xs text-gray-500">Entregados</p>
          </div>
        </div>

        {/* Desglose */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-3">📊 Desglose del día</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ingresos brutos</span>
              <span className="font-semibold">S/. {pedidos.reduce((a, p) => a + p.totalPagado, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Comisión plataforma</span>
              <span className="font-semibold text-red-500">- S/. {pedidos.reduce((a, p) => a + p.comisionPlataforma, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Comisión pasarela</span>
              <span className="font-semibold text-red-500">- S/. {pedidos.reduce((a, p) => a + p.comisionPasarela, 0).toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Tu ganancia neta</span>
              <span className="text-green-600">S/. {gananciaHoy.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Historial de pedidos */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h3 className="font-bold text-dark mb-3">📋 Pedidos del día</h3>
          {pedidos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No hay pedidos hoy</p>
          ) : (
            <div className="space-y-2">
              {pedidos.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-dark">Pedido #{p.id}</p>
                    <p className="text-xs text-gray-400">{p.horaEntregaElegida} — {p.cliente.usuario.nombre}</p>
                  </div>
                  <span className="font-bold text-green-600 text-sm">+ S/. {p.gananciaCocinera.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

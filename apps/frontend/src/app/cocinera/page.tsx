'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Pedido {
  id: number;
  estado: string;
  horaEntregaElegida: string;
  direccionEntrega: string;
  totalPagado: number;
  gananciaCocinera: number;
  comisionPlataforma: number;
  createdAt: string;
  detalles: { cantidad: number; precioUnitario: number; menuSemanal?: { descripcion: string }; productoCarta?: { nombre: string } }[];
  cliente: { usuario: { nombre: string; telefono: string } };
}

interface Cocinera {
  id: number;
  nombreNegocio: string;
  promedioEstrellas: number;
  totalCalificaciones: number;
  activa: boolean;
}

export default function CocineraDashboard() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cocinera, setCocinera] = useState<Cocinera | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);
  const router = useRouter();

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  const cargarDatos = async () => {
    try {
      const cocinerasRes = await api.get('/cocineras');
      const miCocinera = cocinerasRes.data.find((c: any) => c.usuarioId === usuario?.id);
      if (!miCocinera) return;
      setCocinera(miCocinera);
      setDisponible(miCocinera.activa);

      const pedidosRes = await api.get(`/pedidos/cocinera/${miCocinera.id}`);
      setPedidos(pedidosRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
    try {
      await api.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch {
      alert('Error al actualizar estado');
    }
  };

  const toggleDisponible = async () => {
    if (!cocinera) return;
    try {
      await api.put(`/cocineras/${cocinera.id}`, { activa: !disponible });
      setDisponible(!disponible);
    } catch {
      alert('Error al cambiar disponibilidad');
    }
  };

  const estadoColor: Record<string, string> = {
    PAGADO: 'bg-blue-100 text-blue-700',
    EN_PREPARACION: 'bg-yellow-100 text-yellow-700',
    LISTO_PARA_ENVIO: 'bg-cyan-100 text-cyan-700',
    ENVIADO: 'bg-purple-100 text-purple-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  const estadoLabel: Record<string, string> = {
    PAGADO: '💰 Pagado',
    EN_PREPARACION: '🍳 En preparación',
    LISTO_PARA_ENVIO: '📦 Listo para envío',
    ENVIADO: '🛵 Enviado',
    ENTREGADO: '✅ Entregado',
    CANCELADO: '❌ Cancelado',
  };

  const siguienteEstado: Record<string, string> = {
    PAGADO: 'EN_PREPARACION',
    EN_PREPARACION: 'LISTO_PARA_ENVIO',
    LISTO_PARA_ENVIO: 'ENVIADO',
    ENVIADO: 'ENTREGADO',
  };

  const totalDia = pedidos.reduce((acc, p) => acc + p.gananciaCocinera, 0);
  const entregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-light pb-24">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-bold">🍳 {cocinera?.nombreNegocio || 'Mi Cocina'}</h1>
          <p className="text-xs opacity-80">
            ⭐ {cocinera?.promedioEstrellas.toFixed(1)} ({cocinera?.totalCalificaciones} reseñas)
          </p>
        </div>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all"
        >
          Salir
        </button>
      </header>

      {/* Toggle disponible */}
      <div className="px-4 pt-3 max-w-lg mx-auto">
        <button
          onClick={toggleDisponible}
          className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            disponible
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}
        >
          <div className={`w-12 h-7 rounded-full relative transition-all ${disponible ? 'bg-green-700' : 'bg-gray-400'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${disponible ? 'right-1' : 'left-1'}`} />
          </div>
          {disponible ? '🟢 Disponible' : '🔴 No disponible'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-1">
          {disponible ? 'Los clientes pueden verte y hacer pedidos' : 'No apareces para los clientes'}
        </p>
      </div>

      {/* Resumen del día */}
      <div className="bg-primary-700 text-white px-4 py-3 mt-3 flex justify-around">
        <div className="text-center">
          <p className="text-2xl font-bold">{pedidos.length}</p>
          <p className="text-xs opacity-80">Pedidos hoy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">S/. {totalDia.toFixed(2)}</p>
          <p className="text-xs opacity-80">Ganancia hoy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{entregados}</p>
          <p className="text-xs opacity-80">Entregados</p>
        </div>
      </div>

      {/* Recordatorio horario */}
      <div className="px-4 pt-3 max-w-lg mx-auto">
        <div className="bg-primary-50 text-primary-700 rounded-xl px-4 py-2 text-xs text-center font-semibold">
          ⏰ Los pedidos de menú del día se aceptan hasta las 11:00 AM
        </div>
      </div>

      {/* Lista de pedidos */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        <h2 className="font-bold text-lg text-dark">📋 Pedidos del día</h2>

        {pedidos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No hay pedidos aún hoy</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-dark">Pedido #{pedido.id}</p>
                  <p className="text-sm text-gray-500">{pedido.cliente.usuario.nombre}</p>
                  <p className="text-xs text-gray-400">📞 {pedido.cliente.usuario.telefono}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${estadoColor[pedido.estado] || 'bg-gray-100'}`}>
                  {estadoLabel[pedido.estado] || pedido.estado}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {pedido.detalles.map((d, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    • {d.cantidad}x {d.menuSemanal?.descripcion || d.productoCarta?.nombre || 'Producto'} — S/. {(d.precioUnitario * d.cantidad).toFixed(2)}
                  </p>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">🕐 Entrega: <span className="font-semibold text-dark">{pedido.horaEntregaElegida}</span></p>
                  <p className="text-gray-500">📍 {pedido.direccionEntrega}</p>
                </div>
                <p className="font-bold text-primary-600">S/. {pedido.totalPagado.toFixed(2)}</p>
              </div>

              {siguienteEstado[pedido.estado] && (
                <button
                  onClick={() => cambiarEstado(pedido.id, siguienteEstado[pedido.estado])}
                  className="w-full mt-3 bg-accent-500 text-dark py-2 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all"
                >
                  {pedido.estado === 'PAGADO' && '🍳 Iniciar preparación'}
                  {pedido.estado === 'EN_PREPARACION' && '📦 Marcar listo para envío'}
                  {pedido.estado === 'LISTO_PARA_ENVIO' && '🛵 Marcar como enviado'}
                  {pedido.estado === 'ENVIADO' && '✅ Confirmar entrega'}
                </button>
              )}
            </div>
          ))
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        <button className="flex flex-col items-center text-primary-600">
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-semibold">Pedidos</span>
        </button>
        <button onClick={() => router.push('/cocinera/menu-semanal')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">📋</span>
          <span className="text-[10px]">Menú</span>
        </button>
        <button onClick={() => router.push('/cocinera/carta')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">🍟</span>
          <span className="text-[10px]">Carta</span>
        </button>
        <button onClick={() => router.push('/cocinera/ubicacion')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">📍</span>
          <span className="text-[10px]">Ubicación</span>
        </button>
        <button onClick={() => router.push('/cocinera/ganancias')} className="flex flex-col items-center text-gray-400">
          <span className="text-xl">💰</span>
          <span className="text-[10px]">Ganancias</span>
        </button>
      </nav>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Reporte {
  totalPedidos: number;
  ingresosBrutos: number;
  comisionTotal: number;
  comisionPasarela: number;
}

interface Cocinera {
  id: number;
  nombreNegocio: string;
  promedioEstrellas: number;
  totalCalificaciones: number;
  activa: boolean;
  direccionReferencia: string;
  radioRepartoMetros: number;
  usuario: { nombre: string; telefono: string };
}

export default function AdminDashboard() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cocineras, setCocineras] = useState<Cocinera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      const [reporteRes, cocinerasRes] = await Promise.all([
        api.get('/pedidos/admin/reporte'),
        api.get('/cocineras'),
      ]);
      setReporte(reporteRes.data);
      setCocineras(cocinerasRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar + Header Web */}
      <header className="bg-primary-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🍽️ MenuAhora — Panel Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">Hola, {usuario?.nombre}</span>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-primary-600 text-white px-8 py-2 flex gap-6 text-sm">
        <button className="font-semibold border-b-2 border-white pb-1">📊 Dashboard</button>
        <button onClick={() => router.push('/admin/cocineras')} className="opacity-70 hover:opacity-100 transition-all">👩‍🍳 Cocineras</button>
        <button onClick={() => router.push('/admin/pedidos')} className="opacity-70 hover:opacity-100 transition-all">📦 Pedidos</button>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Pedidos hoy</p>
            <p className="text-3xl font-bold text-dark mt-1">{reporte?.totalPedidos || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Ingresos brutos</p>
            <p className="text-3xl font-bold text-dark mt-1">S/. {(reporte?.ingresosBrutos || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-md p-6 text-white">
            <p className="text-sm opacity-80">Tu comisión 💰</p>
            <p className="text-3xl font-bold mt-1">S/. {(reporte?.comisionTotal || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Cocineras activas</p>
            <p className="text-3xl font-bold text-dark mt-1">{cocineras.filter((c) => c.activa).length}</p>
          </div>
        </div>

        {/* Tabla de cocineras */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-dark">👩‍🍳 Cocineras</h2>
            <span className="text-sm text-gray-400">{cocineras.length} registradas</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Negocio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cocinera</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ubicación</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Radio</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">⭐ Rating</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cocineras.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4 font-semibold text-dark text-sm">{c.nombreNegocio}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.usuario.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.direccionReferencia || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{c.radioRepartoMetros}m</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-yellow-500">★</span> {c.promedioEstrellas.toFixed(1)}
                    <span className="text-xs text-gray-400 ml-1">({c.totalCalificaciones})</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${c.activa ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {c.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

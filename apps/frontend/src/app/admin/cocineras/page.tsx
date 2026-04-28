'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function AdminCocinerasPage() {
  const { usuario, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const [cocineras, setCocineras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => { if (usuario) cargarCocineras(); }, [usuario]);

  const cargarCocineras = async () => {
    try {
      const { data } = await api.get('/cocineras');
      setCocineras(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleActiva = async (id: number, activa: boolean) => {
    try {
      await api.put(`/cocineras/${id}`, { activa: !activa });
      cargarCocineras();
    } catch { alert('Error al actualizar'); }
  };

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
        <button className="font-semibold border-b-2 border-white pb-1">👩‍🍳 Cocineras</button>
        <button onClick={() => router.push('/admin/pedidos')} className="opacity-70 hover:opacity-100">📦 Pedidos</button>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-dark">👩‍🍳 Gestión de Cocineras</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Negocio</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Radio</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">⭐</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cocineras.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-400">#{c.id}</td>
                  <td className="px-6 py-4 font-semibold text-dark text-sm">{c.nombreNegocio}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.usuario.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.usuario.telefono || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">{c.radioRepartoMetros}m</td>
                  <td className="px-6 py-4 text-center text-sm">★ {c.promedioEstrellas.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActiva(c.id, c.activa)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                        c.activa ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {c.activa ? 'Desactivar' : 'Activar'}
                    </button>
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

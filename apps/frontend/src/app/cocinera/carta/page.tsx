'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tipo: string;
  horarioInicio: string;
  horarioFin: string;
  activo: boolean;
}

export default function CartaPage() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cocineraId, setCocineraId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', tipo: 'CARTA', horarioInicio: '11:00', horarioFin: '21:00',
  });

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  const cargarDatos = async () => {
    const { data } = await api.get('/cocineras');
    const mi = data.find((c: any) => c.usuarioId === usuario?.id);
    if (mi) {
      setCocineraId(mi.id);
      const cocineraData = await api.get(`/cocineras/${mi.id}`);
      setProductos(cocineraData.data.productosCarta);
    }
  };

  const agregarProducto = async () => {
    if (!cocineraId || !form.nombre.trim() || !form.precio) return;
    setGuardando(true);
    try {
      await api.post(`/cocineras/${cocineraId}/productos`, {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        precio: parseFloat(form.precio),
        tipo: form.tipo,
        horarioInicio: form.horarioInicio,
        horarioFin: form.horarioFin,
      });
      setForm({ nombre: '', descripcion: '', precio: '', tipo: 'CARTA', horarioInicio: '11:00', horarioFin: '21:00' });
      setShowForm(false);
      cargarDatos();
    } catch {
      alert('Error al agregar producto');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm('¿Desactivar este producto?')) return;
    try {
      await api.delete(`/cocineras/productos/${id}`);
      cargarDatos();
    } catch {
      alert('Error al eliminar');
    }
  };

  const carta = productos.filter((p) => p.tipo === 'CARTA' && p.activo);
  const adicionales = productos.filter((p) => p.tipo === 'ADICIONAL' && p.activo);

  return (
    <div className="min-h-screen bg-light pb-10">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cocinera')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">🍟 Mi Carta y Adicionales</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div>
          <h3 className="font-bold text-lg text-dark mb-3">🍟 Platos a la Carta</h3>
          {carta.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes platos a la carta aún</p>
          ) : (
            <div className="space-y-3">
              {carta.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.horarioInicio} - {p.horarioFin}</p>
                    <span className="text-primary-600 font-bold">S/. {p.precio.toFixed(2)}</span>
                  </div>
                  <button onClick={() => eliminarProducto(p.id)} className="text-red-400 text-xs font-semibold bg-red-50 px-3 py-1 rounded-lg">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-lg text-dark mb-3">🌙 Adicionales (Tarde/Noche)</h3>
          {adicionales.length === 0 ? (
            <p className="text-gray-400 text-sm">No tienes adicionales aún</p>
          ) : (
            <div className="space-y-3">
              {adicionales.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.horarioInicio} - {p.horarioFin}</p>
                    <span className="text-primary-600 font-bold">S/. {p.precio.toFixed(2)}</span>
                  </div>
                  <button onClick={() => eliminarProducto(p.id)} className="text-red-400 text-xs font-semibold bg-red-50 px-3 py-1 rounded-lg">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 font-semibold hover:bg-primary-50 transition-all"
        >
          + Agregar producto
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 space-y-3">
            <input placeholder="Nombre del producto" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            <div className="flex gap-2">
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm">
                <option value="CARTA">Plato a la carta</option>
                <option value="ADICIONAL">Adicional</option>
              </select>
              <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Desde</label>
                <input type="time" value={form.horarioInicio} onChange={(e) => setForm({ ...form, horarioInicio: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400">Hasta</label>
                <input type="time" value={form.horarioFin} onChange={(e) => setForm({ ...form, horarioFin: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
            </div>
            <button onClick={agregarProducto} disabled={guardando} className="w-full bg-primary-600 text-white py-2 rounded-xl font-semibold text-sm">
              {guardando ? 'Guardando...' : '✅ Guardar producto'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

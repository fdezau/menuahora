'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface Menu {
  id: number;
  descripcion: string;
  entrada1: string | null;
  entrada2: string | null;
  incluyeRefresco: boolean;
  precio: number;
  cuposTotales: number;
  confirmaciones: { cuposDisponibles: number }[];
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tipo: string;
  horarioInicio: string;
  horarioFin: string;
}

interface Cocinera {
  id: number;
  nombreNegocio: string;
  descripcion: string;
  promedioEstrellas: number;
  totalCalificaciones: number;
  direccionReferencia: string;
  usuario: { nombre: string };
  productosCarta: Producto[];
}

interface ItemCarrito {
  tipo: 'menu' | 'carta' | 'adicional';
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  entradaElegida?: string;
}

export default function CocineraDetalle() {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [cocinera, setCocinera] = useState<Cocinera | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [horaEntrega, setHoraEntrega] = useState('12:00');
  const [direccion, setDireccion] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [showCalificar, setShowCalificar] = useState(false);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [cocineraRes, menusRes] = await Promise.all([
        api.get(`/cocineras/${params.id}`),
        api.get(`/menus/${params.id}/hoy`),
      ]);
      setCocinera(cocineraRes.data);
      setMenus(menusRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (tipo: 'menu' | 'carta' | 'adicional', id: number, nombre: string, precio: number) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === id && item.tipo === tipo);
      if (existe) {
        return prev.map((item) =>
          item.id === id && item.tipo === tipo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...prev, { tipo, id, nombre, precio, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (tipo: string, id: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === id && item.tipo === tipo
            ? { ...item, cantidad: item.cantidad + delta }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  };

  const getCantidad = (tipo: string, id: number) => {
    return carrito.find((item) => item.id === id && item.tipo === tipo)?.cantidad || 0;
  };

  const getTotal = () => carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const getTotalItems = () => carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const confirmarPedido = async () => {
    if (!direccion.trim()) return alert('Ingresa tu dirección de entrega');
    setProcesando(true);
    try {
      const detalles = carrito.map((item) => ({
        menuSemanalId: item.tipo === 'menu' ? item.id : undefined,
        productoCartaId: item.tipo !== 'menu' ? item.id : undefined,
        cantidad: item.cantidad,
      }));

      await api.post('/pedidos', {
        cocineraId: Number(params.id),
        horaEntregaElegida: horaEntrega,
        direccionEntrega: direccion,
        culqiToken: 'test_token',
        detalles,
      });

      alert('✅ ¡Pedido confirmado! Te llegará a las ' + horaEntrega);
      router.push('/cliente');
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.message || 'No se pudo crear el pedido'));
    } finally {
      setProcesando(false);
    }
  };

  const enviarCalificacion = async () => {
    try {
      await api.post('/calificaciones', {
        cocineraId: Number(params.id),
        estrellas,
        comentario: comentario || undefined,
      });
      alert('✅ ¡Gracias por tu calificación!');
      setShowCalificar(false);
      cargarDatos();
    } catch {
      alert('Error al calificar');
    }
  };

  const horasDisponibles = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'];

  const renderEstrellas = (promedio: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(promedio) ? 'text-yellow-500' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
  if (!cocinera) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cocinera no encontrada</div>;

  const carta = cocinera.productosCarta.filter((p) => p.tipo === 'CARTA');
  const adicionales = cocinera.productosCarta.filter((p) => p.tipo === 'ADICIONAL');

  return (
    <div className="min-h-screen bg-light pb-32">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cliente')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold flex-1">{cocinera.nombreNegocio}</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Info cocinera */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h2 className="font-bold text-xl text-dark">{cocinera.nombreNegocio}</h2>
          <p className="text-sm text-gray-500">{cocinera.usuario.nombre}</p>
          <p className="text-sm text-gray-600 mt-1">{cocinera.descripcion}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <span className="text-lg">{renderEstrellas(cocinera.promedioEstrellas)}</span>
              <span className="text-xs text-gray-400">({cocinera.totalCalificaciones})</span>
            </div>
            <button
              onClick={() => setShowCalificar(!showCalificar)}
              className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-lg font-semibold"
            >
              ⭐ Calificar
            </button>
          </div>

          {showCalificar && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl space-y-3">
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setEstrellas(n)} className="text-3xl">
                    {n <= estrellas ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Comentario (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                rows={2}
              />
              <button onClick={enviarCalificacion} className="w-full bg-primary-600 text-white py-2 rounded-xl font-semibold text-sm">
                Enviar calificación
              </button>
            </div>
          )}
        </div>

        {/* Menú del día */}
        <div>
          <h3 className="font-bold text-lg text-dark mb-3">📋 Menú del Día</h3>
          {menus.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay menú disponible hoy</p>
          ) : (
            <div className="space-y-3">
              {menus.map((menu) => {
                const cupos = menu.confirmaciones[0]?.cuposDisponibles ?? menu.cuposTotales;
                const cantidad = getCantidad('menu', menu.id);
                return (
                  <div key={menu.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                    <p className="font-semibold text-dark">{menu.descripcion}</p>
                    {menu.entrada1 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Entrada: {menu.entrada1}{menu.entrada2 ? ` o ${menu.entrada2}` : ''}
                      </p>
                    )}
                    {menu.incluyeRefresco && (
                      <p className="text-xs text-accent-600 mt-1">🥤 Refresco incluido</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-primary-600">S/. {menu.precio.toFixed(2)}</span>
                        <span className="text-xs text-gray-400 ml-2">({cupos} cupos)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cantidad > 0 && (
                          <>
                            <button
                              onClick={() => cambiarCantidad('menu', menu.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 text-dark font-bold flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="font-bold text-dark w-6 text-center">{cantidad}</span>
                          </>
                        )}
                        <button
                          onClick={() => agregarAlCarrito('menu', menu.id, menu.descripcion, menu.precio)}
                          className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Platos a la carta */}
        {carta.length > 0 && (
          <div>
            <h3 className="font-bold text-lg text-dark mb-3">🍟 Platos a la Carta</h3>
            <div className="space-y-3">
              {carta.map((p) => {
                const cantidad = getCantidad('carta', p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.horarioInicio} - {p.horarioFin}</p>
                      <span className="text-primary-600 font-bold">S/. {p.precio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cantidad > 0 && (
                        <>
                          <button
                            onClick={() => cambiarCantidad('carta', p.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-dark font-bold flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-bold text-dark w-6 text-center">{cantidad}</span>
                        </>
                      )}
                      <button
                        onClick={() => agregarAlCarrito('carta', p.id, p.nombre, p.precio)}
                        className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adicionales */}
        {adicionales.length > 0 && (
          <div>
            <h3 className="font-bold text-lg text-dark mb-3">🌙 Adicionales</h3>
            <div className="space-y-3">
              {adicionales.map((p) => {
                const cantidad = getCantidad('adicional', p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.horarioInicio} - {p.horarioFin}</p>
                      <span className="text-primary-600 font-bold">S/. {p.precio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cantidad > 0 && (
                        <>
                          <button
                            onClick={() => cambiarCantidad('adicional', p.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-dark font-bold flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-bold text-dark w-6 text-center">{cantidad}</span>
                        </>
                      )}
                      <button
                        onClick={() => agregarAlCarrito('adicional', p.id, p.nombre, p.precio)}
                        className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Checkout flotante */}
      {carrito.length > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{getTotalItems()}</span>
            Ver pedido — S/. {getTotal().toFixed(2)}
          </button>
        </div>
      )}

      {/* Modal Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-dark">Tu Pedido</h3>
              <button onClick={() => setShowCheckout(false)} className="text-2xl text-gray-400">✕</button>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {carrito.map((item) => (
                <div key={`${item.tipo}-${item.id}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark text-sm">{item.nombre}</p>
                    <p className="text-xs text-gray-400">S/. {item.precio.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.tipo, item.id, -1)}
                      className="w-7 h-7 rounded-full bg-gray-200 text-dark font-bold flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="font-bold w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.tipo, item.id, 1)}
                      className="w-7 h-7 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                    <span className="font-bold text-dark ml-2">S/. {(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            {/* Hora de entrega */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-dark block mb-2">🕐 Hora de entrega</label>
              <select
                value={horaEntrega}
                onChange={(e) => setHoraEntrega(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {horasDisponibles.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-dark block mb-2">📍 Dirección de entrega</label>
              <input
                type="text"
                placeholder="Ej: Av. Arequipa 1500, Dpto 302"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({getTotalItems()} items)</span>
                <span className="font-semibold">S/. {getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total a pagar</span>
                <span className="text-primary-600">S/. {getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Botón pagar */}
            <button
              onClick={confirmarPedido}
              disabled={procesando}
              className="w-full bg-accent-500 text-dark py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all"
            >
              {procesando ? 'Procesando...' : `💳 Pagar S/. ${getTotal().toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

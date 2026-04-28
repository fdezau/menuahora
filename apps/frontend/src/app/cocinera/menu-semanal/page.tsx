'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const TODOS_LOS_DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

interface MenuDia {
  descripcion: string;
  entrada1: string;
  entrada2: string;
  precio: string;
  cuposTotales: string;
}

interface MenusPorDia {
  [dia: string]: MenuDia[];
}

export default function MenuSemanalPage() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
  const [menus, setMenus] = useState<MenusPorDia>(() => {
    const inicial: MenusPorDia = {};
    TODOS_LOS_DIAS.forEach((dia) => {
      inicial[dia] = [{ descripcion: '', entrada1: '', entrada2: '', precio: '13', cuposTotales: '24' }];
    });
    return inicial;
  });
  const [enviando, setEnviando] = useState(false);
  const [cocineraId, setCocineraId] = useState<number | null>(null);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => { if (usuario) obtenerCocinera(); }, [usuario]);

  const obtenerCocinera = async () => {
    const { data } = await api.get('/cocineras');
    const mi = data.find((c: any) => c.usuarioId === usuario?.id);
    if (mi) setCocineraId(mi.id);
  };

  const toggleDia = (dia: string) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const toggleTodos = () => {
    if (seleccionarTodos) {
      setDiasSeleccionados([]);
    } else {
      setDiasSeleccionados([...TODOS_LOS_DIAS]);
    }
    setSeleccionarTodos(!seleccionarTodos);
  };

  const agregarMenu = (dia: string) => {
    setMenus((prev) => {
      const copia = { ...prev };
      copia[dia] = [...copia[dia], { descripcion: '', entrada1: '', entrada2: '', precio: '13', cuposTotales: '24' }];
      return copia;
    });
  };

  const eliminarMenu = (dia: string, index: number) => {
    setMenus((prev) => {
      const copia = { ...prev };
      copia[dia] = copia[dia].filter((_, i) => i !== index);
      return copia;
    });
  };

  const actualizarMenu = (dia: string, index: number, campo: keyof MenuDia, valor: string) => {
    setMenus((prev) => {
      const copia = { ...prev };
      copia[dia] = copia[dia].map((m, i) => (i === index ? { ...m, [campo]: valor } : m));
      return copia;
    });
  };

  const enviarMenus = async () => {
    if (!cocineraId) return;
    if (diasSeleccionados.length === 0) return alert('Selecciona al menos un día');
    setEnviando(true);
    try {
      const hoy = new Date();
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() + ((8 - hoy.getDay()) % 7 || 7));
      const semanaInicio = lunes.toISOString().split('T')[0];

      const menusArray: any[] = [];
      for (const dia of diasSeleccionados) {
        for (const menu of menus[dia]) {
          if (menu.descripcion.trim()) {
            menusArray.push({
              dia,
              descripcion: menu.descripcion,
              entrada1: menu.entrada1 || undefined,
              entrada2: menu.entrada2 || undefined,
              precio: parseFloat(menu.precio),
              cuposTotales: parseInt(menu.cuposTotales),
            });
          }
        }
      }

      if (menusArray.length === 0) return alert('Agrega al menos un menú con descripción');

      await api.post(`/menus/${cocineraId}`, { semanaInicio, menus: menusArray });
      alert('✅ ¡Menú semanal enviado correctamente!');
      router.push('/cocinera');
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.message || 'No se pudo enviar'));
    } finally {
      setEnviando(false);
    }
  };

  const diasLabel: Record<string, string> = {
    LUNES: 'Lun', MARTES: 'Mar', MIERCOLES: 'Mié',
    JUEVES: 'Jue', VIERNES: 'Vie', SABADO: 'Sáb', DOMINGO: 'Dom',
  };

  return (
    <div className="min-h-screen bg-light pb-10">
      <header className="bg-primary-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/cocinera')} className="text-2xl">←</button>
        <h1 className="text-lg font-bold">📋 Menú Semanal</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <p className="text-sm text-gray-500">
          Selecciona los días que vas a cocinar y configura tus menús para cada día.
        </p>

        {/* Selector de días */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-dark">📅 ¿Qué días vas a vender?</h3>
            <button
              onClick={toggleTodos}
              className="text-xs text-primary-600 font-semibold"
            >
              {seleccionarTodos ? 'Deseleccionar todos' : 'Toda la semana'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TODOS_LOS_DIAS.map((dia) => (
              <button
                key={dia}
                onClick={() => toggleDia(dia)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  diasSeleccionados.includes(dia)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {diasLabel[dia]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {diasSeleccionados.length} día(s) seleccionado(s)
          </p>
        </div>

        {/* Formularios por día seleccionado */}
        {diasSeleccionados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-gray-400">Selecciona al menos un día arriba</p>
          </div>
        ) : (
          TODOS_LOS_DIAS.filter((dia) => diasSeleccionados.includes(dia)).map((dia) => (
            <div key={dia} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
              <h3 className="font-bold text-primary-600 text-lg mb-3">{dia}</h3>

              {menus[dia].map((menu, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-dark">Menú {index + 1}</span>
                    {menus[dia].length > 1 && (
                      <button onClick={() => eliminarMenu(dia, index)} className="text-red-400 text-xs font-semibold">
                        ✕ Eliminar
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Descripción (ej: Lomo saltado + arroz + refresco)"
                    value={menu.descripcion}
                    onChange={(e) => actualizarMenu(dia, index, 'descripcion', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Entrada 1"
                      value={menu.entrada1}
                      onChange={(e) => actualizarMenu(dia, index, 'entrada1', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <input
                      placeholder="Entrada 2 (opcional)"
                      value={menu.entrada2}
                      onChange={(e) => actualizarMenu(dia, index, 'entrada2', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">Precio S/.</label>
                      <input type="number" value={menu.precio} onChange={(e) => actualizarMenu(dia, index, 'precio', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">Cupos</label>
                      <input type="number" value={menu.cuposTotales} onChange={(e) => actualizarMenu(dia, index, 'cuposTotales', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => agregarMenu(dia)} className="w-full py-2 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-all">
                + Agregar menú
              </button>
            </div>
          ))
        )}

        {diasSeleccionados.length > 0 && (
          <button onClick={enviarMenus} disabled={enviando} className="w-full bg-accent-500 text-dark py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all">
            {enviando ? 'Enviando...' : '📤 Enviar Menús de la Semana'}
          </button>
        )}
      </main>
    </div>
  );
}

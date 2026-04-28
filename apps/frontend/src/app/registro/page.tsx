'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function RegistroPage() {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '', rol: 'CLIENTE',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      const usuario = useAuthStore.getState().usuario;
      if (usuario?.rol === 'COCINERA') router.push('/cocinera');
      else router.push('/cliente');
    } catch {
      setError('Error al registrarse. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">🍽️ MenuAhora</h1>
          <p className="text-gray-500 mt-2">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            required
          />

          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            required
          />

          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, rol: 'CLIENTE' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                form.rol === 'CLIENTE'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              🛒 Cliente
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, rol: 'COCINERA' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                form.rol === 'COCINERA'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              🍳 Cocinera
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 active:scale-95"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

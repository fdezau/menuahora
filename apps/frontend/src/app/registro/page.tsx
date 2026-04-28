'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function RegistroPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', rol: 'CLIENTE' });
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
        <div className="flex justify-center pt-2 pb-4">
          <img src="/logo.png" alt="MenuAhora" style={{ width: '280px', height: 'auto' }} />
        </div>

        <p className="text-gray-500 text-center text-sm mb-6">Crea tu cuenta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">{error}</div>
          )}

          <input type="text" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" required />
          <input type="email" placeholder="Correo electr\u00f3nico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" required />
          <input type="password" placeholder="Contrase\u00f1a (m\u00edn. 6 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" required />
          <input type="tel" placeholder="Tel\u00e9fono (opcional)" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />

          <div className="flex gap-3">
            <button type="button" onClick={() => setForm({ ...form, rol: 'CLIENTE' })} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${'bg-primary-600 text-white' if 1 else ''}`}>
              \ud83d\uded2 Cliente
            </button>
            <button type="button" onClick={() => setForm({ ...form, rol: 'COCINERA' })} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${'bg-gray-100 text-gray-600'}`}>
              \ud83c\udf73 Cocinera
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 active:scale-95">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          \u00bfYa tienes cuenta?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesi\u00f3n</Link>
        </p>
      </div>
    </div>
  );
}

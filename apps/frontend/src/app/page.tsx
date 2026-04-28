'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function Home() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!usuario) {
      router.push('/login');
      return;
    }
    if (usuario.rol === 'ADMIN') router.push('/admin');
    else if (usuario.rol === 'COCINERA') router.push('/cocinera');
    else router.push('/cliente');
  }, [usuario]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-700">🍽️ MenuAhora</h1>
        <p className="text-gray-500 mt-2">Cargando...</p>
      </div>
    </div>
  );
}

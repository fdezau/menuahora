'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Image from 'next/image';

export default function Home() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => { loadFromStorage(); }, []);

  useEffect(() => {
    if (!usuario) { router.push('/login'); return; }
    if (usuario.rol === 'ADMIN') router.push('/admin');
    else if (usuario.rol === 'COCINERA') router.push('/cocinera');
    else router.push('/cliente');
  }, [usuario]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
      <div className="text-center">
        <Image src="/logo.png" alt="MenuAhora" width={300} height={100} priority />
        <p className="text-white/70 mt-4 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

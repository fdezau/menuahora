'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Image from 'next/image';

export default function Home() {
  const { usuario, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [fase, setFase] = useState(0);

  useEffect(() => {
    loadFromStorage();
    setTimeout(() => setFase(1), 300);
    setTimeout(() => setFase(2), 1200);
    setTimeout(() => setFase(3), 2000);
  }, []);

  useEffect(() => {
    if (fase === 3) {
      setTimeout(() => {
        if (!usuario) { router.push('/login'); return; }
        if (usuario.rol === 'ADMIN') router.push('/admin');
        else if (usuario.rol === 'COCINERA') router.push('/cocinera');
        else router.push('/cliente');
      }, 500);
    }
  }, [fase, usuario]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 overflow-hidden">
      {/* Logo con animación */}
      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: fase >= 1 ? 1 : 0,
          transform: fase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(40px)',
        }}
      >
        <Image src="/logo.png" alt="MenuAhora" width={320} height={110} priority />
      </div>

      {/* Subtítulo */}
      <p
        className="text-white/80 text-sm mt-6 transition-all duration-500 ease-out"
        style={{
          opacity: fase >= 2 ? 1 : 0,
          transform: fase >= 2 ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        Tu menú casero con delivery 🍳
      </p>

      {/* Puntos de carga */}
      <div
        className="flex gap-2 mt-8 transition-all duration-500"
        style={{ opacity: fase >= 2 ? 1 : 0 }}
      >
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Fade out */}
      <div
        className="fixed inset-0 bg-white pointer-events-none transition-opacity duration-500"
        style={{ opacity: fase >= 3 ? 1 : 0 }}
      />
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [fase, setFase] = useState(0);
  const [mostrar, setMostrar] = useState(true);

  useEffect(() => {
    setTimeout(() => setFase(1), 100);
    setTimeout(() => setFase(2), 800);
    setTimeout(() => setFase(3), 1800);
    setTimeout(() => setMostrar(false), 2400);
  }, []);

  if (!mostrar) return <>{children}</>;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 overflow-hidden"
        style={{
          opacity: fase >= 3 ? 0 : 1,
          transition: 'opacity 0.5s ease-out',
          pointerEvents: fase >= 3 ? 'none' : 'auto',
        }}
      >
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: fase >= 1 ? 1 : 0,
            transform: fase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(40px)',
          }}
        >
          <img src="/logo.png" alt="MenuAhora" style={{ width: '300px', height: 'auto' }} />
        </div>

        <p
          className="text-white/80 text-sm mt-6 transition-all duration-500 ease-out"
          style={{
            opacity: fase >= 2 ? 1 : 0,
            transform: fase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          Comida de casa sin salir de casa \ud83c\udfe0
        </p>

        <div
          className="flex gap-2 mt-8 transition-all duration-500"
          style={{ opacity: fase >= 2 ? 1 : 0 }}
        >
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      {children}
    </>
  );
}

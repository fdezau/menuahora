'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

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

  return null;
}

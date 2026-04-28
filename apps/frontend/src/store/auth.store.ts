import { create } from 'zustand';
import api from '@/lib/api';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'COCINERA' | 'CLIENTE';
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    set({ token: data.access_token, usuario: data.usuario, loading: false });
  },

  register: async (formData) => {
    set({ loading: true });
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    set({ token: data.access_token, usuario: data.usuario, loading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({ token: null, usuario: null });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (token && usuario) {
      set({ token, usuario: JSON.parse(usuario) });
    }
  },
}));

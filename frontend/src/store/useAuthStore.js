import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email, password, remember) => {
                const response = await api.post('/auth/login', { email, password, remember });
                const { token, user } = response.data;
                localStorage.setItem('abpharma_token', token);
                set({ user, token, isAuthenticated: true });
                return response.data;
            },

            logout: async () => {
                try { await api.post('/auth/logout'); } catch { }
                localStorage.removeItem('abpharma_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('abpharma_token');
                if (!token) { set({ isAuthenticated: false, user: null }); return; }
                try {
                    const res = await api.get('/auth/me');
                    set({ user: res.data.user, token, isAuthenticated: true });
                } catch {
                    localStorage.removeItem('abpharma_token');
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
        }),
        { name: 'abpharma-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
    )
);

export default useAuthStore;

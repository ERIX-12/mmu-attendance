import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),

            setUser: (user) => set({ user }),

            login: (userData, accessToken, refreshToken) =>
                set({ user: userData, accessToken, refreshToken }),

            logout: () => set({ user: null, accessToken: null, refreshToken: null }),

            isAuthenticated: () => !!get().accessToken,

            hasRole: (role) => get().user?.role === role,
        }),
        {
            name: 'mmu-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export default useAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            toggleTheme: () =>
                set((state) => {
                    const next = !state.isDark;
                    if (next) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { isDark: next };
                }),
            initTheme: () =>
                set((state) => {
                    if (state.isDark) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return state;
                }),
        }),
        { name: 'abpharma-theme' }
    )
);

export default useThemeStore;

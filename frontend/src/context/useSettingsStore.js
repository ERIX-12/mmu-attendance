import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
    persist(
        (set) => ({
            isDarkMode: false,
            primaryColor: '#0b52a1',
            secondaryColor: '#6c757d',
            successColor: '#43A047',
            warningColor: '#F9A825',
            errorColor: '#E53935',
            infoColor: '#039BE5',
            borderRadius: 12,
            shadowIntensity: 30,
            fontSize: 16,
            textScaling: 100,
            fontFamily: '"Inter", "Segoe UI", sans-serif',

            setSettings: (settings) => set((state) => ({ ...state, ...settings })),
            resetSettings: () => set({
                isDarkMode: false,
                primaryColor: '#0b52a1',
                secondaryColor: '#6c757d',
                successColor: '#43A047',
                warningColor: '#F9A825',
                errorColor: '#E53935',
                infoColor: '#039BE5',
                borderRadius: 12,
                shadowIntensity: 30,
                fontSize: 16,
                textScaling: 100,
            }),
        }),
        {
            name: 'mmu-settings',
        }
    )
);

export default useSettingsStore;

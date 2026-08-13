import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDarkModeStore = create(
  persist(
    (set) => ({
      globalDarkState: false,
      toggleDarkMode: () =>
        set((state) => ({
          globalDarkState: !state.globalDarkState,
        })),
    }),
    {
      name: "dark-mode-storage", // key in localStorage
    }
  )
);

export const useNavigationStore = create(
  persist(
    (set) => ({
      active: "dashboard",
      setActive: (active) => set({ active }),
    }),
    {
      name: "active-tab-storage",
    }
  )
);

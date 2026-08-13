import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logout } from "../Services/userService";

export const userAuthenticatedStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,

      setUser: (userId) =>
        set(() => ({
          isAuthenticated: true,
          userId,
        })),

      clearUser: () =>
        set(() => ({
          isAuthenticated: false,
          userId: null,
        })),

      logoutUser: () => {
        // logout();
        localStorage.removeItem("authenticated-data-storage");
        localStorage.removeItem("active-tab-storage");
      },
    }),
    {
      name: "authenticated-data-storage", // localStorage key
      getStorage: () => localStorage,
    }
  )
);

export const useSideBarStore = create(
  persist((set) => ({
    isSideBarOpen: true,
    toggleSideBar: () =>
      set((state) => ({ isSideBarOpen: !state.isSideBarOpen })),
  })),
  {
    name: "sidebar-storage",
  }
);

import { create } from "zustand";

export const useTokenStore = create((set) => ({
  accessToken: "",
  setAccessToken: (value) => set({ accessToken: value }),
}));

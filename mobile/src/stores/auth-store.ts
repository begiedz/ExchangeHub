import { create } from 'zustand';

type AuthStore = {
  isLoggedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthStore>(set => ({
  isLoggedIn: false,

  signIn: () => {
    set({ isLoggedIn: true });
  },

  signOut: () => {
    set({ isLoggedIn: false });
  },
}));

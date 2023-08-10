import create from "zustand";

export type TransitionStore = {
  enable: boolean;
  duration: number;
  setDuration: (duration: number) => void;
  setDefaultDuration: () => void;
  setInstantDuration: () => void;
};

export const useTransitionStore = create<TransitionStore>((set) => ({
  enable: true,
  duration: 400,
  setDuration: (duration) => set({ duration }),
  setDefaultDuration: () => set({ duration: 400 }),
  setInstantDuration: () => set({ duration: 0 }),
}));

import create from "zustand";

type TransitionStore = {
  duration: number;
  setDefaultDuration: () => void;
  setInstantDuration: () => void;
};

export const useTransitionStore = create<TransitionStore>((set) => ({
  duration: 400,
  setDefaultDuration: () => set({ duration: 400 }),
  setInstantDuration: () => set({ duration: 0 }),
}));

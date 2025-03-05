import create from "zustand";

export type TransitionStore = {
  enable: boolean;
  setEnable: (enable: boolean) => void;
  brushing: boolean;
  setBrushing: (isBrushing: boolean) => void;
  duration: number;
  setDuration: (duration: number) => void;
  setDefaultDuration: () => void;
};

export const useTransitionStore = create<TransitionStore>((set) => ({
  enable: true,
  setEnable: (enable) => set({ enable }),
  brushing: false,
  setBrushing: (brushing) => set({ brushing }),
  duration: 400,
  setDuration: (duration) => set({ duration }),
  setDefaultDuration: () => set({ duration: 400 }),
}));

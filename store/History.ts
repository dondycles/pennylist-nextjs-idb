import { idb } from "@/lib/idb";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { History } from "@/types/History";

export type HistoryStore = {
  histories: History[];
  addHistory: (history: History) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      histories: [],
      addHistory: (h) =>
        set(({ histories }) => {
          return { histories: [...histories, h] };
        }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "histories",
      storage: createJSONStorage(() => idb),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idb } from "@/lib/idb";
import { ListOrderOptions } from "@/lib/contants";

export type ListSettingsStore = {
  order: ListOrderOptions;
  setOrder: (order: ListOrderOptions) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
};

export const useListSettingsStore = create<ListSettingsStore>()(
  persist(
    (set) => ({
      order: {
        by: "date",
        flow: [{ value: "first-to-last", label: "First to last" }],
      },
      setOrder: (order) =>
        set(() => {
          return { order };
        }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      currency: "php",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "list-order",
      storage: createJSONStorage(() => idb),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);

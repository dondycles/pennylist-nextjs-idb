import { idb } from "@/lib/idb";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { History } from "@/types/History";

export type HistoryStore = {
  histories: History[];
  addHistory: (history: History) => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      histories: [],
      addHistory: (h) =>
        set(({ histories }) => {
          return { histories: [...histories, h] };
        }),
    }),
    {
      name: "histories",
      storage: createJSONStorage(() => idb),
    }
  )
);

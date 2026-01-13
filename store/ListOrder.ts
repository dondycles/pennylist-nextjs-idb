import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idb } from "@/lib/idb";
import { ListOrderOptions } from "@/lib/contants";

export type ListOrder = {
  order: ListOrderOptions;
  setOrder: (order: ListOrderOptions) => void;
};

export const useListOrderStore = create<ListOrder>()(
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
    }),
    {
      name: "list-order",
      storage: createJSONStorage(() => idb),
    }
  )
);

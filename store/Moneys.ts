import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Money } from "@/types/Money";
import { idb } from "@/lib/idb";

export type MoneysStore = {
  moneys: Money[];
  add: (money: Money) => void;
  remove: (money: Money) => void;
  edit: (money: Money) => void;
};

export const useMoneysStore = create<MoneysStore>()(
  persist(
    (set) => ({
      moneys: [],
      add: (money) =>
        set(({ moneys }) => {
          const newMoneys: Money[] = [...moneys, money];

          return { moneys: newMoneys };
        }),
      remove: (moneyToBeRemoved) => {
        set(({ moneys }) => {
          const newMoneys: Money[] = [
            ...moneys.filter((money) => money.id !== moneyToBeRemoved.id),
          ];
          return { moneys: newMoneys };
        });
      },
      edit: (moneyToBeEdited) =>
        set(({ moneys }) => {
          const moneyToBeEditedOldData = moneys.find(
            (money) => money.id === moneyToBeEdited.id
          );
          if (!moneyToBeEditedOldData) return { moneys };

          const newMoneys = [
            ...moneys.filter((money) => money.id !== moneyToBeEditedOldData.id),
            moneyToBeEdited,
          ];

          return {
            moneys: newMoneys,
          };
        }),
    }),
    {
      name: "moneys",
      storage: createJSONStorage(() => idb),
    }
  )
);

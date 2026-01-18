import { create } from "zustand";
import type { Money } from "@/types/Money";

export type ActionConfirmStore = {
  moneyInAction: Money | undefined;
  setMoneyInAction: (money: Money | undefined) => void;
  typeOfAction:
    | "removeMoney"
    | "saveMoney"
    | "editMoney"
    | "transferMoney"
    | undefined;
  setTypeOfAction: (
    type: "removeMoney" | "saveMoney" | "editMoney" | undefined,
  ) => void;
  openDialog: boolean;
  setOpenDialog: (state: boolean) => void;
  moneyInActionNewData: Money | undefined;
  setMoneyInActionNewData: (money: Money | undefined) => void;
};

export const useActionConfirmStore = create<ActionConfirmStore>()((set) => ({
  moneyInAction: undefined,
  setMoneyInAction: (moneyInAction) =>
    set(() => {
      return { moneyInAction };
    }),
  typeOfAction: undefined,
  setTypeOfAction: (type) =>
    set(() => {
      return { typeOfAction: type };
    }),
  openDialog: false,
  setOpenDialog: (state) =>
    set(() => {
      return { openDialog: state };
    }),
  moneyInActionNewData: undefined,
  setMoneyInActionNewData: (moneyInActionNewData) =>
    set(() => {
      return { moneyInActionNewData };
    }),
}));

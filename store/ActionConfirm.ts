import { create } from "zustand";
import type { Money, MoneyTransfer } from "@/types/Money";

export type ActionConfirmStore = {
  typeOfAction:
    | "removeMoney"
    | "saveMoney"
    | "editMoney"
    | "transferMoney"
    | "reset"
    | undefined;
  setTypeOfAction: (
    type:
      | "removeMoney"
      | "saveMoney"
      | "editMoney"
      | "transferMoney"
      | "reset"
      | undefined,
  ) => void;

  openDialog: boolean;
  setOpenDialog: (state: boolean) => void;

  moneyInActionForEditOrRemove: Money | undefined;
  setMoneyInActionForEditOrRemove: (money: Money | undefined) => void;

  moneyInActionNewDataForEditOrRemove: Money | undefined;
  setMoneyInActionNewDataForEditOrRemove: (money: Money | undefined) => void;

  moneysInActionForTransfer: MoneyTransfer | undefined;
  setMoneysInActionForTransfer: (money: MoneyTransfer | undefined) => void;
};

export const useActionConfirmStore = create<ActionConfirmStore>()((set) => ({
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

  moneyInActionForEditOrRemove: undefined,
  setMoneyInActionForEditOrRemove: (moneyInActionForEditOrRemove) =>
    set(() => {
      return { moneyInActionForEditOrRemove };
    }),

  moneyInActionNewDataForEditOrRemove: undefined,
  setMoneyInActionNewDataForEditOrRemove: (
    moneyInActionNewDataForEditOrRemove,
  ) =>
    set(() => {
      return { moneyInActionNewDataForEditOrRemove };
    }),

  moneysInActionForTransfer: undefined,
  setMoneysInActionForTransfer: (moneysInActionForTransfer) =>
    set(() => {
      return { moneysInActionForTransfer };
    }),
}));
